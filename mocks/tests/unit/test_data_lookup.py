import pytest

from app import data as app_data_module
from app import generator


@pytest.mark.positive
def test_seeded_inn_uses_seed(app_data, igor_seed) -> None:
    inn = app_data["seeded_inn"]
    assert app_data_module.egrul(inn) == igor_seed["egrul"]
    assert app_data_module.fns(inn) == igor_seed["fns"]
    assert app_data_module.bki(inn) == igor_seed["bki"]


@pytest.mark.positive
def test_unknown_inn_falls_back_to_generator(app_data) -> None:
    inn = app_data["unknown_inn"]
    assert app_data_module.egrul(inn) == generator.egrul(inn)
    assert app_data_module.fns(inn) == generator.fns(inn)
    assert app_data_module.bki(inn) == generator.bki(inn)
    assert app_data_module.statement(inn, 5) == generator.statement(inn, 5)


@pytest.mark.positive
def test_seeded_statement_truncates_and_recomputes_average(app_data, igor_seed) -> None:
    result = app_data_module.statement(app_data["seeded_inn"], app_data["months"])
    expected = igor_seed["statement"]["months"][-app_data["months"] :]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in expected]
    assert result["months"] == expected
    assert result["avg_net_flow_rub"] == round(sum(nets) / len(nets))
