from fastapi import APIRouter

from app.api.processes import activities, domains, processes, refs, sops, utils

router = APIRouter(prefix="/processes", tags=["processes"])

# specific sub-routers first — must precede the parameterized /{process_id} routes
router.include_router(refs.router)
router.include_router(domains.router)
router.include_router(utils.router)
# activities and sops have nested paths like /{process_id}/activities/... — register before processes
router.include_router(activities.router)
router.include_router(sops.router)
router.include_router(processes.router)
