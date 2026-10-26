import asyncio

import pytest
from fastapi import HTTPException

from app import modes
from app.settings import settings


@pytest.mark.positive
def test_set_mode_slow_uses_default_delay(app_data) -> None:
    modes.set_mode("fns", "slow")
    assert modes.state["fns"] == {"mode": "slow", "delay_ms": app_data["slow_default_ms"]}


@pytest.mark.positive
def test_set_mode_non_slow_drops_delay(app_data) -> None:
    modes.set_mode("fns", "down", app_data["slow_custom_ms"])
    assert modes.state["fns"] == {"mode": "down", "delay_ms": None}


@pytest.mark.positive
def test_reset_applies_default_modes(monkeypatch, app_data) -> None:
    monkeypatch.setattr(settings, "default_modes", app_data["default_modes"])
    modes.reset()
    assert modes.state["bki"]["mode"] == "down"
    assert modes.state["egrul"]["mode"] == "ok"


@pytest.mark.positive
@pytest.mark.parametrize("case", ["ok", "slow", "down"])
def test_apply_mode_sleeps(case, app_data, sleeps, fixed_jitter) -> None:
    spec = app_data["apply"][case]
    modes.set_mode("egrul", spec["mode"], spec.get("delay_ms"))
    delay = asyncio.run(modes.apply_mode("egrul"))
    assert sleeps == spec["sleeps"]
    assert delay == round(spec["sleeps"][0] * 1000)


@pytest.mark.negative
def test_apply_mode_error_raises_500(app_data, sleeps, fixed_jitter) -> None:
    modes.set_mode("egrul", "error")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(modes.apply_mode("egrul"))
    assert exc.value.status_code == 500
    assert exc.value.detail == app_data["error_detail"]
    assert exc.value.headers == {"X-Mock-Latency-Ms": str(fixed_jitter)}
