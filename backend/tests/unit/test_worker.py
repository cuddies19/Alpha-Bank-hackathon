import asyncio
import signal
from types import SimpleNamespace

import psycopg
import pytest

from app.pipeline import worker
from tests.unit.fakes import FakeConnection, FakeFactory, row

PAUSE = 0.25


async def hang() -> None:
    await asyncio.Event().wait()


async def cancel_all(*tasks: asyncio.Task) -> None:
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)


async def no_enrich(inn: str, consent_id: str) -> dict:
    return {}


@pytest.fixture
def processed(monkeypatch):
    """Replace process_application with a recorder of application ids."""
    ids: list[int] = []

    async def fake(factory, app_id, enrich, pause_s, sleep=None) -> None:
        ids.append(app_id)

    monkeypatch.setattr(worker, "process_application", fake)
    return ids


@pytest.fixture
def submitted(worker_store, applications, unit):
    worker_store.submitted = [row(applications["igor"], i) for i in unit["submitted_ids"]]
    return worker_store


@pytest.fixture
def connection(monkeypatch):
    """Install a FakeConnection as the result of psycopg.AsyncConnection.connect."""
    holder = SimpleNamespace(conn=FakeConnection(), dsns=[])

    async def connect(dsn, **kwargs):
        holder.dsns.append((dsn, kwargs))
        return holder.conn

    monkeypatch.setattr(psycopg.AsyncConnection, "connect", connect)
    return holder


@pytest.fixture
def polls(monkeypatch):
    """Replace poll with a recorder; it asks to stop on call number `stop_after`."""
    state = SimpleNamespace(calls=0, stop_after=2, stop=None)

    async def fake(factory, enrich, pause_s, running) -> int:
        state.calls += 1
        if state.calls >= state.stop_after:
            state.stop.set()
        return 0

    monkeypatch.setattr(worker, "poll", fake)
    return state


# claim / recover_stuck


@pytest.mark.positive
def test_claim_moves_submitted_to_processing(submitted, factory, unit, expected) -> None:
    ids = worker.claim(factory, 10)
    assert ids == unit["submitted_ids"]
    assert submitted.statuses == ["processing"] * 3
    assert {m.comment for m in submitted.moves} == {expected["claimed_comment"]}
    assert [m.app_id for m in submitted.moves] == ids
    assert len(factory.sessions) == 1


@pytest.mark.negative
def test_claim_skips_applications_that_cannot_move(submitted, factory) -> None:
    submitted.refuse = {"processing"}
    assert worker.claim(factory, 10) == []


@pytest.mark.positive
def test_claim_respects_limit(submitted, factory) -> None:
    assert len(worker.claim(factory, 2)) == 2


@pytest.mark.positive
def test_claim_with_nothing_submitted(worker_store, factory) -> None:
    assert worker.claim(factory, 10) == []
    assert worker_store.moves == []


@pytest.mark.positive
def test_recover_stuck_returns_applications_left_in_processing(worker_store, factory, unit) -> None:
    worker_store.stuck = unit["stuck_ids"]
    assert worker.recover_stuck(factory) == unit["stuck_ids"]
    assert worker_store.moves == []


@pytest.mark.positive
def test_recover_stuck_with_nothing_stuck(worker_store, factory) -> None:
    assert worker.recover_stuck(factory) == []


# poll / run_once


@pytest.mark.positive
def test_poll_starts_a_task_per_claimed_application(
    submitted, factory, processed, run, unit
) -> None:
    async def scenario():
        running: set[asyncio.Task] = set()
        started = await worker.poll(factory, no_enrich, PAUSE, running)
        in_flight = len(running)
        await asyncio.gather(*running)
        await asyncio.sleep(0)
        return started, in_flight, running

    started, in_flight, running = run(scenario())
    assert started == len(unit["submitted_ids"])
    assert in_flight == started
    assert sorted(processed) == unit["submitted_ids"]
    assert running == set()  # finished tasks leave the set


@pytest.mark.negative
def test_poll_claims_nothing_when_at_capacity(submitted, factory, processed, run) -> None:
    async def scenario():
        running = {asyncio.create_task(hang()) for _ in range(worker.BATCH)}
        started = await worker.poll(factory, no_enrich, PAUSE, running)
        await cancel_all(*running)
        return started

    assert run(scenario()) == 0
    assert submitted.moves == []
    assert processed == []


@pytest.mark.positive
def test_poll_claims_only_free_capacity(submitted, factory, processed, run) -> None:
    async def scenario():
        running = {asyncio.create_task(hang()) for _ in range(worker.BATCH - 1)}
        started = await worker.poll(factory, no_enrich, PAUSE, running)
        await cancel_all(*running)
        return started

    assert run(scenario()) == 1


