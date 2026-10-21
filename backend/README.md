# Backend «Ядро»

Владелец: Евгений (ядро сервиса, инфраструктура).

FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL 16, зависимости и запуск через uv.

## Быстрый старт

Из корня репозитория:

```bash
docker compose up --build
```

Локально без Docker (SQLite):

```bash
cd backend
uv sync
export DATABASE_URL=sqlite:///./local.db
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Полный стек:

```bash
docker compose up --build
```

- Swagger: <http://localhost:8000/docs>
- health: <http://localhost:8000/health>
- OpenAPI: `docs/openapi.json` (обновляется `uv run python scripts/export_openapi.py`)

## Демо-пользователи

Пароль задаётся `DEMO_PASSWORD` (по умолчанию `demo123`).

| Логин | Роль | Компания |
| --- | --- | --- |
| `igor.sokolov` | client | ООО «Дом и уют» |
| `anna.belova` | client | ИП Белова А. С. |
| `marina.orlova` | client | ООО «Лён и Дуб» |
| `sergey.fomin` | client | ИП Фомин С. В. |
| `olga.kravtsova` | underwriter | — |

## Структура

| Путь | Что там |
| --- | --- |
| `app/api/` | роутеры FastAPI |
| `app/models/` | таблицы SQLAlchemy |
| `app/schemas/` | схемы Pydantic и контракт OpenAPI |
| `app/services/` | бизнес-логика, сиды, аудит, финансы |
| `app/state/machine.py` | машина состояний и единственная функция `transition()` |
| `app/pipeline/`, `app/rules/`, `app/assistant/` | пакеты Интеграций, пустые |
| `alembic/` | миграции |
| `tests/` | pytest |
| `scripts/export_openapi.py` | выгрузка схемы в `../docs/openapi.json` |

## Правила

- Деньги — целые рубли, никаких float.
- Статус заявки меняется только через `app.state.machine.transition`.
- Контракт API меняется только после сообщения фронту.
- Для подачи заявки нужны согласия `personal_data`, `bki_request`, `terms` со значением `true`.
