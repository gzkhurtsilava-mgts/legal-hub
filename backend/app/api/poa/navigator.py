from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import UserContext, get_current_user
from app.schemas.poa import NavigatorAnswers, NavigatorStepResponse
from app.services.poa import navigator as nav

router = APIRouter(prefix="/navigator", tags=["poa-navigator"])

_AUTH = Depends(get_current_user)


@router.post("/step", response_model=NavigatorStepResponse)
async def navigator_step(
    body: NavigatorAnswers,
    _: UserContext = _AUTH,
) -> dict:
    answers = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        return nav.step(answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
