"""Credit rules engine: reads rules.yaml, returns a decision. No DB, no HTTP."""

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import yaml

from app.pipeline.sources import SOURCES, TITLES
from app.rules.dates import months_between
from app.rules.payments import monthly_payment, safe_amount

RULES_FILE = Path(__file__).parent / "rules.yaml"


def load_rules(path: Path = RULES_FILE) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


@dataclass
class Decision:
    outcome: str  # approved | rejected | manual_review
    recommendation: dict
    explanation: str
    client_reason: str | None
    results: list[dict]
    payment_rub: int | None = None
    share: float | None = None
    failed: list[str] = field(default_factory=list)


def _money(n: int) -> str:
    return f"{n:,}".replace(",", " ") + " ₽"


@dataclass
class Facts:
    """Everything the checks look at, taken from the application and the sources."""

    amount: int
    term: int
    risk_class: str | None
    egrul: dict
    bki: dict
    has_statements: bool
    other_bank: bool
    age_months: int | None
    net_flow: int
    share: float | None


def _share_check(f: Facts, t: float):
    value = None if f.share is None else round(f.share, 4)
    return value, f.share is not None and f.share <= t


def _overdue_check(f: Facts, t: int):
    days = f.bki.get("max_overdue_days_12m")
    return days, days is not None and days <= t


# code -> check(facts, threshold) -> (value, passed); value None means "no data"
CHECKS = {
    "egrul_status": lambda f, t: (f.egrul.get("status"), f.egrul.get("status") not in t),
    "bki_overdue": _overdue_check,
    "risk_class": lambda f, t: (f.risk_class, f.risk_class is not None and f.risk_class not in t),
    "business_age": lambda f, t: (f.age_months, f.age_months is not None and f.age_months >= t),
    "amount_min": lambda f, t: (f.amount, f.amount >= t),
    "amount_max": lambda f, t: (f.amount, f.amount <= t),
    "term_min": lambda f, t: (f.term, f.term >= t),
    "term_max": lambda f, t: (f.term, f.term <= t),
    "payment_share": _share_check,
    "payment_share_max": _share_check,
    "financial_statements": lambda f, t: (f.has_statements, f.amount <= t or f.has_statements),
    "other_bank_revenue": lambda f, t: (f.other_bank, not f.other_bank),
}


def _payload(sources: dict, name: str) -> dict:
    return (sources.get(name) or {}).get("payload") or {}


def _facts(application: dict, sources: dict, score: dict, rate: float, today: date) -> Facts:
    egrul = _payload(sources, "egrul")
    statement = _payload(sources, "statement")
    amount, term = application["amount_rub"], application["term_months"]
    net_flow = statement.get("avg_net_flow_rub") or 0
    docs = {d.get("type") for d in application.get("documents") or []}
    return Facts(
        amount=amount,
        term=term,
        risk_class=score.get("risk_class"),
        egrul=egrul,
        bki=_payload(sources, "bki"),
        has_statements="financial_statements" in docs,
        other_bank=bool(statement.get("revenue_to_other_bank")),
        age_months=months_between(egrul.get("registration_date"), today),
        net_flow=net_flow,
        share=monthly_payment(amount, term, rate) / net_flow if net_flow > 0 else None,
    )


def _run_rules(rules: dict, product: str, facts: Facts) -> list[tuple[dict, dict]]:
    """All rules that apply to the product, with their results (in yaml order)."""
    limits = rules["products"][product]
    out = []
    for rule in rules["rules"]:
        if rule["products"] != "all" and product not in rule["products"]:
            continue
        threshold = rule.get("threshold", rule.get("reject_classes"))
        if "limit" in rule:
            threshold = limits.get(rule["limit"])
            if threshold is None:
                continue
        value, passed = CHECKS[rule["code"]](facts, threshold)
        out.append((rule, {"code": rule["code"], "value": value, "threshold": threshold, "passed": passed}))
    return out


def _rec(kind: str = "none", amount=None, term=None, documents=None) -> dict:
    return {"kind": kind, "amount": amount, "term_months": term, "documents": documents or []}


def _percents(share: float, threshold: float) -> tuple[str, str]:
    """Whole percents; one decimal when whole ones would look equal (30.4% vs 30%)."""
    if round(share * 100) == round(threshold * 100) and share != threshold:
        return f"{share * 100:.1f}%".replace(".", ","), f"{round(threshold * 100)}%"
    return f"{round(share * 100)}%", f"{round(threshold * 100)}%"


