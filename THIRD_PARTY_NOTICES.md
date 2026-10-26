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

## frontend/

Версии зафиксированы в `frontend/package.json` и `frontend/package-lock.json`.

| Пакет | Версия | Лицензия | Где используется |
| --- | --- | --- | --- |
| React, React DOM | 19.3.1 | MIT | интерфейс |
| React Router | 7.18.4 | MIT | маршрутизация |
| TanStack Query | 5.104.5 | MIT | запросы к API и кэш |
| clsx | 2.1.1 | MIT | классы CSS |
| Golos Text (`@fontsource-variable/golos-text`) | 5.3.0 | SIL Open Font License 1.1 | шрифт интерфейса |
| Vite, `@vitejs/plugin-react` | 8.3.4, 6.1.2 | MIT | сборка, только разработка |
| TypeScript | 6.0.3 | Apache-2.0 | проверка типов, только разработка |
| oxlint | 1.89.0 | MIT | линтер, только разработка |
| Prettier | 3.9.10 | MIT | форматирование, только разработка |
| `@types/react`, `@types/react-dom`, `@types/node` | 19.3.0, 19.3.0, 24.19.2 | MIT | типы, только разработка |

Docker-образы фронтенда (`frontend/Dockerfile`): `node:22.14.0-alpine` для сборки (Node.js — MIT) и `nginx:1.27.5-alpine` для раздачи (nginx — BSD-2-Clause).

## Смоделированные интеграции

Реальные внешние системы не используются. Вместо них работают локальные моки из `mocks/` с упрощёнными контрактами (`docs/integrations.md`):

| Источник | Что моделирует |
| --- | --- |
| ЕГРЮЛ / ЕГРИП | статус компании, регистрация, ОКВЭД, руководитель |
| ФНС «Прозрачный бизнес» | налоговая задолженность, доходы и расходы, численность |
| Бюро кредитных историй | действующие кредиты, просрочки, запросы истории |
| Выписка по счёту | поступления и списания за 12 месяцев |

Подписание документов и выдача денег смоделированы без реальных операций: код подтверждения не отправляется, деньги не переводятся.

## Данные

Все данные синтетические и созданы командой: компании, сотрудники, заявки, ответы источников, выписки (`seeds/`, `mocks/seeds/`). Демо-пользователи и каталог продуктов создаются API при старте. Реальные персональные данные не используются.

## Опционально, если подключён внешний сервер Ollama

| Компонент | Лицензия |
| --- | --- |
| Ollama | MIT |
| Qwen2.5-3B-Instruct (`qwen2.5:3b-instruct`, модель по умолчанию) | Qwen Research License, см. лицензию модели: <https://huggingface.co/Qwen/Qwen2.5-3B-Instruct> |

Ollama и модель не входят в образы и `docker-compose`. Ассистент только обращается к API по `ASSISTANT_OLLAMA_URL`; без него работает по правилам.
