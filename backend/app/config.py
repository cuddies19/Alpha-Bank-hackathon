from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_JWT_SECRET = "dev-secret-change-me-please-use-32-bytes"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Кредитный кабинет API"
    app_version: str = "0.1.0"
    app_env: str = "dev"
    database_url: str = "postgresql+psycopg://cabinet:cabinet@localhost:5432/cabinet"
    jwt_secret: str = DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    demo_password: str = "demo123"
    upload_dir: Path = Path("data/uploads")
    max_upload_size: int = 10 * 1024 * 1024
    cors_origins: str = "http://localhost:5173,http://localhost:4173"
    seed_on_startup: bool = True

    @model_validator(mode="after")
    def _require_secret_outside_dev(self) -> Settings:
        if self.app_env != "dev" and self.jwt_secret == DEFAULT_JWT_SECRET:
            raise ValueError("JWT_SECRET обязателен при APP_ENV != dev")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
