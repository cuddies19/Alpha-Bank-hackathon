from __future__ import annotations

from app.schemas.score import ScoreFeatures


def calculate_score(features: ScoreFeatures) -> tuple[int, str]:
    """Transparent demo heuristic. Replace with the approved DS/ML model when available.

    Returns a score on a 300-850 scale and a coarse risk band. This is not a
    trained model and must not be treated as a real lending decision.
    """
    score = 650

    if features.business_age_months < 24:
        score -= 20
    elif features.business_age_months >= 60:
        score += 20

    if features.income_last_year_rub >= 30_000_000:
        score += 20
    elif features.income_last_year_rub < 5_000_000:
        score -= 25

    if features.tax_debt_rub > 0:
        score -= min(80, 20 + features.tax_debt_rub // 100_000 * 5)

    if features.max_overdue_days_12m > 0:
        score -= min(120, 25 + features.max_overdue_days_12m)
    if features.max_overdue_days_24m > 0:
        score -= min(70, 10 + features.max_overdue_days_24m // 2)

    score -= min(40, features.inquiries_30d * 5)
    if features.avg_net_flow_rub < 0:
        score -= 50
    elif features.avg_net_flow_rub >= 500_000:
        score += 10

    if features.marketplace_share >= 0.8:
        score -= 10
    if features.revenue_to_other_bank:
        score -= 10

    if features.avg_net_flow_rub > 0:
        debt_ratio = features.monthly_payments_rub / features.avg_net_flow_rub
        if debt_ratio >= 0.5:
            score -= 35
        elif debt_ratio >= 0.25:
            score -= 20
        elif debt_ratio < 0.1:
            score += 10

    score = max(300, min(850, round(score)))
    if score >= 750:
        risk_class = "A"
    elif score >= 620:
        risk_class = "B"
    elif score >= 500:
        risk_class = "C"
    elif score >= 400:
        risk_class = "D"
    else:
        risk_class = "E"
    return score, risk_class
