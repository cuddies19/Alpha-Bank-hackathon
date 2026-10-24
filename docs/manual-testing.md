# Ручной прогон ядра (backend)

Документ для проверки сдачи по `tasks.md` без автотестов: тем же путём, которым будет
ходить жюри и фронт. Все команды выполняются из корня репозитория.

Обозначения:

- `API=http://localhost:8000` — адрес API;
- `IGOR`, `ANNA`, `OLGA` — токены соответствующих пользователей;
- ожидаемый HTTP-код указан рядом с каждым шагом.

## 0. Подготовка стенда

```bash
export API=http://localhost:8000

# 1. Чистый старт: база, миграции, сиды, API
docker compose down -v
docker compose up --build -d

# 2. Дождаться healthcheck
curl -s $API/health
# {"status":"ok"}

# 3. Swagger со всеми эндпоинтами
curl -s -o /dev/null -w '%{http_code}\n' $API/docs
# 200

# 4. Контракт и качество кода
cd backend
uv run ruff check .
uv run pytest
uv run python scripts/export_openapi.py --check
```

Критерий: `docker compose ps` показывает `db` и `api` в состоянии `healthy`,
`ruff` и `pytest` зелёные, `openapi.json` актуален.

Если стенд уже поднят и нужно сбросить данные:

```bash
docker compose down -v          # удалит том pgdata и uploads
docker compose up --build -d
```

> `down -v` уничтожает данные. Для быстрого сброса только заявок используйте
> `POST /demo/reset` (он сбрасывает состояние демо-источников, но не таблицы).

## 1. Вход и роли

Получить токены (пароль по умолчанию `demo123`, меняется через `DEMO_PASSWORD`):

```bash
login() {
  curl -s -X POST $API/auth/login \
    -H 'Content-Type: application/json' \
    -d "{\"login\":\"$1\",\"password\":\"${DEMO_PASSWORD:-demo123}\"}" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])'
}

IGOR=$(login igor.sokolov)
ANNA=$(login anna.belova)
OLGA=$(login olga.kravtsova)
```

| # | Проверка | Запрос | Ожидание |
|---|---|---|---|
| 1.1 | Вход Игоря | `POST /auth/login` | 200, есть `access_token`, `user.role=client`, `user.company.name=ООО «Дом и уют»` |
| 1.2 | Вход Анны | `POST /auth/login` | 200, компания `ИП Белова А. С.` |
| 1.3 | Вход Марины | `POST /auth/login` | 200, компания `ООО «Лён и Дуб»` |
| 1.4 | Вход Сергея | `POST /auth/login` | 200, компания `ИП Фомин С. В.` |
| 1.5 | Вход Ольги | `POST /auth/login` | 200, `role=underwriter`, компании нет |
| 1.6 | Неверный пароль | `POST /auth/login` с `password=wrong` | 401, `{"code":"invalid_credentials"}` |
| 1.7 | Без токена | `GET /me` | 401, `{"code":"unauthorized"}` |
| 1.8 | Текущий пользователь | `GET /me` с `IGOR` | 200, логин и компания Игоря |
| 1.9 | Клиент в консоль банка | `GET /bank/applications` с `IGOR` | 403, `{"code":"forbidden"}` |
| 1.10 | Андеррайтер в клиентский API | `GET /me/cashflow` с `OLGA` | 403 |
| 1.11 | Клиентский API андеррайтером | `GET /loans` с `OLGA` | 403 |
| 1.12 | Публичный каталог | `GET /products` без токена | 200, 3 продукта |

## 2. Клиентский сценарий: от черновика до денег

Выполнять под `IGOR`, если не указано иное.

### 2.1. Подбор и расчёт

| # | Запрос | Ожидание |
|---|---|---|
| 2.1.1 | `GET /me/cashflow` | 200, `balance`, `inflows`, `net_flow`, `loan_payments`, ровно 6 элементов `months` |
| 2.1.2 | `GET /calculator?amount=3000000&term_months=18` | 200, `monthly_payment > 0`, `total_payment > amount` |
| 2.1.3 | `POST /recommendations` `{"task":"Закупка партии к распродаже","amount":3000000,"term_months":18}` | 200, 1–2 рекомендации, у каждой `match_score`, `reason`, `monthly_payment` |
| 2.1.4 | `GET /products` | 200, у продуктов есть лимиты суммы/срока и ставка |

### 2.2. Черновик

Взять `product_id` продукта `credit_line` из `/products`.

