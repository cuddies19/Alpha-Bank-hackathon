import pytest

from app.rules.payments import monthly_payment, safe_amount

RATE = 0.215
TARGET = 0.26
STEP = 100_000


@pytest.mark.positive
def test_monthly_payment():
    assert monthly_payment(3_000_000, 18, RATE) == 196_460


@pytest.mark.positive
def test_monthly_payment_zero_rate():
    assert monthly_payment(1_200_000, 12, 0) == 100_000


@pytest.mark.positive
def test_safe_amount_rounds_down_to_step():
    assert safe_amount(610_000, 18, RATE, TARGET, STEP) == 2_400_000


@pytest.mark.positive
def test_safe_amount_payment_fits_target():
    amount = safe_amount(610_000, 18, RATE, TARGET, STEP)
    assert monthly_payment(amount, 18, RATE) <= 610_000 * 0.26


@pytest.mark.positive
def test_safe_amount_custom_step():
    assert safe_amount(610_000, 18, RATE, TARGET, 10_000) == 2_420_000


@pytest.mark.negative
def test_safe_amount_zero_flow():
    assert safe_amount(0, 18, RATE, TARGET, STEP) == 0
