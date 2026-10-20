from pydantic import BaseModel, Field

INN_PATTERN = r"^([0-9]{10}|[0-9]{12})$"


class Egrul(BaseModel):
    inn: str
    ogrn: str | None = None
    ogrnip: str | None = None
    entity_type: str
    full_name: str
    status: str
    registration_date: str
    okved: str
    address: str
    head_name: str


class Fns(BaseModel):
    tax_debt_rub: int
    address_unreliable: bool
    income_last_year_rub: int
    expenses_last_year_rub: int
    avg_headcount: int
    tax_regime: str
    mass_director: bool


class BkiRequest(BaseModel):
    inn: str = Field(pattern=INN_PATTERN)
    consent_id: str


class Loan(BaseModel):
    bank: str
    balance_rub: int
    monthly_payment_rub: int


class Bki(BaseModel):
    loans: list[Loan]
    max_overdue_days_12m: int
    max_overdue_days_24m: int
    inquiries_30d: int


class Month(BaseModel):
    month: str
    inflow_rub: int
    outflow_rub: int


class Statement(BaseModel):
    months: list[Month]
    balance_rub: int
    avg_net_flow_rub: int
    marketplace_share: float
    revenue_to_other_bank: bool
    inflow_30d_rub: int
