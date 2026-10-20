from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Postgres connection string.
    database_url: str = "postgresql://app:app@localhost:5432/app"
    # Base URL of the mocks service.
    mocks_url: str = "http://localhost:8090"


settings = Settings()
