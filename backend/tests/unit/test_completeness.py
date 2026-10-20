import pytest

from app.pipeline import stages
from app.pipeline.stages import failed_sources_label, missing_items
from tests.source_mocks import load_json

EXPECTED = load_json("expected")


@pytest.mark.positive
@pytest.mark.parametrize("name", EXPECTED["complete_rows"])
def test_complete_application_has_nothing_missing(row, name) -> None:
    assert missing_items(row(name)) == []


@pytest.mark.negative
@pytest.mark.parametrize("case", EXPECTED["incomplete_rows"], ids=lambda c: c["row"])
def test_missing_fields_and_consents_are_listed(row, case) -> None:
    assert missing_items(row(case["row"])) == case["missing"]


@pytest.mark.negative
def test_required_documents_per_product(monkeypatch, row, expected) -> None:
    monkeypatch.setitem(stages.REQUIRED_DOCUMENTS, "overdraft", ("passport",))
    assert missing_items(row("with_document")) == expected["missing_passport"]
    assert missing_items(row("with_passport")) == []


@pytest.mark.positive
@pytest.mark.parametrize("case", EXPECTED["failed_sources"], ids=lambda c: str(c["label"]))
def test_failed_sources_label(results, case) -> None:
    assert failed_sources_label(results(case["statuses"])) == case["label"]


@pytest.mark.positive
def test_documents_given_as_plain_names(monkeypatch, row) -> None:
    monkeypatch.setitem(stages.REQUIRED_DOCUMENTS, "overdraft", ("passport",))
    assert missing_items(row("with_str_passport")) == []
