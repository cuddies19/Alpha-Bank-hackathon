"""Worker: python -m app.pipeline.worker

Runs submitted applications through the stages. A Postgres NOTIFY only wakes the worker;
the applications table is the queue and is claimed with SKIP LOCKED.
On start, applications left in `processing` by a crash are processed again from the start.
"""

import asyncio
import contextlib
import logging
import signal
import sys
from typing import Any

import psycopg
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.db import SessionLocal
from app.pipeline import demo, store
from app.pipeline.settings import pipeline_settings
from app.pipeline.sources import enrich as enrich_sources
from app.pipeline.stages import EnrichFn, process_application
from app.pipeline.texts import R_CLAIMED

log = logging.getLogger(__name__)

BATCH = 10
CHANNEL = "applications_submitted"
RECONNECT_PAUSE_S = 1.5


def claim(factory: sessionmaker[Session] = SessionLocal, limit: int = BATCH) -> list[int]:
    """Move submitted applications to processing in one short transaction."""
    claimed = []
    with factory.begin() as s:
        for app in store.take_submitted(s, limit):
            if store.move(s, app.id, "processing", R_CLAIMED):
                claimed.append(app.id)
    return claimed


def recover_stuck(factory: sessionmaker[Session] = SessionLocal) -> list[int]:
    """Ids left in `processing` by a crashed run (we run a single worker)."""
    with factory.begin() as s:
        return store.stuck_ids(s)


def start(
    factory: sessionmaker[Session],
    ids: list[int],
    enrich: EnrichFn,
    pause_s: float,
    running: set[asyncio.Task],
) -> None:
    if not ids:
        return
    # The demo speed is read when applications start, so a change applies to new ones.
    with factory.begin() as s:
        pause_s /= demo.get_speed(s)
    for app_id in ids:
        task = asyncio.create_task(process_application(factory, app_id, enrich, pause_s))
        running.add(task)
        task.add_done_callback(running.discard)


async def poll(
    factory: sessionmaker[Session],
    enrich: EnrichFn,
    pause_s: float,
    running: set[asyncio.Task],
) -> int:
    """Claim free capacity and start a task per application; returns how many were started."""
    free = BATCH - len(running)
    ids = claim(factory, free) if free > 0 else []
    start(factory, ids, enrich, pause_s, running)
    return len(ids)


async def run_once(factory: sessionmaker[Session], enrich: EnrichFn, pause_s: float) -> int:
    running: set[asyncio.Task] = set()
    started = await poll(factory, enrich, pause_s, running)
    await asyncio.gather(*running)
    return started


def _stop_on_signals(stop: asyncio.Event) -> None:
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            loop.add_signal_handler(sig, stop.set)
        except NotImplementedError:  # Windows event loop
            signal.signal(sig, lambda *_: loop.call_soon_threadsafe(stop.set))


async def _listen(conn: psycopg.AsyncConnection, wake: asyncio.Event) -> None:
    async for _ in conn.notifies():
        wake.set()


async def wait_for_work(
    listener: asyncio.Task,
    wake: asyncio.Event,
    stop: asyncio.Event,
    running: set[asyncio.Task],
    safety_poll_s: float,
) -> None:
    """Return when a notify, a stop, a free slot (with a backlog) or the safety timeout comes."""
    own = [asyncio.create_task(wake.wait()), asyncio.create_task(stop.wait())]
    # With a backlog, a finished task means free capacity.
    backlog = set(running) if len(running) >= BATCH else set()
    try:
        done, _ = await asyncio.wait(
            {*own, *backlog, listener}, timeout=safety_poll_s, return_when=asyncio.FIRST_COMPLETED
        )
    finally:
        for t in own:
            t.cancel()
        await asyncio.gather(*own, return_exceptions=True)
    if listener in done:
        listener.result()  # raises if the connection broke
        raise ConnectionError("listen connection closed")


async def listen_and_work(
    factory: sessionmaker[Session],
    enrich: EnrichFn,
    pause_s: float,
    dsn: str,
    safety_poll_s: float,
    stop: asyncio.Event,
    running: set[asyncio.Task],
) -> None:
    """One listen connection: claim, wait, repeat until stop or an error."""
    async with await psycopg.AsyncConnection.connect(dsn, autocommit=True) as conn:
        await conn.execute(f"LISTEN {CHANNEL}")
        wake = asyncio.Event()
        listener = asyncio.create_task(_listen(conn, wake))
        try:
            while not stop.is_set():
                wake.clear()
                await poll(factory, enrich, pause_s, running)
                await wait_for_work(listener, wake, stop, running, safety_poll_s)
        finally:
            listener.cancel()
            await asyncio.gather(listener, return_exceptions=True)


async def serve(
    factory: sessionmaker[Session],
    enrich: EnrichFn,
    pause_s: float,
    dsn: str,
    safety_poll_s: float,
    stop: asyncio.Event,
    running: set[asyncio.Task],
) -> None:
    """Claim on start, on notify, on reconnect, when capacity frees up, and every safety_poll_s."""
    while not stop.is_set():
        try:
            await listen_and_work(factory, enrich, pause_s, dsn, safety_poll_s, stop, running)
        except (psycopg.Error, OSError) as e:
            log.warning("listen connection lost: %s", e)
        except Exception:
            log.exception("worker loop failed, reconnecting")
        if not stop.is_set():
            with contextlib.suppress(TimeoutError):
                await asyncio.wait_for(stop.wait(), RECONNECT_PAUSE_S)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    cfg = pipeline_settings

    async def enrich(inn: str, consent_id: str) -> dict[str, dict[str, Any]]:
        return await enrich_sources(
            inn,
            consent_id,
            cfg.mocks_url,
            cfg.source_timeout_s,
            cfg.source_attempts,
            cfg.retry_pause_s,
        )

    stop = asyncio.Event()
    _stop_on_signals(stop)
    running: set[asyncio.Task] = set()
    stuck = recover_stuck()
    log.info("processing again %d interrupted applications", len(stuck))
    start(SessionLocal, stuck, enrich, cfg.stage_pause_s, running)
    log.info("worker started, speed=%s", cfg.speed)
    await serve(
        factory=SessionLocal,
        enrich=enrich,
        pause_s=cfg.stage_pause_s,
        dsn=get_settings().database_url.replace("+psycopg", ""),
        safety_poll_s=cfg.safety_poll_s,
        stop=stop,
        running=running,
    )
    log.info("stopping, waiting for %d applications", len(running))
    await asyncio.gather(*running)


def run(coro: Any) -> Any:
    # psycopg async needs the selector loop, which is not the default on Windows.
    loop_factory = asyncio.SelectorEventLoop if sys.platform == "win32" else None
    return asyncio.run(coro, loop_factory=loop_factory)


if __name__ == "__main__":
    run(main())
