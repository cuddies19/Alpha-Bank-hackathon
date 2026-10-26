import pytest

from app import generator


@pytest.mark.positive
def test_deterministic(generator_inn: str) -> None:
    inn = generator_inn
    assert generator.egrul(inn) == generator.egrul(inn)
    assert generator.fns(inn) == generator.fns(inn)
    assert generator.bki(inn) == generator.bki(inn)
    assert generator.statement(inn) == generator.statement(inn)


@pytest.mark.positive
def test_different_inns_differ(data) -> None:
    first, second = data("generator")["other_inns"]
    assert generator.statement(first) != generator.statement(second)


@pytest.mark.positive
def test_entity_type_from_length(data) -> None:
    case = data("generator")
    ul, ip = case["ul"], case["ip"]
    ul_body, ip_body = generator.egrul(ul["inn"]), generator.egrul(ip["inn"])
    assert ul_body["entity_type"] == ul["entity_type"]
    assert len(ul_body["ogrn"]) == ul["ogrn_len"]
    assert ul["absent_key"] not in ul_body
    assert ip_body["entity_type"] == ip["entity_type"]
    assert len(ip_body[ip["ogrn_key"]]) == ip["ogrn_len"]
    assert ip["absent_key"] not in ip_body


@pytest.mark.positive
def test_statement_invariants(data) -> None:
    case = data("generator")["statement"]
    s = generator.statement(case["inn"], case["months"])
    labels = [m["month"] for m in s["months"]]
    assert len(labels) == case["months"]
    assert labels == sorted(labels)
    assert all(m["inflow_rub"] > 0 and m["outflow_rub"] > 0 for m in s["months"])
    assert s["balance_rub"] > 0
    assert 0 <= s["marketplace_share"] <= 1
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in s["months"]]
    assert s["avg_net_flow_rub"] == round(sum(nets) / case["months"])


@pytest.mark.positive
def test_month_labels_cross_year(data) -> None:
    first, single = data("generator")["month_labels"]
    assert generator.month_labels(first["months"])[0] == first["first"]
    assert generator.month_labels(single["months"]) == single["all"]