```bash
curl -s -X POST $API/applications \
  -H "Authorization: Bearer $IGOR" -H 'Content-Type: application/json' \
  -d '{
    "product_id": 3,
    "amount": 3000000,
    "term_months": 18,
    "purpose": "Закупка партии к распродаже 11.11",
    "task_code": "stock",
    "needed_by": "2026-11-01",
    "repayment_source": "Выручка ноября",
    "consents": {"personal_data": true, "bki_request": true, "terms": true}
  }'
```

Ожидание: `201`, `status=draft`, номер вида `2026-10-0001`, `stages` из 6 шагов,
`history` пока пустая. Сохраните `id` из ответа в `APP_ID` — он нужен дальше.

```bash
APP_ID=1   # подставьте id из ответа выше
```

| # | Проверка | Ожидание |
|---|---|---|
| 2.2.1 | `PATCH /applications/{id}` с новой суммой и целью | 200, поля изменились, в аудите `application_updated` |
| 2.2.2 | `PATCH` с суммой ниже лимита продукта | 422, `amount_out_of_range` |
| 2.2.3 | `PATCH` с несуществующим `product_id` | 404, `product_not_found` |
| 2.2.4 | `GET /applications` | 200, в списке только заявки компании Игоря |
| 2.2.5 | `GET /applications/{id}` | 200, есть `company`, `product`, `documents`, `stages`, `history` |
| 2.2.6 | `PATCH` с `{"needed_by":"2026-12-01"}` | 200, дата сохранилась; в `audit_log.after` лежит строка `2026-12-01`, а не объект даты |

### 2.3. Документы

Для проверки подойдут любые небольшие файлы. Если их нет, создайте в `/tmp`:

```bash
printf '%%PDF-1.7 test' > /tmp/report.pdf
printf '\xff\xd8\xff\xe0test' > /tmp/photo.jpg
```

```bash
# Валидный PDF
curl -s -X POST $API/applications/$APP_ID/documents \
  -H "Authorization: Bearer $IGOR" \
  -F 'doc_type=financial_statement' \
  -F 'file=@/tmp/report.pdf;type=application/pdf'
# 201, документ появился в карточке заявки
```

| # | Файл | Ожидание |
|---|---|---|
| 2.3.1 | `report.pdf`, `application/pdf` | 201 |
| 2.3.2 | `photo.jpg`, `image/jpeg` | 201 |
| 2.3.3 | `scan.png`, `image/png` | 201 |
| 2.3.4 | `virus.exe` | 422, `invalid_file_type` |
| 2.3.5 | PDF с MIME `text/plain` | 422, `invalid_file_type` |
| 2.3.6 | файл больше 10 МБ | 422, `file_too_large`, частичный файл не остался в `data/uploads` |
| 2.3.7 | загрузка в чужую заявку под `ANNA` | 404, `application_not_found` |

### 2.4. Подача

```bash
curl -s -X POST $API/applications/$APP_ID/submit \
  -H "Authorization: Bearer $IGOR"
```

Ожидание: `200`, `status=submitted`, `submitted_at` заполнен, в `history` строка
`draft → submitted` с `actor_type=client`, в `/notifications` появилось непрочитанное.

| # | Проверка | Ожидание |
|---|---|---|
| 2.4.1 | Повторная подача | 409, `invalid_transition` |
| 2.4.2 | Подача без согласия `bki_request` | 422, `consents_required` |
| 2.4.3 | Подача с пустой целью | 422, `missing_required_fields` |
| 2.4.4 | Редактирование после подачи | 409, `invalid_state` |
| 2.4.5 | `GET /applications/{id}` после подачи | `stages[0]=done`, `stages[1]=current` |

### 2.5. Отзыв и повторная подача (отдельная заявка)

| # | Действие | Ожидание |
|---|---|---|
| 2.5.1 | Создать вторую заявку и подать | 200, `submitted` |
| 2.5.2 | `POST /applications/{id}/withdraw` | 200, `withdrawn`, комментарий в истории |
| 2.5.3 | Повторный `withdraw` | 409, `invalid_transition` |
| 2.5.4 | `POST /applications/{id}/resubmit` | 200, `submitted`, метка `Повторная подача`, `decided_at=null`, `decision=null`, `taken_by_name=null` |
| 2.5.5 | `resubmit` черновика | 409, `invalid_state` |

### 2.6. Решение банка, принятие, подписание, кредит

Сначала выполнить раздел 3 (Ольга одобряет заявку), затем вернуться к Игорю.

