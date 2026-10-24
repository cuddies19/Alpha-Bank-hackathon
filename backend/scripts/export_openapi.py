from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = REPO_ROOT / "docs" / "openapi.json"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def main() -> int:
    from app.main import app

    schema = app.openapi()
    payload = json.dumps(schema, ensure_ascii=False, indent=2) + "\n"
    if "--check" in sys.argv:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != payload:
            print(f"{OUTPUT} устарел. Запустите: uv run python scripts/export_openapi.py")
            return 1
        print(f"{OUTPUT} актуален")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(payload, encoding="utf-8")
    print(f"OpenAPI сохранён: {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
