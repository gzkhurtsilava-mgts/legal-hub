from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import health
from app.api import auth

app = FastAPI(
    title="Legal Hub API",
    description="Портал БПО — API",
    version="0.1.0",
    # В проде скрываем документацию
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url="/redoc" if settings.app_env == "development" else None,
)

# CORS — разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роуты
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api")


@app.on_event("startup")
async def startup():
    # Здесь будут инициализации при старте (кэш, воркеры)
    pass
