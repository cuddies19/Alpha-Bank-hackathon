from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.settings import settings


def sa_url(url: str) -> str:
    """Make a plain postgresql:// URL use the psycopg 3 driver."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


engine = create_engine(sa_url(settings.database_url))
SessionLocal = sessionmaker(engine, expire_on_commit=False)
