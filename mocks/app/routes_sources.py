from typing import Annotated

from fastapi import APIRouter, Path, Query, Response

from app import data
from app.models import INN_PATTERN, Bki, BkiRequest, Egrul, Fns, Statement
from app.modes import apply_mode

router = APIRouter()
InnPath = Annotated[str, Path(pattern=INN_PATTERN)]


@router.get("/egrul/{inn}", response_model=Egrul, response_model_exclude_none=True)
async def get_egrul(inn: InnPath, response: Response) -> dict:
    response.headers["X-Mock-Latency-Ms"] = str(await apply_mode("egrul"))
    return data.egrul(inn)


@router.get("/fns/{inn}", response_model=Fns)
async def get_fns(inn: InnPath, response: Response) -> dict:
    response.headers["X-Mock-Latency-Ms"] = str(await apply_mode("fns"))
    return data.fns(inn)


@router.post("/bki/report", response_model=Bki)
async def post_bki_report(body: BkiRequest, response: Response) -> dict:
    response.headers["X-Mock-Latency-Ms"] = str(await apply_mode("bki"))
    return data.bki(body.inn)


@router.get("/statement/{inn}", response_model=Statement)
async def get_statement(
    inn: InnPath, response: Response, months: Annotated[int, Query(ge=1, le=36)] = 12
) -> dict:
    response.headers["X-Mock-Latency-Ms"] = str(await apply_mode("statement"))
    return data.statement(inn, months)