| # | Действие | Ожидание |
|---|---|---|
| 2.6.1 | `GET /notifications` | есть уведомления о статусах, `unread > 0` |
| 2.6.2 | `POST /notifications/{id}/read` | 200, `read=true`, счётчик уменьшился |
| 2.6.3 | `POST /notifications/{чужого id}/read` под `ANNA` | 404 |
| 2.6.4 | `POST /applications/{id}/accept` | 200, `signing` |
| 2.6.5 | `POST /applications/{id}/accept` повторно | 409 |
| 2.6.6 | `POST /applications/{id}/decline` на другом одобрении | 200, `client_declined` |
| 2.6.7 | `POST /applications/{id}/sign` | 200, `issued`, создан кредит |
| 2.6.8 | `GET /loans` | 200, один кредит, сумма/срок из решения, график на 18 месяцев, последний `remaining=0` |
| 2.6.9 | `POST /applications/{id}/withdraw` после выдачи | 409, `invalid_transition` |

## 3. Консоль андеррайтера

Выполнять под `OLGA`.

### 3.1. Очередь и карточка

| # | Запрос | Ожидание |
|---|---|---|
| 3.1.1 | `GET /bank/applications` | 200, черновиков нет, есть счётчики `new/pipeline/manual/client/decided` |
| 3.1.2 | `GET /bank/applications?status=submitted` | только поданные |
| 3.1.3 | `GET /bank/applications?mine=true` | только взятые Ольгой |
| 3.1.4 | `GET /bank/applications?query=7701234567` | поиск по ИНН/номеру/названию |
| 3.1.5 | `GET /bank/applications/{id}` | карточка: `checks`, `score`, `rules`, `decision`, `recommendation`, `history` |
| 3.1.6 | `GET /bank/sources` | 4 источника: `egrul`, `fns`, `bki`, `statement` |

### 3.2. Взятие и решения

| # | Действие | Ожидание |
|---|---|---|
| 3.2.1 | `POST /bank/applications/{id}/take` | 200, `manual_review`, `taken_by_name=Ольга Кравцова` |
| 3.2.2 | Повторный `take` тем же сотрудником | 200 (идемпотентно) |
| 3.2.3 | `take` чужой уже взятой заявки | 409, `already_taken` |
| 3.2.4 | `decision` с `outcome=approve` | 200, `approved`, создано решение, клиенту ушло уведомление |
| 3.2.5 | `decision` с `outcome=counter` + новые сумма/срок/ставка | 200, `counter_offer`, платёж пересчитан |
| 3.2.6 | `decision` с `outcome=request` без `requested_documents` | 422, `documents_required` |
| 3.2.7 | `decision` с `outcome=request` + документы | 200, `client_action`, в карточке клиента описание запроса; после загрузки документа клиентом — `submitted` |
| 3.2.8 | `decision` с `outcome=decline` без причины | 422, `decline_reason_required` |
| 3.2.9 | `decision` с `outcome=decline` + причина | 200, `rejected` |
| 3.2.10 | `decision` по заявке не в `manual_review` | 409, `invalid_transition` |
| 3.2.11 | `decision` под клиентом `IGOR` | 403 |
| 3.2.12 | Клиентская карточка после decline | нет `internal_comment`, есть `decline_reason` и `client_message` |

### 3.3. Аудит

| # | Запрос | Ожидание |
|---|---|---|
| 3.3.1 | `GET /bank/audit` | 200, есть `application_created`, `status_changed`, `application_taken`, `decision_made` |
| 3.3.2 | `GET /bank/audit?application_id={id}` | только события заявки |
| 3.3.3 | `GET /bank/audit?actor_type=client` | только действия клиентов |
| 3.3.4 | `GET /bank/audit` под `IGOR` | 403 |
| 3.3.5 | Проверка маскирования | в `before/after` нет телефона/паспорта целиком, формат `45 •• ••••12` |

Проверка маскирования вручную:

1. Под Игорём сделать `PATCH /applications/{id}` с целью
   `"Позвонить 89161234512 и уточнить закупку"`.
2. Открыть `GET /bank/audit?application_id={id}`.
3. Убедиться, что в `after.purpose` нет `89161234512`, есть `••`.

## 4. Матрица запрещённых действий

Проверять на только что созданной заявке, чтобы не портить основной сценарий.

| # | Действие | Ожидание |
|---|---|---|
| 4.1 | Подать черновик дважды | 409 `invalid_transition` |
| 4.2 | Принять неодобренную заявку | 409 `invalid_transition` |
| 4.3 | Подписать не на этапе подписания | 409 `invalid_transition` |
| 4.4 | Отклонить неодобренную заявку | 409 `invalid_transition` |
| 4.5 | Повторно подать черновик | 409 `invalid_transition` |
| 4.6 | Взять в работу черновик | 409 `invalid_transition` |
| 4.7 | Решение по заявке вне `manual_review` | 409 `invalid_transition` |
| 4.8 | Отозвать выданную заявку | 409 `invalid_transition` |
| 4.9 | Отозвать дважды | 409 `invalid_transition` |
| 4.10 | `draft → approved` напрямую | 409 `invalid_transition` (проверяется в `pytest tests/test_state_machine.py`) |
| 4.11 | `rejected → signed` напрямую | 409 `invalid_transition` (проверяется в `pytest tests/test_state_machine.py`) |
| 4.12 | Клиент открывает чужую заявку | 404 |
| 4.13 | Клиент правит чужую заявку | 404 |
| 4.14 | Клиент грузит документ в чужую заявку | 404 |
| 4.15 | Клиент вызывает API банка | 403 |
| 4.16 | Андеррайтер вызывает клиентский API | 403 |

