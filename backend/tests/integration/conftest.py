import asyncio
import os
import uuid
from pathlib import Path

import psycopg
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker

from app.db import store
from app.db.models import Base
from app.db.session import sa_url
from app.main import app
from app.pipeline import worker
from app.settings import settings

BACKEND = Path(__file__).resolve().parents[2]
INSERT = (
    "insert into applications (inn, product, amount_rub, term_months, status) "
    "values ('7701234567', 'overdraft', 1000000, 12, :status) returning id"
)
TRIGGER_COUNT = (
    "select count(*) from pg_trigger "
    "where tgname = 'applications_notify_submitted' and tgrelid = 'applications'::regclass"
)

_unreachable: list[str] = []


def _unavailable(reason: str) -> None:
    # In CI a missing database is a failure, not a skip.
    if os.environ.get("CI"):
        pytest.fail(reason)
    pytest.skip(reason)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def pg_url() -> URL:
    """URL of an empty schema in Postgres; the schema is removed after the test."""
    if _unreachable:
        _unavailable(_unreachable[0])
    base = make_url(sa_url(settings.database_url))
    admin = create_engine(base, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 1})
    schema = "t_" + uuid.uuid4().hex[:12]
    try:
        with admin.connect() as conn:
            conn.execute(text(f"create schema {schema}"))
    except OperationalError:
        _unreachable.append("Postgres is not reachable at DATABASE_URL")
        admin.dispose()
        _unavailable(_unreachable[0])
    try:
        yield base.update_query_dict({"options": f"-csearch_path={schema}"})
    finally:
        with admin.connect() as conn:
            conn.execute(text(f"drop schema {schema} cascade"))
        admin.dispose()


@pytest.fixture
def factory(pg_url):
    """Sessions on a schema built from the models."""
    engine = create_engine(pg_url)
    Base.metadata.create_all(engine)
    yield sessionmaker(engine, expire_on_commit=False)
    engine.dispose()


@pytest.fixture
def session(factory):
    with factory() as s:
        yield s


@pytest.fixture
def new_application(factory, applications):
    """Create an application from applications.json; returns its id."""

    def create(name: str = "igor", submit: bool = False) -> int:
        with factory.begin() as s:
            row = store.create_application(s, **applications[name])
            if submit:
                store.change_status(s, row.id, "submitted", "test")
            return row.id

    return create


@pytest.fixture
def no_sleep():
    async def no_sleep(_: float) -> None:
        return None

    return no_sleep


# Migrations and notifications


@pytest.fixture
def alembic_cfg(pg_url):
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "migrations"))
    cfg.set_main_option("sqlalchemy.url", pg_url.render_as_string(hide_password=False).replace("%", "%%"))
    return cfg


@pytest.fixture
def migrated_engine(alembic_cfg, pg_url):
    command.upgrade(alembic_cfg, "head")
    engine = create_engine(pg_url)
    yield engine
    engine.dispose()


@pytest.fixture
def app_name() -> str:
    return "t_" + uuid.uuid4().hex[:12]


@pytest.fixture
def dsn(pg_url, app_name) -> str:
    plain = pg_url.set(drivername="postgresql").render_as_string(hide_password=False)
    return f"{plain}&application_name={app_name}"


@pytest.fixture
def trigger_count(migrated_engine):
    def count() -> int:
        with migrated_engine.connect() as conn:
            return conn.execute(text(TRIGGER_COUNT)).scalar_one()

    return count


@pytest.fixture
def insert_application(migrated_engine):
    def insert(status: str) -> int:
        with migrated_engine.begin() as conn:
            return conn.execute(text(INSERT), {"status": status}).scalar_one()

    return insert


@pytest.fixture
def set_status(migrated_engine):
    def update(app_id: int, status: str) -> None:
        with migrated_engine.begin() as conn:
            conn.execute(
                text("update applications set status = :s where id = :id"), {"s": status, "id": app_id}
            )

    return update


@pytest.fixture
def touch_application(migrated_engine):
    def touch(app_id: int) -> None:
        with migrated_engine.begin() as conn:
            conn.execute(text("update applications set amount_rub = 5 where id = :id"), {"id": app_id})

    return touch


@pytest.fixture
def notified(dsn):
    def collect(action) -> list[str]:
        """Payloads of notifications sent while `action` runs."""
        with psycopg.connect(dsn, autocommit=True) as conn:
            conn.execute("LISTEN applications_submitted")
            action()
            return [n.payload for n in conn.notifies(timeout=0.5)]

    return collect


@pytest.fixture
def kill_listener(dsn, app_name):
    """Terminate the LISTEN connection(s) opened with this test's dsn."""

    def kill() -> int:
        sql = (
            "select pg_terminate_backend(pid) from pg_stat_activity "
            "where application_name = %s and query like 'LISTEN%%'"
        )
        with psycopg.connect(dsn, autocommit=True) as conn:
            return len(conn.execute(sql, (app_name,)).fetchall())

    return kill


class Server:
    """Runs worker.serve with a poll that only claims; records what it claimed."""

    def __init__(self, factory, dsn: str) -> None:
        self.factory, self.dsn = factory, dsn
        self.claimed: list[int] = []
        self.polled = asyncio.Event()

    async def poll(self, factory, enrich, pause_s, running) -> int:
        ids = worker.claim(factory)
        self.claimed += ids
        self.polled.set()
        return len(ids)

    async def start(self) -> None:
        self.stop = asyncio.Event()
        # safety poll is set high: only a notify or a reconnect can wake the worker
        self.task = asyncio.create_task(worker.serve(self.factory, None, 0, self.dsn, 1000, self.stop, set()))

    async def finish(self) -> None:
        self.stop.set()
        await asyncio.wait_for(self.task, 5)


@pytest.fixture
def server(migrated_engine, dsn, monkeypatch):
    srv = Server(sessionmaker(migrated_engine), dsn)
    monkeypatch.setattr(worker, "poll", srv.poll)
    monkeypatch.setattr(worker, "RECONNECT_PAUSE_S", 0.05)
    return srv
