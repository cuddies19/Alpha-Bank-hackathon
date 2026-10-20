STATUSES = (
    "draft",
    "submitted",
    "completeness_check",
    "needs_info",
    "enrichment",
    "scoring",
    "rules",
    "manual_review",
    "approved",
    "rejected",
    "counter_offer",
    "issued",
)

STATUS_LABELS: dict[str, str] = {
    "draft": "Черновик",
    "submitted": "Заявка отправлена",
    "completeness_check": "Проверяем полноту заявки",
    "needs_info": "Нужны данные",
    "enrichment": "Запрашиваем данные из источников",
    "scoring": "Оцениваем риск",
    "rules": "Проверяем кредитные правила",
    "manual_review": "На рассмотрении у специалиста",
    "approved": "Одобрено",
    "rejected": "Отказ",
    "counter_offer": "Предложение банка",
    "issued": "Деньги зачислены",
}

# Labels and reasons used by the pipeline.
L_UNAVAILABLE = "Источник недоступен"
L_SOURCE_ERROR = "Ошибка источника"
L_FAILURE = "Ошибка обработки"
L_INTERRUPTED = "Обработка прервана"

R_CLAIMED = "Взята в работу"
R_INCOMPLETE = "Заявка заполнена не полностью"
R_COMPLETE = "Заявка заполнена полностью"
R_SOURCE_SILENT = "Источник не ответил"
R_SOURCE_ERROR = "Источник вернул ошибку"
R_SOURCES_CHECKED = "Источники проверены"
R_SCORED = "Оценка получена"
R_NO_RULES = "Правила пока не подключены"

# From status -> statuses it may move to. Empty means final.
TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted"},
    "submitted": {"completeness_check"},
    "completeness_check": {"needs_info", "enrichment", "manual_review"},
    "needs_info": {"submitted"},
    "enrichment": {"scoring", "manual_review"},
    "scoring": {"rules", "manual_review"},
    "rules": {"approved", "rejected", "manual_review", "counter_offer"},
    "manual_review": {"approved", "rejected", "counter_offer", "needs_info"},
    "counter_offer": {"approved", "rejected"},
    "approved": {"issued"},
    "rejected": set(),
    "issued": set(),
}


def check_transition(from_status: str, to_status: str) -> None:
    if to_status not in TRANSITIONS.get(from_status, set()):
        raise ValueError(f"illegal status change: {from_status} -> {to_status}")
