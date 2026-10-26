import pytest

from app import modes


@pytest.mark.positive
def test_parse_modes(data) -> None:
    cases = data("modes")["parse"]
    assert modes.parse_modes(cases["valid"]["input"]) == cases["valid"]["expected"]
    assert modes.parse_modes(cases["empty"]["input"]) == cases["empty"]["expected"]


@pytest.mark.negative
def test_parse_modes_bad_entry(data) -> None:
    cases = data("modes")["parse"]
    for entry in cases["bad_entries"]:
        with pytest.raises(ValueError, match=cases["error_text"]):
            modes.parse_modes(entry)
