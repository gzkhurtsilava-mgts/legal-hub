from fastapi import APIRouter

from app.api.poa import authorities, categories, limit_rules, org_levels, org_scopes

router = APIRouter(prefix="/poa", tags=["poa"])

router.include_router(categories.router)
router.include_router(authorities.router)
router.include_router(org_scopes.router)
router.include_router(org_levels.router)
router.include_router(limit_rules.router)
