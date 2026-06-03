import logging

from arq.connections import RedisSettings

from app.core.config import settings

logger = logging.getLogger(__name__)


async def startup(ctx: dict) -> None:
    logger.info("Worker started")


async def shutdown(ctx: dict) -> None:
    logger.info("Worker stopped")


async def noop(ctx: dict) -> None:
    """Placeholder — required by arq until real tasks are registered in M4."""
    pass


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    on_startup = startup
    on_shutdown = shutdown
    functions = [noop]
    # M4: заменить noop на [convert_to_pdf, extract_text]
