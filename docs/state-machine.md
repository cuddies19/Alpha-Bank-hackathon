# Машина состояний заявки

Единственная точка смены статуса — `app.state.machine.transition`. Конвейер Интеграций,
консоль андеррайтера и клиентские эндпоинты обязаны звать её, а не писать `application.status`.

```python
from app.models import ApplicationStatus
from app.state.machine import Actor, ActorType, transition

transition(
    db,
    application,
    ApplicationStatus.processing,
    Actor(ActorType.system, None, "Конвейер"),
    {"comment": "Проверки источников завершены"},
)
```

- `db` — активная SQLAlchemy-сессия.
- `actor` — `Actor(ActorType.client | system | underwriter, id, name)`.
- `payload` — необязательный словарь: `comment`, `labels`.
- функция проверяет переход и роль, меняет статус, пишет `status_history` и `audit_log`,
  создаёт уведомление клиенту для видимых статусов;
- недопустимый переход — `ApiError(409, "invalid_transition")`;
- допустимый переход не для той роли — `ApiError(403, "forbidden")`;
- коммит делает вызывающий код.

## Статусы

| Код | Подпись | Что значит |
| --- | --- | --- |
| `draft` | Черновик | заполняется клиентом |
| `submitted` | Подана | ждёт конвейер |
| `processing` | Проверяем данные | идут проверки и скоринг |
| `manual_review` | Ручное рассмотрение | смотрит андеррайтер |
| `client_action` | Ждёт клиента | запрошены документы |
| `approved` | Одобрено | предложение банка |
| `counter_offer` | Встречное предложение | изменены условия |
| `rejected` | Отказ | решение банка |
| `signing` | Подписание | клиент принял условия |
| `signed` | Подписано | документы подписаны |
| `issued` | Выдано | кредит и график созданы |
| `client_declined` | Клиент отказался | отказ от предложения |
| `withdrawn` | Отозвана | клиент отозвал заявку |

## Переходы

| Из | В | Кто |
| --- | --- | --- |
| `draft` | `submitted`, `withdrawn` | client |
| `submitted` | `processing` | system |
| `submitted` | `manual_review` | system, underwriter |
| `submitted` | `withdrawn` | client |
| `processing` | `manual_review`, `client_action`, `approved`, `counter_offer`, `rejected` | system |
| `processing` | `withdrawn` | client |
| `manual_review` | `client_action`, `approved`, `counter_offer`, `rejected` | underwriter |
| `manual_review` | `withdrawn` | client |
| `client_action` | `processing` | system |
| `client_action` | `withdrawn` | client |
| `approved`, `counter_offer` | `signing` | client |
| `approved`, `counter_offer` | `client_declined` | client |
| `signing` | `signed` | client |
| `signed` | `issued` | system |
| `rejected`, `client_declined`, `withdrawn` | `submitted` | client (повторная подача) |

Запрещены, в частности, `draft → approved` и `rejected → signed` — оба дают 409.

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted: client
    draft --> withdrawn: client
    submitted --> processing: system
    submitted --> manual_review: system/underwriter
    submitted --> withdrawn: client
    processing --> manual_review: system
    processing --> client_action: system
    processing --> approved: system
    processing --> counter_offer: system
    processing --> rejected: system
    processing --> withdrawn: client
    manual_review --> client_action: underwriter
    manual_review --> approved: underwriter
    manual_review --> counter_offer: underwriter
    manual_review --> rejected: underwriter
    manual_review --> withdrawn: client
    client_action --> processing: system
    client_action --> withdrawn: client
    approved --> signing: client
    approved --> client_declined: client
    counter_offer --> signing: client
    counter_offer --> client_declined: client
    signing --> signed: client
    signed --> issued: system
    rejected --> submitted: client
    client_declined --> submitted: client
    withdrawn --> submitted: client
    issued --> [*]
```