def _payment_rec(facts: Facts, share_rule: dict | None, too_high: bool, limits: dict, rate: float):
    """Counter offer, or 'reduce the amount' when the payment share is too high."""
    share = facts.share
    if share_rule and not too_high and facts.risk_class in share_rule["counter_classes"]:
        safe = safe_amount(facts.net_flow, facts.term, rate, share_rule["target_share"], share_rule["step"])
        if safe >= limits.get("min_amount", 1):
            now, limit = _percents(share, share_rule["threshold"])
            text = (
                f"Встречное предложение: {_money(safe)} на {facts.term} мес. "
                f"— доля платежа {now} выше порога {limit}"
            )
            return _rec("counter_offer", safe, facts.term), text
    now, _ = _percents(share, 1)
    return _rec("reduce_amount"), f"Доля платежа {now} слишком высокая — предложить уменьшить сумму"


def _review_reasons(auto: dict, sources: dict, facts: Facts) -> list[str]:
    """Which auto-approve conditions failed, in plain words."""
    reasons = []
    bad = [TITLES[s] for s in SOURCES if (sources.get(s) or {}).get("status") != "ok"]
    if bad:
        reasons.append("нет ответа от источников: " + ", ".join(bad))
    if facts.amount > auto["max_amount"]:
        reasons.append(
            f"сумма {_money(facts.amount)} больше лимита автоодобрения {_money(auto['max_amount'])}"
        )
    if facts.risk_class not in auto["classes"]:
        reasons.append(
            f"класс риска {facts.risk_class or 'не определён'} не входит в {', '.join(auto['classes'])}"
        )
    return reasons


def evaluate(application: dict, sources: dict, score: dict, rules: dict, today: date) -> Decision:
    product = application["product"]
    limits = rules["products"][product]
    rate = limits["annual_rate"]
    facts = _facts(application, sources, score, rate, today)
    ran = _run_rules(rules, product, facts)
    results = [r for _, r in ran]
    failed_rules = [(rule, r) for rule, r in ran if not r["passed"]]
    failed = [r["code"] for _, r in failed_rules]
    payment = monthly_payment(facts.amount, facts.term, rate)
    share = None if facts.share is None else round(facts.share, 4)

    def decision(outcome: str, rec: dict, explanation: str, client_reason: str | None = None) -> Decision:
        return Decision(outcome, rec, explanation, client_reason, results, payment, share, failed)

    # no data is not a reason to reject: the underwriter gets a note
    unknown = [rule for rule, r in failed_rules if r["value"] is None]
    # the missing statement is asked for as a document, so it needs no note
    notes = [
        f"Нет данных для проверки: {rule['description']}"
        for rule in unknown
        if rule["code"] not in ("payment_share", "payment_share_max")
    ]
    note_text = "".join(f". {n}" for n in notes)

    # stop rules, requirements: the first one that decides ends the evaluation
    for rule, r in failed_rules:
        if r["value"] is None:
            continue
        if rule.get("on_fail") == "rejected":
            reason = rule["client_text"].replace("{threshold}", str(r["threshold"]))
            return decision("rejected", _rec(), reason, reason)
        if rule.get("on_fail") == "manual_review":
            return decision("manual_review", _rec(), rule["description"])

    codes = set(failed)
    share_rule = next((rule for rule, _ in ran if rule["code"] == "payment_share"), None)
    if facts.share is not None and codes & {"payment_share", "payment_share_max"}:
        rec, text = _payment_rec(facts, share_rule, "payment_share_max" in codes, limits, rate)
        return decision("manual_review", rec, text + note_text)

    docs = [d for rule, _ in failed_rules if rule.get("on_fail") == "request_data" for d in rule["documents"]]
    if share_rule in unknown:
        docs = share_rule["no_data_documents"] + docs
    if docs:
        text = "Запросить у клиента: " + "; ".join(docs)
        return decision("manual_review", _rec("request_data", documents=docs), text + note_text)
    if notes:
        return decision("manual_review", _rec(), ". ".join(notes))

    reasons = _review_reasons(rules["auto_approve"], sources, facts)
    if not reasons:
        text = "Автоодобрение: небольшая сумма, хороший класс риска, все правила пройдены"
        return decision("approved", _rec(), text)
    return decision("manual_review", _rec(), "Нужно решение кредитного специалиста: " + "; ".join(reasons))
