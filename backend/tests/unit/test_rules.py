import pytest

from app.rules.engine import load_rules
from tests.source_mocks import load_json

EXPECTED = load_json("rules_expected")


@pytest.mark.smoke
@pytest.mark.positive
@pytest.mark.parametrize("name", list(EXPECTED["seeds"]))
def test_seed_clients(decide, name):
    want = EXPECTED["seeds"][name]
    got = decide(name)
    assert got.outcome == want["outcome"]
    assert got.recommendation["kind"] == want["kind"]
    assert got.recommendation["amount"] == want["amount"]
    assert got.recommendation["term_months"] == want["term_months"]
    assert got.share == want["share"]


@pytest.mark.positive
def test_igor_payment_and_text(decide):
    got = decide("igor")
    assert 196_400 <= got.payment_rub <= 196_500
    assert got.explanation == (
        "Встречное предложение: 2 400 000 ₽ на 18 мес. — доля платежа 32% выше порога 30%"
    )


@pytest.mark.positive
def test_marina_documents(decide):
    got = decide("marina")
    assert got.recommendation["documents"] == [
        "Бухгалтерская отчётность за последний год",
        "Выписка по счёту в другом банке за 12 месяцев",
    ]
    assert got.failed == ["financial_statements", "other_bank_revenue"]


@pytest.mark.positive
def test_sergey_reason_is_plain(decide):
    got = decide("sergey")
    assert "просрочка" in got.client_reason
    assert got.explanation == got.client_reason


@pytest.mark.positive
def test_results_have_all_fields(decide):
    results = decide("igor").results
    assert {"code", "value", "threshold", "passed"} == set(results[0])
    share = next(r for r in results if r["code"] == "payment_share")
    assert share["threshold"] == 0.3
    assert not share["passed"]


@pytest.mark.positive
def test_rule_not_in_product_is_skipped(decide):
    codes = [r["code"] for r in decide("anna").results]
    assert "business_age" not in codes


@pytest.mark.positive
@pytest.mark.parametrize("case", EXPECTED["cases"], ids=lambda c: c["patch"])
def test_changed_data(decide, case):
    got = decide(case["case"], case["patch"])
    assert got.outcome == case["outcome"]
    assert got.recommendation["kind"] == case["kind"]
    if case["failed"]:
        assert case["failed"] in got.failed
    if "documents" in case:
        assert got.recommendation["documents"] == case["documents"]
    assert case.get("explanation_part", "") in got.explanation


@pytest.mark.positive
def test_threshold_change_changes_outcome(decide):
    assert decide("sergey").outcome == "rejected"
    assert decide("sergey", "overdue_limit_90").outcome == "manual_review"


@pytest.mark.positive
def test_rejection_has_client_reason_and_no_recommendation(decide):
    got = decide("anna", "liquidating")
    assert got.client_reason
    assert got.recommendation["kind"] == "none"


@pytest.mark.negative
def test_unknown_product(decide):
    with pytest.raises(KeyError):
        decide("anna", "unknown_product")


@pytest.mark.positive
def test_yaml_has_product_limits():
    products = load_rules()["products"]
    assert products["overdraft"]["max_amount"] == 20_000_000
    assert products["credit_line"]["max_term"] == 18
    assert products["any_purpose"]["min_age_months"] == 12
    assert {p["annual_rate"] for p in products.values()} == {0.215}
