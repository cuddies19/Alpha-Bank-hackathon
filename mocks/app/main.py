from fastapi import FastAPI

from app import routes_admin, routes_sources

app = FastAPI(title="mocks")
app.include_router(routes_sources.router)
app.include_router(routes_admin.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
