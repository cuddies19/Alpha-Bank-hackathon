# Alpha-Bank-hackathon

Личный кабинет малого и микробизнеса с ИИ-ассистентом: помогает выбрать кредитный продукт
и провести заявку от идеи до денег на счёте.

## Быстрый старт

```bash
docker compose up --build
```

- API и Swagger: <http://localhost:8000/docs>
- health: <http://localhost:8000/health>
- OpenAPI: `docs/openapi.json`

Локально без Docker:

```bash
cd backend
uv sync
DATABASE_URL=sqlite:///./local.db uv run alembic upgrade head
DATABASE_URL=sqlite:///./local.db uv run uvicorn app.main:app --reload
```

## Демо-вход

Пароль по умолчанию `demo123` (`DEMO_PASSWORD`).

| Логин | Кто |
| --- | --- |
| `igor.sokolov` | Игорь Соколов, ООО «Дом и уют» |
| `anna.belova` | Анна Белова, ИП |
| `marina.orlova` | Марина Орлова, ООО «Лён и Дуб» |
| `sergey.fomin` | Сергей Фомин, ИП |
| `olga.kravtsova` | Ольга Кравцова, андеррайтер |

## Структура

| Путь | Что там | Владелец |
| --- | --- | --- |
| `backend/` | FastAPI, SQLAlchemy, Alembic, тесты | Евгений |
| `app/` | React + TypeScript + Vite, макет кабинета | Фронтенд |
| `Дизайн-система/` | токены и React-компоненты | Дизайн |
| `Концепция/` | продуктовая концепция и сценарий | Продукт |
| `mocks/`, `scoring/` | моки источников и скоринг | Интеграции |
| `seeds/` | демо-данные | DS |
| `docs/` | OpenAPI, ER-диаграмма, машина состояний | Евгений / Интеграции |

## Интеграции и демо

Схема и пайплайн: [docs/architecture.md](docs/architecture.md). Контракты источников: [docs/integrations.md](docs/integrations.md).

- Запуск: `docker compose up --build` (API, воркер, Postgres, моки на порту 8090).
- Скорость конвейера: `PIPELINE_SPEED=fast` — пауза между этапами 1 с вместо 5 с.
- Сломать источник для жюри: экран `/demo` (`POST /demo/sources/{source}`) или напрямую админка моков, например `curl -X POST localhost:8090/_admin/sources/bki -H 'content-type: application/json' -d '{"mode":"down"}'`. Вернуть всё: `POST /demo/reset`.
- Коллекция Bruno: `docs/collection` (описание в её README).
- Переменные `PIPELINE_*`: `SPEED`, `SOURCE_TIMEOUT_S`, `SOURCE_ATTEMPTS`, `RETRY_PAUSE_S`, `MOCKS_URL`, `SCORING_URL`, `SAFETY_POLL_S`.
- Переменные `ASSISTANT_*`: `MODE` (`auto`, `llm`, `rules`), `OLLAMA_URL`, `MODEL` (по умолчанию `qwen2.5:3b-instruct`), `TIMEOUT_S`. Ollama в compose нет: ассистент только ходит по адресу `ASSISTANT_OLLAMA_URL`, без него отвечает по правилам.
- Сторонние компоненты: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Проверки

```bash
cd backend
uv run ruff check .
uv run pytest
uv run python scripts/export_openapi.py
```
