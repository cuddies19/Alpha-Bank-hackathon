from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.models import CompanyType, UserRole


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    inn: str
    ogrn: str
    type: CompanyType
    name: str
    registration_date: date | None = None
    okved: str | None = None
    address: str | None = None
    director: str | None = None
    phone: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    login: str
    full_name: str
    role: UserRole
    company: CompanyOut | None = None


class LoginRequest(BaseModel):
    login: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
