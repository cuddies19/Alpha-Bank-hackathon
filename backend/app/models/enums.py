from __future__ import annotations

import enum


class UserRole(str, enum.Enum):
    client = "client"
    underwriter = "underwriter"


class CompanyType(str, enum.Enum):
    llc = "ООО"
    sole_proprietor = "ИП"


class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    processing = "processing"
    manual_review = "manual_review"
    client_action = "client_action"
    approved = "approved"
    counter_offer = "counter_offer"
    rejected = "rejected"
    signing = "signing"
    signed = "signed"
    issued = "issued"
    client_declined = "client_declined"
    withdrawn = "withdrawn"


class ActorType(str, enum.Enum):
    client = "client"
    system = "system"
    underwriter = "underwriter"


class DocumentStatus(str, enum.Enum):
    uploaded = "uploaded"
    accepted = "accepted"
    rejected = "rejected"


class SourceStatus(str, enum.Enum):
    ok = "ok"
    warn = "warn"
    fail = "fail"
    unavailable = "unavailable"


class DecisionOutcome(str, enum.Enum):
    approve = "approve"
    counter = "counter"
    request = "request"
    decline = "decline"


class NotificationType(str, enum.Enum):
    status_change = "status_change"
    decision = "decision"
    document_request = "document_request"
    info = "info"
