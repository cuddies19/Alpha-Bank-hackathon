"""Payment calc stub. Core's finance.py will replace this."""


def _factor(months: int, annual_rate: float) -> float:
    """Monthly payment per 1 ruble of loan (annuity)."""
    rate = annual_rate / 12
    if rate == 0:
        return 1 / months
    return rate / (1 - (1 + rate) ** -months)


def monthly_payment(amount: int, months: int, annual_rate: float) -> int:
    return round(amount * _factor(months, annual_rate))


def safe_amount(net_flow: int, months: int, annual_rate: float, target_share: float, step: int) -> int:
    """Biggest amount (rounded down to step) whose payment fits target_share of net_flow."""
    amount = net_flow * target_share / _factor(months, annual_rate)
    return int(amount // step * step)
