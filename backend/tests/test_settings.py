import pytest

from app.pipeline.settings import PipelineSettings


@pytest.mark.small
def test_pipeline_settings_speed() -> None:
    assert PipelineSettings(speed="normal").stage_pause_s == 5
    assert PipelineSettings(speed="fast").stage_pause_s == 1


@pytest.mark.small
def test_pipeline_settings_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("SOURCE_TIMEOUT_S", "SOURCE_ATTEMPTS"):
        monkeypatch.delenv("PIPELINE_" + name, raising=False)
    s = PipelineSettings()
    assert s.source_timeout_s == 3
    assert s.source_attempts == 3
