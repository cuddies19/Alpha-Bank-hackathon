from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MOCKS_")

    # Minimum artificial response delay in milliseconds.
    jitter_min_ms: int = 100
    # Maximum artificial response delay in milliseconds.
    jitter_max_ms: int = 600
    # Default per-source modes, e.g. "bki=down,fns=slow". Empty means all normal.
    default_modes: str = ""
    # Delay in milliseconds applied when a source is in "slow" mode.
    slow_delay_ms: int = 4000
    # Seconds a source in "down" mode hangs before giving up.
    down_hang_s: int = 120
    # Directory with per-INN seed files (<inn>.json).
    seeds_dir: Path = Path(__file__).resolve().parents[1] / "seeds"


settings = Settings()
