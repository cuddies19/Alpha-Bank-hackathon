from datetime import date


def months_between(start: str | None, today: date) -> int | None:
    """Full months from an ISO date to today; None when the date is missing or broken."""
    try:
        born = date.fromisoformat(start)
    except (TypeError, ValueError):
        return None
    return (today.year - born.year) * 12 + today.month - born.month - (today.day < born.day)
