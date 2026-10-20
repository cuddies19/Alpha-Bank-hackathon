STATUSES = (
    "draft",
    "submitted",
    "completeness_check",
    "needs_info",
    "enrichment",
    "scoring",
    "rules",
    "manual_review",
    "approved",
    "rejected",
    "counter_offer",
    "issued",
)

# From status -> statuses it may move to. Empty means final.
TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted"},
    "submitted": {"completeness_check"},
    "completeness_check": {"needs_info", "enrichment", "manual_review"},
    "needs_info": {"submitted"},
    "enrichment": {"scoring", "manual_review"},
    "scoring": {"rules", "manual_review"},
    "rules": {"approved", "rejected", "manual_review", "counter_offer"},
    "manual_review": {"approved", "rejected", "counter_offer", "needs_info"},
    "counter_offer": {"approved", "rejected"},
    "approved": {"issued"},
    "rejected": set(),
    "issued": set(),
}


def check_transition(from_status: str, to_status: str) -> None:
    if to_status not in TRANSITIONS.get(from_status, set()):
        raise ValueError(f"illegal status change: {from_status} -> {to_status}")
