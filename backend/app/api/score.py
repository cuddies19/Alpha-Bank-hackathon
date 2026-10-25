from __future__ import annotations

from fastapi import APIRouter

from app.schemas.score import ScoreRequest, ScoreResponse
from app.services.scoring import calculate_score

router = APIRouter(tags=["scoring"])


@router.post("/score", response_model=ScoreResponse)
def score(payload: ScoreRequest) -> ScoreResponse:
    """Return a preliminary demo risk score for the supplied company features."""
    value, risk_class = calculate_score(payload.features)
    return ScoreResponse(score=value, risk_class=risk_class)
