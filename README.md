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

## Проверки

```bash
cd backend
uv run ruff check .
uv run pytest
uv run python scripts/export_openapi.py
```
