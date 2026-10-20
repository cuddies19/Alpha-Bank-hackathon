"""Mocks of the four external sources and DS scoring, driven by datasets in tests/test_data.

mock.set_dataset("igor") loads tests/test_data/<prefix>_igor.json. A dataset is one of:
  {"status_code": 200, "body": {...}}   an answer
  {"status_code": 200, "raw": "text"}   an answer whose body is not JSON
  {"failure": "timeout" | "crash"}      a timeout or an unexpected exception
  {"sequence": [<answer or failure>, ...]}   one item per call, the last one repeats
"""

import json
from pathlib import Path
from typing import Any

import httpx

DATA = Path(__file__).parent / "test_data"
PREFIXES = ("egrul", "fns", "bki", "statement")


def load_json(name: str) -> Any:
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


class SourceMock:
    def __init__(self, prefix: str) -> None:
        self.prefix = prefix
        self.calls: list[dict[str, Any]] = []
        self.set_dataset("igor")

    def set_dataset(self, name: str) -> None:
        data = load_json(f"{self.prefix}_{name}")
        self.steps = data.get("sequence", [data])
        self.calls.clear()

    def respond(self, request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content) if request.content else None
        self.calls.append({"method": request.method, "path": request.url.path, "json": body})
        step = self.steps[min(len(self.calls), len(self.steps)) - 1]
        if step.get("failure") == "timeout":
            raise httpx.ReadTimeout("timed out", request=request)
        if step.get("failure") == "crash":
            raise RuntimeError("boom")
        if "raw" in step:
            return httpx.Response(step["status_code"], content=step["raw"])
        return httpx.Response(step["status_code"], json=step["body"])


class Sources:
    """All four mocks behind one transport; requests are routed by the first path segment."""

    def __init__(self) -> None:
        self.mocks = {p: SourceMock(p) for p in PREFIXES}
        self.egrul, self.fns, self.bki, self.statement = (self.mocks[p] for p in PREFIXES)
        self.score = SourceMock("score")  # DS scoring; not part of set_all
        self.transport = httpx.MockTransport(self._route)

    def set_all(self, name: str) -> None:
        for mock in self.mocks.values():
            mock.set_dataset(name)

    def _route(self, request: httpx.Request) -> httpx.Response:
        name = request.url.path.strip("/").split("/")[0]
        return (self.score if name == "score" else self.mocks[name]).respond(request)
