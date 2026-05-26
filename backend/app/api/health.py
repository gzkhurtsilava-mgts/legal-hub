from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Проверка работоспособности API."""
    return HealthResponse(status="ok", service="legal-hub-backend")