@pytest.mark.positive
def test_run_once_processes_everything_then_returns(
    submitted, factory, processed, run, unit
) -> None:
    started = run(worker.run_once(factory, no_enrich, PAUSE))
    assert started == len(unit["submitted_ids"])
    assert sorted(processed) == unit["submitted_ids"]


# signals


@pytest.fixture
def loop_signals(monkeypatch):
    """Record add_signal_handler / signal.signal instead of touching the process."""
    rec = SimpleNamespace(loop_handlers={}, fallback_handlers={}, loop_supported=True)

    def add_signal_handler(loop, sig, callback, *args):
        if not rec.loop_supported:
            raise NotImplementedError
        rec.loop_handlers[sig] = callback

    monkeypatch.setattr(
        asyncio.SelectorEventLoop, "add_signal_handler", add_signal_handler, raising=False
    )
    if hasattr(asyncio, "ProactorEventLoop"):
        monkeypatch.setattr(
            asyncio.ProactorEventLoop, "add_signal_handler", add_signal_handler, raising=False
        )
    monkeypatch.setattr(
        signal, "signal", lambda sig, handler: rec.fallback_handlers.__setitem__(sig, handler)
    )
    return rec


@pytest.mark.positive
def test_signals_use_loop_handlers_when_supported(loop_signals, run) -> None:
    async def scenario():
        stop = asyncio.Event()
        worker._stop_on_signals(stop)
        return stop

    stop = run(scenario())
    assert {signal.SIGTERM, signal.SIGINT} <= set(loop_signals.loop_handlers)
    assert signal.SIGTERM not in loop_signals.fallback_handlers
    loop_signals.loop_handlers[signal.SIGTERM]()
    assert stop.is_set()


@pytest.mark.positive
def test_signals_fall_back_to_signal_module_on_windows(loop_signals, run) -> None:
    loop_signals.loop_supported = False

    async def scenario():
        stop = asyncio.Event()
        worker._stop_on_signals(stop)
        assert not stop.is_set()
        loop_signals.fallback_handlers[signal.SIGINT](signal.SIGINT, None)
        await asyncio.sleep(0)  # let call_soon_threadsafe run
        return stop

    stop = run(scenario())
    assert {signal.SIGTERM, signal.SIGINT} <= set(loop_signals.fallback_handlers)
    assert stop.is_set()


# listening


@pytest.mark.positive
def test_listen_sets_wake_on_each_notify(run, unit) -> None:
    conn = FakeConnection(notifies=unit["notifies"], then="end")
    wake = asyncio.Event()

    run(worker._listen(conn, wake))
    assert wake.is_set()


@pytest.mark.negative
def test_listen_without_notifies_does_not_wake(run) -> None:
    wake = asyncio.Event()
    run(worker._listen(FakeConnection(notifies=0, then="end"), wake))
    assert not wake.is_set()


@pytest.mark.positive
def test_wait_returns_on_notify(run) -> None:
    async def scenario():
        listener, wake, stop = asyncio.create_task(hang()), asyncio.Event(), asyncio.Event()
        wake.set()
        await worker.wait_for_work(listener, wake, stop, set(), 30)
        assert not listener.done()
        await cancel_all(listener)

    run(scenario())


@pytest.mark.positive
def test_wait_returns_on_stop(run) -> None:
    async def scenario():
        listener, wake, stop = asyncio.create_task(hang()), asyncio.Event(), asyncio.Event()
        stop.set()
        await worker.wait_for_work(listener, wake, stop, set(), 30)
        await cancel_all(listener)

    run(scenario())


@pytest.mark.positive
def test_wait_returns_on_safety_timeout(run) -> None:
    async def scenario():
        listener, wake, stop = asyncio.create_task(hang()), asyncio.Event(), asyncio.Event()
        await worker.wait_for_work(listener, wake, stop, set(), 0)
        await cancel_all(listener)

    run(scenario())


@pytest.mark.positive
def test_wait_returns_when_a_slot_frees_up_under_backlog(run) -> None:
    async def scenario():
        gates = [asyncio.Event() for _ in range(worker.BATCH)]
        running = {asyncio.create_task(g.wait()) for g in gates}
        listener, wake, stop = asyncio.create_task(hang()), asyncio.Event(), asyncio.Event()
        waiter = asyncio.create_task(worker.wait_for_work(listener, wake, stop, running, 30))
        await asyncio.sleep(0)
        assert not waiter.done()
        gates[0].set()
        await waiter
        await cancel_all(listener, *running)

    run(scenario())


