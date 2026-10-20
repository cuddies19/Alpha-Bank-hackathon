import json
from fractions import Fraction
from pathlib import Path

import pytest

SEEDS_DIR = Path(__file__).resolve().parents[1] / "seeds"
SEED_FILES = sorted(SEEDS_DIR.glob("*.json"))
REQUIRED_KEYS = {"inn", "egrul", "fns", "bki", "statement"}


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.mark.small
def test_seed_files_exist() -> None:
    assert len(SEED_FILES) == 4


@pytest.mark.small
@pytest.mark.parametrize("path", SEED_FILES, ids=lambda p: p.stem)
def test_seed_has_required_keys(path: Path) -> None:
    seed = _load(path)
    assert seed.keys() >= REQUIRED_KEYS
    assert seed["inn"] == path.stem
    assert len(seed["statement"]["months"]) == 12


@pytest.mark.small
@pytest.mark.parametrize("path", SEED_FILES, ids=lambda p: p.stem)
def test_avg_net_flow_is_mean_of_months(path: Path) -> None:
    statement = _load(path)["statement"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in statement["months"]]
    assert Fraction(sum(nets), len(nets)) == statement["avg_net_flow_rub"]


@pytest.mark.small
def test_igor_avg_net_flow_is_610000() -> None:
    statement = _load(SEEDS_DIR / "7701234567.json")["statement"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in statement["months"]]
    assert sum(nets) == 610_000 * 12
    assert statement["avg_net_flow_rub"] == 610_000
