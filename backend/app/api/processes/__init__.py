from fastapi import APIRouter

from app.api.processes import domains, refs, utils

router = APIRouter(prefix="/processes", tags=["processes"])

router.include_router(refs.router)
router.include_router(domains.router)
router.include_router(utils.router)