@pytest.mark.negative
def test_wait_ignores_finished_tasks_without_backlog(run) -> None:
    async def scenario():
        gate = asyncio.Event()
        running = {asyncio.create_task(gate.wait())}
        listener, wake, stop = asyncio.create_task(hang()), asyncio.Event(), asyncio.Event()
        waiter = asyncio.create_task(worker.wait_for_work(listener, wake, stop, running, 30))
        await asyncio.sleep(0)
        gate.set()
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        still_waiting = not waiter.done()
        stop.set()
        await waiter
        await cancel_all(listener, *running)
        return still_waiting

    assert run(scenario()) is True


@pytest.mark.negative
def test_wait_raises_when_listener_fails(run) -> None:
    async def failing() -> None:
        raise OSError("connection reset")

    async def scenario():
        listener = asyncio.create_task(failing())
        await worker.wait_for_work(listener, asyncio.Event(), asyncio.Event(), set(), 30)

    with pytest.raises(OSError, match="connection reset"):
        run(scenario())


@pytest.mark.negative
def test_wait_raises_when_listener_ends(run) -> None:
    async def finished() -> None:
        return None

    async def scenario():
        listener = asyncio.create_task(finished())
        await worker.wait_for_work(listener, asyncio.Event(), asyncio.Event(), set(), 30)

    with pytest.raises(ConnectionError, match="closed"):
        run(scenario())


@pytest.mark.positive
def test_listen_and_work_polls_on_start_and_on_notify(connection, polls, factory, run) -> None:
    connection.conn = FakeConnection(notifies=1, then="hang")

    async def scenario():
        polls.stop = asyncio.Event()
        await worker.listen_and_work(factory, no_enrich, PAUSE, "dsn://x", 30, polls.stop, set())

    run(scenario())
    assert connection.dsns == [("dsn://x", {"autocommit": True})]
    assert connection.conn.executed == [f"LISTEN {worker.CHANNEL}"]
    assert polls.calls == 2  # once on start, once after the notify
    assert connection.conn.closed


@pytest.mark.positive
def test_listen_and_work_returns_at_once_when_already_stopped(
    connection, polls, factory, run
) -> None:
    async def scenario():
        stop = asyncio.Event()
        stop.set()
        await worker.listen_and_work(factory, no_enrich, PAUSE, "dsn://x", 30, stop, set())

    run(scenario())
    assert polls.calls == 0
    assert connection.conn.closed


@pytest.mark.negative
def test_listen_and_work_fails_when_connection_breaks(connection, polls, factory, run) -> None:
    connection.conn = FakeConnection(notifies=0, then="break")

    async def scenario():
        polls.stop = asyncio.Event()
        polls.stop_after = 99
        await worker.listen_and_work(factory, no_enrich, PAUSE, "dsn://x", 30, polls.stop, set())

    with pytest.raises(OSError, match="connection reset"):
        run(scenario())
    assert connection.conn.closed


# serve


@pytest.fixture
def listen_script(monkeypatch):
    """Replace listen_and_work: each call performs the next scripted step (an exception to raise,
    'stop' to set the stop event and return)."""
    state = SimpleNamespace(steps=[], calls=0)
    monkeypatch.setattr(worker, "RECONNECT_PAUSE_S", 0)

    async def fake(factory, enrich, pause_s, dsn, safety_poll_s, stop, running) -> None:
        step = state.steps[state.calls]
        state.calls += 1
        if step == "stop":
            stop.set()
        elif step == "raise_and_stop":
            stop.set()
            raise OSError("down")
        else:
            raise step

    monkeypatch.setattr(worker, "listen_and_work", fake)
    return state


@pytest.mark.positive
def test_serve_reconnects_after_connection_errors(listen_script, factory, run, caplog) -> None:
    listen_script.steps = [
        psycopg.OperationalError("lost"),
        OSError("reset"),
        RuntimeError("bug"),
        "stop",
    ]

    async def scenario():
        stop = asyncio.Event()
        await worker.serve(factory, no_enrich, PAUSE, "dsn://x", 30, stop, set())
        return stop

    stop = run(scenario())
    assert listen_script.calls == 4
    assert stop.is_set()
    assert "listen connection lost" in caplog.text
    assert "worker loop failed" in caplog.text


@pytest.mark.positive
def test_serve_stops_without_reconnecting_when_stop_requested(listen_script, factory, run) -> None:
    listen_script.steps = ["raise_and_stop", OSError("must not be reached")]

    async def scenario():
        await worker.serve(factory, no_enrich, PAUSE, "dsn://x", 30, asyncio.Event(), set())

    run(scenario())
    assert listen_script.calls == 1


