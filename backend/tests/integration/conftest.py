import asyncio
import os
import uuid
from pathlib import Path

import psycopg
import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker

from alembic import command
from app.config import get_settings
from app.main import app
from app.models import Application, ApplicationStatus, Company, Document, Product, User
from app.pipeline import worker
from app.services.seed import seed_demo_data
from app.state.machine import actor_from_user, transition

BACKEND = Path(__file__).resolve().parents[2]
TRIGGER_COUNT = (
    "select count(*) from pg_trigger "
    "where tgname = 'applications_notify_submitted' and tgrelid = 'applications'::regclass"
)
CLEAN = "truncate applications, audit_log, notifications restart identity cascade"

_unreachable: list[str] = []


def _unavailable(reason: str) -> None:
    # In CI a missing database is a failure, not a skip.
    if os.environ.get("CI"):
        pytest.fail(reason)
    pytest.skip(reason)


def _migrate(url: URL) -> None:
    """Run `alembic upgrade head` on url (alembic reads the url from the settings)."""
    old = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = url.render_as_string(hide_password=False)
    get_settings.cache_clear()
    try:
        command.upgrade(Config(str(BACKEND / "alembic.ini")), "head")
    finally:
        if old is None:
            del os.environ["DATABASE_URL"]
        else:
            os.environ["DATABASE_URL"] = old
        get_settings.cache_clear()


@pytest.fixture(scope="session")
def pg_url() -> URL:
    """URL of a fresh database with migrations applied and demo data; dropped at the end."""
    if _unreachable:
        _unavailable(_unreachable[0])
    base = make_url(get_settings().database_url)
    admin = create_engine(base, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 1})
    name = "t_" + uuid.uuid4().hex[:12]
    try:
        with admin.connect() as conn:
            conn.execute(text(f"create database {name}"))
    except OperationalError:
        _unreachable.append("Postgres is not reachable at DATABASE_URL")
        admin.dispose()
        _unavailable(_unreachable[0])
    url = base.set(database=name)
    try:
        _migrate(url)
        engine = create_engine(url)
        with sessionmaker(engine)() as db:
            seed_demo_data(db)
        engine.dispose()
        yield url
    finally:
        with admin.connect() as conn:
            conn.execute(text(f"drop database if exists {name} with (force)"))
        admin.dispose()


@pytest.fixture(scope="session")
def engine(pg_url):
    engine = create_engine(pg_url)
    yield engine
    engine.dispose()


@pytest.fixture
def factory(engine):
    """Sessions like Core's SessionLocal, on an empty applications table."""
    with engine.begin() as conn:
        conn.execute(text(CLEAN))
    return sessionmaker(engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def new_application(factory, applications):
    """Create an application from applications.json; returns its id."""

    def create(name: str = "igor", submit: bool = False) -> int:
        data = applications[name]
        with factory.begin() as db:
            company = db.scalar(select(Company).where(Company.inn == data["inn"]))
            product = db.scalar(select(Product).where(Product.code == data["product"]))
            user = db.scalar(select(User).where(User.company_id == company.id))
            application = Application(
                number="T-" + uuid.uuid4().hex[:10],
                company_id=company.id,
                product_id=product.id,
                amount=data["amount"],
                term_months=data["term_months"],
                purpose="test",
                consents=data["consents"],
                status=ApplicationStatus.draft,
                created_by_id=user.id,
            )
            application.documents = [
                Document(
                    doc_type=doc_type,
                    filename=f"{doc_type}.pdf",
                    path=f"{doc_type}.pdf",
                    mime_type="application/pdf",
                    size_bytes=1,
                    uploaded_by_id=user.id,
                )
                for doc_type in data["documents"]
            ]
            db.add(application)
            db.flush()
            if submit:
                transition(db, application, ApplicationStatus.submitted, actor_from_user(user))
            return application.id

    return create


@pytest.fixture
def no_sleep():
    async def no_sleep(_: float) -> None:
        return None

    return no_sleep


# Notifications


@pytest.fixture
def app_name() -> str:
    return "t_" + uuid.uuid4().hex[:12]


@pytest.fixture
def dsn(pg_url, app_name) -> str:
    url = pg_url.set(drivername="postgresql").update_query_dict({"application_name": app_name})
    return url.render_as_string(hide_password=False)


@pytest.fixture
def trigger_count(engine):
    def count() -> int:
        with engine.connect() as conn:
            return conn.execute(text(TRIGGER_COUNT)).scalar_one()

    return count


@pytest.fixture
def insert_application(new_application, factory):
    """Create an application straight in the given status (draft or submitted)."""

    def insert(status: str) -> int:
        app_id = new_application()
        if status != "draft":
            set_status(factory, app_id, status)
        return app_id

    return insert


def set_status(factory, app_id: int, status: str) -> None:
    with factory.begin() as db:
        db.get(Application, app_id).status = ApplicationStatus(status)


@pytest.fixture
def change_status(factory):
    def change(app_id: int, status: str) -> None:
        set_status(factory, app_id, status)

    return change


@pytest.fixture
def touch_application(factory):
    def touch(app_id: int) -> None:
        with factory.begin() as db:
            db.get(Application, app_id).amount = 5

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
        self.task = asyncio.create_task(
            worker.serve(self.factory, None, 0, self.dsn, 1000, self.stop, set())
        )

    async def finish(self) -> None:
        self.stop.set()
        await asyncio.wait_for(self.task, 5)


@pytest.fixture
def server(factory, dsn, monkeypatch):
    srv = Server(factory, dsn)
    monkeypatch.setattr(worker, "poll", srv.poll)
    monkeypatch.setattr(worker, "RECONNECT_PAUSE_S", 0.05)
    return srv
