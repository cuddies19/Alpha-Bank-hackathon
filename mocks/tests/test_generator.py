import pytest

from app import generator


@pytest.mark.small
@pytest.mark.parametrize("inn", ["1234567890", "123456789012"])
def test_deterministic(inn: str) -> None:
    assert generator.egrul(inn) == generator.egrul(inn)
    assert generator.fns(inn) == generator.fns(inn)
    assert generator.bki(inn) == generator.bki(inn)
    assert generator.statement(inn) == generator.statement(inn)


@pytest.mark.small
def test_different_inns_differ() -> None:
    assert generator.statement("1234567890") != generator.statement("1234567891")


@pytest.mark.small
def test_entity_type_from_length() -> None:
    ul, ip = generator.egrul("1234567890"), generator.egrul("123456789012")
    assert ul["entity_type"] == "ul"
    assert len(ul["ogrn"]) == 13
    assert "ogrnip" not in ul
    assert ip["entity_type"] == "ip"
    assert len(ip["ogrnip"]) == 15
    assert "ogrn" not in ip


@pytest.mark.small
def test_statement_invariants() -> None:
    s = generator.statement("1234567890", 12)
    labels = [m["month"] for m in s["months"]]
    assert len(labels) == 12
    assert labels == sorted(labels)
    assert all(m["inflow_rub"] > 0 and m["outflow_rub"] > 0 for m in s["months"])
    assert s["balance_rub"] > 0
    assert 0 <= s["marketplace_share"] <= 1
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in s["months"]]
    assert s["avg_net_flow_rub"] == round(sum(nets) / 12)


@pytest.mark.small
def test_month_labels_cross_year() -> None:
    assert generator.month_labels(12)[0] == "2025-11"
    assert generator.month_labels(1) == ["2026-10"]