@pytest.mark.positive
def test_serve_does_nothing_when_already_stopped(listen_script, factory, run) -> None:
    async def scenario():
        stop = asyncio.Event()
        stop.set()
        await worker.serve(factory, no_enrich, PAUSE, "dsn://x", 30, stop, set())

    run(scenario())
    assert listen_script.calls == 0


# main / run


@pytest.fixture
def main_env(monkeypatch, unit, processed):
    rec = SimpleNamespace(
        serve_kwargs=None,
        enrich_calls=[],
        signals=0,
        drained=False,
        enrich_result={"k": 1},
        recovered=processed,
    )

    async def fake_enrich_sources(*args):
        rec.enrich_calls.append(args)
        return rec.enrich_result

    async def fake_serve(**kwargs) -> None:
        rec.serve_kwargs = kwargs

        async def job() -> None:
            rec.drained = True

        kwargs["running"].add(asyncio.create_task(job()))
        rec.enrich_returned = await kwargs["enrich"]("7701234567", "cns-1")

    monkeypatch.setattr(worker, "enrich_sources", fake_enrich_sources)
    monkeypatch.setattr(worker, "serve", fake_serve)
    monkeypatch.setattr(worker, "SessionLocal", FakeFactory())
    monkeypatch.setattr(worker, "recover_stuck", lambda: unit["stuck_ids"])
    monkeypatch.setattr(
        worker, "_stop_on_signals", lambda stop: setattr(rec, "signals", rec.signals + 1)
    )
    monkeypatch.setattr(worker.pipeline_settings, "speed", "fast")
    core = SimpleNamespace(database_url="postgresql+psycopg://u:p@h/db")
    monkeypatch.setattr(worker, "get_settings", lambda: core)
    monkeypatch.setattr(worker.pipeline_settings, "mocks_url", "http://mocks.test")
    return rec


@pytest.mark.smoke
@pytest.mark.positive
def test_main_wires_settings_into_serve(main_env, run) -> None:
    run(worker.main())
    kw = main_env.serve_kwargs
    cfg = worker.pipeline_settings
    assert kw["factory"] is worker.SessionLocal
    assert kw["pause_s"] == 1.0
    assert kw["dsn"] == "postgresql://u:p@h/db"
    assert kw["safety_poll_s"] == cfg.safety_poll_s
    assert isinstance(kw["stop"], asyncio.Event)
    assert main_env.signals == 1


@pytest.mark.positive
def test_main_enrich_uses_configured_source_settings(main_env, run) -> None:
    run(worker.main())
    cfg = worker.pipeline_settings
    assert main_env.enrich_calls == [
        (
            "7701234567",
            "cns-1",
            "http://mocks.test",
            cfg.source_timeout_s,
            cfg.source_attempts,
            cfg.retry_pause_s,
        )
    ]
    assert main_env.enrich_returned == main_env.enrich_result


@pytest.mark.positive
def test_main_waits_for_running_applications_before_exit(main_env, run) -> None:
    run(worker.main())
    assert main_env.drained is True


@pytest.mark.positive
def test_main_processes_interrupted_applications_again(main_env, run, unit) -> None:
    run(worker.main())
    assert sorted(main_env.recovered) == unit["stuck_ids"]


@pytest.fixture
def fake_asyncio(monkeypatch):
    rec = SimpleNamespace(calls=[])

    def fake_run(coro, loop_factory=None):
        rec.calls.append((coro, loop_factory))
        return "result"

    monkeypatch.setattr(
        worker,
        "asyncio",
        SimpleNamespace(run=fake_run, SelectorEventLoop=asyncio.SelectorEventLoop),
    )
    return rec


@pytest.mark.positive
def test_run_uses_selector_loop_on_windows(monkeypatch, fake_asyncio) -> None:
    monkeypatch.setattr(worker, "sys", SimpleNamespace(platform="win32"))
    marker = object()
    assert worker.run(marker) == "result"
    assert fake_asyncio.calls == [(marker, asyncio.SelectorEventLoop)]


@pytest.mark.positive
def test_run_uses_default_loop_elsewhere(monkeypatch, fake_asyncio) -> None:
    monkeypatch.setattr(worker, "sys", SimpleNamespace(platform="linux"))
    marker = object()
    worker.run(marker)
    assert fake_asyncio.calls == [(marker, None)]


@pytest.mark.positive
def test_run_really_runs_a_coroutine() -> None:
    async def answer() -> int:
        return 42

    assert worker.run(answer()) == 42
