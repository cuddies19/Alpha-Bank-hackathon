from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import applications, assistant, auth, bank, demo, loans, me, notifications, score
from app.config import get_settings
from app.db import SessionLocal
from app.errors import install_error_handlers
from app.services.seed import seed_demo_data

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    if settings.seed_on_startup:
        with SessionLocal() as db:
            seed_demo_data(db)
            logger.info("Demo users and product catalog are seeded")
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API кредитного кабинета предпринимателя: заявки, машина состояний, аудит, "
            "консоль андеррайтера. Деньги — в целых рублях."
        ),
        lifespan=lifespan,
        openapi_tags=[
            {"name": "auth", "description": "Вход и JWT"},
            {"name": "client", "description": "Клиентский кабинет"},
            {"name": "applications", "description": "Заявки и документы"},
            {"name": "bank", "description": "Консоль андеррайтера"},
            {"name": "assistant", "description": "ИИ-ассистент (Интеграции)"},
            {"name": "demo", "description": "Режим проверки жюри (Интеграции)"},
        ],
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    install_error_handlers(app)

    app.include_router(auth.router)
    app.include_router(me.router)
    app.include_router(applications.router)
    app.include_router(loans.router)
    app.include_router(notifications.router)
    app.include_router(bank.router)
    app.include_router(assistant.router)
    app.include_router(demo.router)
    app.include_router(score.router)

    @app.get("/health", tags=["service"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
