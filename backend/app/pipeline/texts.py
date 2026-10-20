"""Shared wording for messages."""


def _attempts_word(n: int) -> str:
    if n % 10 == 1 and n % 100 != 11:
        return "попытка"
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return "попытки"
    return "попыток"


def attempts_text(attempts: int, timeout_s: float) -> str:
    """E.g. «3 попытки по 3 с»."""
    return f"{attempts} {_attempts_word(attempts)} по {timeout_s:g} с"
