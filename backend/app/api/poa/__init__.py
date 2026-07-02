from fastapi import APIRouter

from app.api.poa import (
    authorities,
    categories,
    employees,
    limit_rules,
    matrix,
    org_levels,
    org_scopes,
    registry,
    requests,
    resolve,
)

router = APIRouter(prefix="/poa", tags=["poa"])

router.include_router(categories.router)
router.include_router(authorities.router)
router.include_router(org_scopes.router)
router.include_router(org_levels.router)
router.include_router(limit_rules.router)
router.include_router(matrix.router)
router.include_router(employees.router)
router.include_router(resolve.router)
router.include_router(requests.router)
router.include_router(registry.router)
