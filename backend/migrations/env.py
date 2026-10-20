from alembic import context
from sqlalchemy import create_engine

from app.db.models import Base
from app.db.session import sa_url
from app.settings import settings

config = context.config
# Tests may set sqlalchemy.url; otherwise use the app settings.
url = config.get_main_option("sqlalchemy.url") or sa_url(settings.database_url)

if context.is_offline_mode():
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = create_engine(url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()
