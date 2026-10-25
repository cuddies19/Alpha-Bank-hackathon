from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import require_client
from app.models import Loan, User
from app.schemas.applications import LoanOut
from app.services.presenters import loan_out

router = APIRouter(tags=["client"])


@router.get("/loans", response_model=list[LoanOut])
def loans(user: User = Depends(require_client), db: Session = Depends(get_db)) -> list[LoanOut]:
    rows = db.scalars(
        select(Loan)
        .where(Loan.company_id == user.company_id)
        .options(selectinload(Loan.application))
        .order_by(Loan.issued_at.desc())
    )
    return [loan_out(loan) for loan in rows]
