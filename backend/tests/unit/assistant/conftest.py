import json
from datetime import datetime

import httpx
import pytest
from sqlalchemy import create_engine, delete, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.assistant.settings import AssistantSettings
from app.models import (
    Application,
    ApplicationStatus,
    Base,
    Decision,
    DecisionOutcome,
    Loan,
    Product,
    User,
)
from app.services.seed import seed_demo_data
from tests.source_mocks import load_json


@pytest.fixture(scope="session")
def scenarios() -> dict:
    return load_json("assistant_scenarios")


@pytest.fixture
def session_factory():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as db:
        seed_demo_data(db)
    yield factory
    engine.dispose()


@pytest.fixture
def db(session_factory):
    with session_factory() as session:
        yield session


@pytest.fixture
def users(db) -> dict[str, User]:
    return {user.login: user for user in db.scalars(select(User))}


@pytest.fixture
def add_applications(db, users, scenarios):
    """Create the named applications from the scenarios file, return name -> id."""

    def add(names: list[str]) -> dict[str, int]:
        ids: dict[str, int] = {}
        for index, name in enumerate(names, start=1):
            data = scenarios["applications"][name]
            owner = users[data["owner"]]
            product = db.scalar(select(Product).where(Product.code == data["product_code"]))
            submitted = data.get("submitted_at")
            application = Application(
                number=f"A-{index:04d}",
                company_id=owner.company_id,
                product_id=product.id,
                amount=data["amount"],
                term_months=data["term_months"],
                purpose=data["purpose"],
                consents=data["consents"],
                status=ApplicationStatus(data["status"]),
                labels=[],
                created_by_id=owner.id,
                created_at=datetime(2026, 9, 1 + index),
                submitted_at=datetime.fromisoformat(submitted) if submitted else None,
            )
            db.add(application)
            db.flush()
            if "decision" in data:
                fields = {**data["decision"]}
                fields["outcome"] = DecisionOutcome(fields["outcome"])
                fields["decided_at"] = datetime.fromisoformat(fields["decided_at"])
                db.add(Decision(application_id=application.id, **fields))
            ids[name] = application.id
        db.commit()
        return ids

    return add


@pytest.fixture
def add_loan(db, users, scenarios):
    def add(ids: dict[str, int]) -> None:
        data = {**scenarios["loan"]}
        owner = users[data.pop("owner")]
        data["application_id"] = ids[data.pop("application")]
        db.add(Loan(company_id=owner.company_id, schedule=[], **data))
        db.commit()

    return add


@pytest.fixture(scope="session")
def llm_data() -> dict:
    return load_json("assistant_llm")


@pytest.fixture
def make_settings(llm_data):
    return lambda name: AssistantSettings(**llm_data["settings"][name])


@pytest.fixture
def ollama():
    """Fake Ollama: serves the scripted replies in order, keeps the requests it got."""

    def make(replies: list[dict]):
        requests: list[dict] = []
        queue = iter(replies)

        def handle(request: httpx.Request) -> httpx.Response:
            requests.append(json.loads(request.content))
            reply = next(queue)
            if reply.get("error") == "timeout":
                raise httpx.ReadTimeout("slow", request=request)
            if "text" in reply:
                return httpx.Response(200, text=reply["text"])
            return httpx.Response(reply.get("status", 200), json=reply["json"])

        return httpx.MockTransport(handle), requests

    return make


@pytest.fixture
def drop_products(db):
    def drop() -> None:
        db.execute(delete(Product))
        db.commit()

    return drop
