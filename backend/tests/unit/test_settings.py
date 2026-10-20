import pytest

from app.pipeline.settings import PipelineSettings


@pytest.mark.positive
def test_pipeline_settings_speed(expected) -> None:
    assert PipelineSettings(speed="normal").stage_pause_s == expected["speed"]["normal"]
    assert PipelineSettings(speed="fast").stage_pause_s == expected["speed"]["fast"]


@pytest.mark.positive
def test_pipeline_settings_defaults(monkeypatch: pytest.MonkeyPatch, expected) -> None:
    for name in ("SOURCE_TIMEOUT_S", "SOURCE_ATTEMPTS"):
        monkeypatch.delenv("PIPELINE_" + name, raising=False)
    s = PipelineSettings()
    assert s.source_timeout_s == expected["defaults"]["source_timeout_s"]
    assert s.source_attempts == expected["defaults"]["source_attempts"]


@pytest.mark.positive
def test_safety_poll_default(monkeypatch: pytest.MonkeyPatch, expected) -> None:
    monkeypatch.delenv("PIPELINE_SAFETY_POLL_S", raising=False)
    assert PipelineSettings().safety_poll_s == expected["defaults"]["safety_poll_s"]
