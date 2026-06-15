from fastapi import APIRouter

from app.api.processes import domains, processes, refs, utils

router = APIRouter(prefix="/processes", tags=["processes"])

# specific sub-routers first — must precede the parameterized /{process_id} routes
router.include_router(refs.router)
router.include_router(domains.router)
router.include_router(utils.router)
router.include_router(processes.router)
