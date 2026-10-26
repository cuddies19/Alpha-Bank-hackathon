"""Deterministic fake data for INNs that have no seed file."""

import hashlib
import random

LAST_MONTH = (2026, 10)  # fixed anchor so output never depends on today's date
BANKS = ["Банк Пример", "Банк Север", "Банк Волга", "Банк Заря"]
SURNAMES = ["Иванов", "Петров", "Смирнов", "Кузнецов", "Попов", "Орлов"]
STREETS = ["Тверская", "Арбат", "Ленина", "Мира", "Садовая"]
OKVEDS = ["47.91", "56.30", "45.20", "62.01", "49.41", "43.21"]
REGIMES = ["osno", "usn_income", "usn_income_expense", "patent", "esn"]


def _rng(inn: str, source: str) -> random.Random:
    return random.Random(int(hashlib.sha256(f"{inn}:{source}".encode()).hexdigest(), 16))


def _digits(rng: random.Random, n: int) -> str:
    return "".join(str(rng.randrange(10)) for _ in range(n))


def month_labels(n: int) -> list[str]:
    year, month = LAST_MONTH
    labels = []
    for _ in range(n):
        labels.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            year, month = year - 1, 12
    return labels[::-1]


def egrul(inn: str) -> dict:
    rng = _rng(inn, "egrul")
    is_ip = len(inn) == 12
    surname = rng.choice(SURNAMES)
    head = f"{surname} {chr(rng.randrange(1040, 1066))}. {chr(rng.randrange(1040, 1066))}."
    data = {
        "inn": inn,
        "entity_type": "ip" if is_ip else "ul",
        "full_name": f"ИП {head}" if is_ip else f"ООО «{surname}-{_digits(rng, 2)}»",
        "status": rng.choices(["active", "liquidating", "liquidated"], [95, 3, 2])[0],
        "registration_date": f"{rng.randint(2012, 2024)}-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}",
        "okved": rng.choice(OKVEDS),
        "address": f"г. Москва, ул. {rng.choice(STREETS)}, д. {rng.randint(1, 80)}",
        "head_name": head,
    }
    if is_ip:
        data["ogrnip"] = "3" + _digits(rng, 14)
    else:
        data["ogrn"] = "1" + _digits(rng, 12)
    return data


def fns(inn: str) -> dict:
    rng = _rng(inn, "fns")
    income = rng.randint(3, 100) * 1_000_000
    return {
        "tax_debt_rub": 0 if rng.random() < 0.85 else rng.randint(10, 500) * 1000,
        "address_unreliable": rng.random() < 0.05,
        "income_last_year_rub": income,
        "expenses_last_year_rub": int(income * rng.uniform(0.75, 0.97)),
        "avg_headcount": rng.randint(1, 40),
        "tax_regime": rng.choice(REGIMES),
        "mass_director": rng.random() < 0.05,
    }


def bki(inn: str) -> dict:
    rng = _rng(inn, "bki")
    loans = [
        {
            "bank": rng.choice(BANKS),
            "balance_rub": rng.randint(50, 3000) * 1000,
            "monthly_payment_rub": rng.randint(5, 100) * 1000,
        }
        for _ in range(rng.randint(0, 2))
    ]
    overdue_12m = rng.choice([0, 0, 0, 5, 20])
    return {
        "loans": loans,
        "max_overdue_days_12m": overdue_12m,
        "max_overdue_days_24m": overdue_12m + rng.choice([0, 0, 10]),
        "inquiries_30d": rng.randint(0, 4),
    }


def statement(inn: str, months: int = 12) -> dict:
    rng = _rng(inn, "statement")
    base = rng.randint(5, 80) * 100_000
    rows = []
    for label in month_labels(months):
        inflow = int(base * rng.uniform(0.7, 1.3))
        rows.append(
            {"month": label, "inflow_rub": inflow, "outflow_rub": int(inflow * rng.uniform(0.7, 0.95))}
        )
    nets = [r["inflow_rub"] - r["outflow_rub"] for r in rows]
    return {
        "months": rows,
        "balance_rub": rng.randint(1, 50) * 100_000,
        "avg_net_flow_rub": round(sum(nets) / len(nets)),
        "marketplace_share": round(rng.random(), 2),
        "revenue_to_other_bank": rng.random() < 0.15,
        "inflow_30d_rub": rows[-1]["inflow_rub"],
    }
