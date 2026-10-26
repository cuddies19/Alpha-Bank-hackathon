from fractions import Fraction

import pytest


@pytest.mark.positive
def test_seed_files_exist(seed_files, data) -> None:
    assert len(seed_files) == data("seeds")["count"]


@pytest.mark.positive
def test_seed_has_required_keys(seed, seed_path, data) -> None:
    expected = data("seeds")
    assert seed.keys() >= set(expected["required_keys"])
    assert seed["inn"] == seed_path.stem
    assert len(seed["statement"]["months"]) == expected["months_count"]


@pytest.mark.positive
def test_avg_net_flow_is_mean_of_months(seed) -> None:
    statement = seed["statement"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in statement["months"]]
    assert Fraction(sum(nets), len(nets)) == statement["avg_net_flow_rub"]


@pytest.mark.positive
def test_igor_avg_net_flow_is_610000(igor_seed, data) -> None:
    expected = data("seeds")["igor"]["avg_net_flow_rub"]
    statement = igor_seed["statement"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in statement["months"]]
    assert sum(nets) == expected * 12
    assert statement["avg_net_flow_rub"] == expected
