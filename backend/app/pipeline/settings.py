from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PIPELINE_")

    # normal = 5 s pause between stages, fast = 1 s.
    speed: Literal["normal", "fast"] = "normal"
    source_timeout_s: float = 3
    source_attempts: int = 3
    retry_pause_s: float = 0.5
    # DS scoring base URL; empty = use the stub (640 / B).
    scoring_url: str = ""
    # Fallback check in case a notification was missed.
    safety_poll_s: float = 30

    @property
    def stage_pause_s(self) -> float:
        return 1.0 if self.speed == "fast" else 5.0


pipeline_settings = PipelineSettings()
