"""Shared wording for messages."""

# Status comments and labels set by the pipeline.
L_UNAVAILABLE = "Источник недоступен"
L_SOURCE_ERROR = "Ошибка источника"
L_FAILURE = "Ошибка обработки"
L_SCORING_DOWN = "Скоринг недоступен"

R_CLAIMED = "Взята в работу"
R_SOURCE_SILENT = "Источник не ответил"
R_SOURCE_ERROR = "Источник вернул ошибку"
R_MANUAL = "Передана специалисту"
R_INTERRUPTED = "Обработка прервана"

MISSING_NAMES = {
    "inn": "ИНН",
    "product": "продукт",
    "amount": "сумма",
    "term_months": "срок",
    "consent_bki": "согласие на запрос в БКИ",
}


def _attempts_word(n: int) -> str:
    if n % 10 == 1 and n % 100 != 11:
        return "попытка"
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return "попытки"
    return "попыток"


def attempts_text(attempts: int, timeout_s: float) -> str:
    """E.g. «3 попытки по 3 с»."""
    return f"{attempts} {_attempts_word(attempts)} по {timeout_s:g} с"
