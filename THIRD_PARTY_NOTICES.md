# Сторонние компоненты

Используются как есть, без изменений кода.

## backend/

| Пакет | Лицензия |
| --- | --- |
| FastAPI | MIT |
| SQLAlchemy | MIT |
| Alembic | MIT |
| httpx | BSD-3-Clause |
| pydantic, pydantic-settings | MIT |
| PyYAML | MIT |
| psycopg | LGPL-3.0 |
| uvicorn | BSD-3-Clause |
| passlib | BSD |
| bcrypt | Apache-2.0 |
| PyJWT | MIT |
| python-multipart | Apache-2.0 |

## mocks/

FastAPI (MIT), uvicorn (BSD-3-Clause), pydantic-settings (MIT).

## Опционально, если подключён внешний сервер Ollama

| Компонент | Лицензия |
| --- | --- |
| Ollama | MIT |
| Qwen2.5-3B-Instruct (`qwen2.5:3b-instruct`, модель по умолчанию) | Qwen Research License, см. лицензию модели: <https://huggingface.co/Qwen/Qwen2.5-3B-Instruct> |

Ollama и модель не входят в образы и `docker-compose`. Ассистент только обращается к API по `ASSISTANT_OLLAMA_URL`; без него работает по правилам.
