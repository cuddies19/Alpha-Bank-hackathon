"""Per-source failure modes (in memory) and the delay applied before each source answers."""

import asyncio
import random

from fastapi import HTTPException

from app.settings import settings

SOURCES = ("egrul", "fns", "bki", "statement")
MODES = ("ok", "slow", "down", "error")

state: dict[str, dict] = {}


def parse_modes(text: str) -> dict[str, str]:
    """Parse "bki=down,fns=slow" into {"bki": "down", "fns": "slow"}."""
    result = {}
    for part in text.split(","):
        if not part.strip():
            continue
        source, _, mode = part.partition("=")
        source, mode = source.strip(), mode.strip()
        if source not in SOURCES or mode not in MODES:
            raise ValueError(f"bad mode entry: {part!r}")
        result[source] = mode
    return result


def set_mode(source: str, mode: str, delay_ms: int | None = None) -> None:
    if mode == "slow" and delay_ms is None:
        delay_ms = settings.slow_delay_ms
    state[source] = {"mode": mode, "delay_ms": delay_ms if mode == "slow" else None}


def reset() -> None:
    defaults = parse_modes(settings.default_modes)
    for source in SOURCES:
        set_mode(source, defaults.get(source, "ok"))


async def apply_mode(source: str) -> int:
    """Sleep as the source's mode demands. Returns the delay in ms (for X-Mock-Latency-Ms)."""
    delay_ms = random.randint(settings.jitter_min_ms, settings.jitter_max_ms)
    current = state[source]
    if current["mode"] == "slow":
        delay_ms += current["delay_ms"]
    await asyncio.sleep(delay_ms / 1000)
    if current["mode"] == "down":
        await asyncio.sleep(settings.down_hang_s)
    if current["mode"] == "error":
        raise HTTPException(
            status_code=500, detail="source error", headers={"X-Mock-Latency-Ms": str(delay_ms)}
        )
    return delay_ms


reset()
