from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Приложение
    app_env: str = "development"
    secret_key: str = "dev-secret-key-замените-в-проде"

    # БД
    database_url: str = "postgresql+asyncpg://legalhub:legalhub_dev@localhost:5432/legalhub"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # JWT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7


settings = Settings()