## 5. Проверка данных в базе

```bash
docker compose exec db psql -U cabinet -d cabinet
```

```sql
-- Каждая смена статуса оставила историю и аудит
SELECT a.number, h.from_status, h.to_status, h.actor_type, h.created_at
FROM status_history h JOIN applications a ON a.id = h.application_id
ORDER BY h.created_at;

SELECT action, count(*) FROM audit_log GROUP BY action ORDER BY 2 DESC;

-- Уведомления создаются на видимые клиенту статусы
SELECT type, read, count(*) FROM notifications GROUP BY type, read;

-- Кредит и график
SELECT l.amount, l.term_months, l.rate, l.monthly_payment,
       json_array_length(l.schedule) AS payments
FROM loans l;

-- Деньги — целые, без копеек
SELECT amount, term_months FROM applications;
```

Ожидание:

- число строк `status_history` равно числу успешных переходов;
- на каждый переход есть `audit_log.action='status_changed'`;
- `notifications` есть для `submitted`, `manual_review`, `approved`, `signing`, `issued`;
- `loans.schedule` — массив на срок кредита, последний `remaining=0`;
- в суммах нет дробной части.

## 6. Режим проверки жюри (заглушки Интеграций)

| # | Запрос | Ожидание |
|---|---|---|
| 6.1 | `GET /demo/state` | 200, `sources` из 4 источников, `speed=1.0`, число заявок |
| 6.2 | `POST /demo/sources/bki` `{"status":"fail"}` | 200, `sources.bki=fail` |
| 6.3 | `POST /demo/sources/unknown` | 404, `source_not_found` |
| 6.4 | `POST /demo/sources/bki` с недопустимым статусом | 422, `invalid_source_status` |
| 6.5 | `POST /demo/speed` `{"multiplier":3}` | 200, `speed=3.0` |
| 6.6 | `POST /demo/reset` | 200, все источники `ok`, `speed=1.0` |

Важно: это контрактные заглушки. Реальное поведение источников и конвейера — зона
Интеграций; после мержа их `worker` должен двигать заявку через
`app.state.machine.transition`, а не писать статус напрямую.

## 7. Финальный чек-лист сдачи

- [ ] `docker compose up --build` с чистого клона поднимает `db` и `api`.
- [ ] `curl /health` → `{"status":"ok"}`.
- [ ] `/docs` открывается, все эндпоинты из `tasks.md` на месте.
- [ ] `uv run pytest` — все тесты зелёные.
- [ ] `uv run ruff check .` — без замечаний.
- [ ] `export_openapi.py --check` — схема актуальна.
- [ ] Игорь может войти, создать, заполнить, приложить документ и подать заявку.
- [ ] Ольга видит очередь, берёт заявку, выносит решение.
- [ ] Игорь принимает предложение, подписывает, видит кредит и график.
- [ ] Недопустимые переходы дают 409, чужая заявка — 404, чужая роль — 403.
- [ ] Каждая смена статуса есть в `status_history` и `audit_log`.
- [ ] Персональные данные в аудите замаскированы.
- [ ] OpenAPI, ER-диаграмма, машина состояний, compose и lock-файлы в репозитории.

## 8. Что проверить после мержа Интеграций и Фронта

Эти пункты не относятся к ядру, но без них демо не соберётся:

- [ ] `docker compose up` поднимает ещё `mocks` и `worker`.
- [ ] Конвейер двигает заявку только через `app/state/machine.py:transition`.
- [ ] Статусы конвейера (`processing`, `manual_review`, `client_action`) совпадают
      с матрицей ядра, а не с промежуточными `completeness_check/scoring/rules`.
- [ ] Фронт ходит в реальный API, а не в `src/mocks`.
- [ ] Пароль демо-пользователей одинаковый: `DEMO_PASSWORD` (сейчас `demo123`).
- [ ] Фронт использует типы из `docs/openapi.json` или сгенерированные из него.
- [ ] После повторной подачи конвейер пересчитывает `source_checks`, `scores` и
      `rule_results`; старые проверки не показываются как актуальные.
