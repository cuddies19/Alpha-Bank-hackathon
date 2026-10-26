"""Seed lookup with generator fallback: one function per source."""

import json

from app import generator
from app.settings import settings


def _seed(inn: str) -> dict | None:
    path = settings.seeds_dir / f"{inn}.json"
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def egrul(inn: str) -> dict:
    seed = _seed(inn)
    return seed["egrul"] if seed else generator.egrul(inn)


def fns(inn: str) -> dict:
    seed = _seed(inn)
    return seed["fns"] if seed else generator.fns(inn)


def bki(inn: str) -> dict:
    seed = _seed(inn)
    return seed["bki"] if seed else generator.bki(inn)


def statement(inn: str, months: int) -> dict:
    seed = _seed(inn)
    if not seed:
        return generator.statement(inn, months)
    data = dict(seed["statement"])
    data["months"] = data["months"][-months:]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in data["months"]]
    data["avg_net_flow_rub"] = round(sum(nets) / len(nets))
    return data
