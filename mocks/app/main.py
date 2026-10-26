import logging

from fastapi import FastAPI

from app import routes_admin, routes_sources
from app.settings import settings

log = logging.getLogger(__name__)

app = FastAPI(title="mocks")
app.include_router(routes_sources.router)
app.include_router(routes_admin.router)


@app.get("/health")
def health() -> dict:
    # seeds = number of demo clients loaded; 0 means every INN gets generated data
    seeds = len(list(settings.seeds_dir.glob("*.json")))
    if seeds == 0:
        log.warning("no seed files in %s", settings.seeds_dir)
    return {"status": "ok", "seeds": seeds}
