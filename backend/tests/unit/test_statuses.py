import pytest

from app.db.statuses import STATUS_LABELS, STATUSES, TRANSITIONS, check_transition


@pytest.mark.positive
def test_every_status_has_russian_label() -> None:
    assert set(STATUS_LABELS) == set(STATUSES)
    for label in STATUS_LABELS.values():
        assert any("а" <= c.lower() <= "я" for c in label)


@pytest.mark.positive
def test_transitions_table_is_consistent() -> None:
    assert set(TRANSITIONS) == set(STATUSES)
    for targets in TRANSITIONS.values():
        assert targets <= set(STATUSES)


@pytest.mark.positive
def test_transition_edges_are_pinned(expected) -> None:
    assert {k: set(v) for k, v in expected["transitions"].items()} == TRANSITIONS


@pytest.mark.positive
def test_legal_transition_passes(unit) -> None:
    assert check_transition(*unit["legal_transition"]) is None


@pytest.mark.negative
def test_illegal_transitions_raise(unit) -> None:
    for from_status, to_status in unit["illegal_transitions"]:
        with pytest.raises(ValueError, match="illegal status change"):
            check_transition(from_status, to_status)


@pytest.mark.negative
def test_illegal_transition_message(unit) -> None:
    with pytest.raises(ValueError, match="illegal") as e:
        check_transition("draft", "approved")
    assert str(e.value) == unit["illegal_message"]
