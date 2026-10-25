from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class AssistantSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ASSISTANT_")

    # auto = LLM when ollama_url is set, rules on any LLM error.
    mode: Literal["auto", "llm", "rules"] = "auto"
    # Empty = no LLM.
    ollama_url: str = ""
    model: str = "qwen2.5:3b-instruct"
    timeout_s: float = 30


assistant_settings = AssistantSettings()
