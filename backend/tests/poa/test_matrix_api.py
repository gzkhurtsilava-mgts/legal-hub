"""M2: HTTP-тесты матрицы/резолвинга — правка ячейки → пересчёт, resolve,
заявки (approve → manual_exception), RBAC и аудит. Требуют PostgreSQL.

Ячейка доступности = полномочие × подразделение (уровень на доступность не влияет,
только на лимит)."""

import pytest
from sqlalchemy import func, select

from app.models.poa import PoaAudit

pytestmark = pytest.mark.asyncio

BASE = "/api/poa"


async def _seed_catalog(client):
    """Категория + активное полномочие + уровень + скоуп. Возвращает id."""
    cat = (await client.post(f"{BASE}/categories/", json={"level": 1, "name": "Кат"})).json()
    auth = (
        await client.post(
            f"{BASE}/authorities/",
            json={
                "code": "POA-M2-1", "category_id": cat["id"], "name_short": "П",
                "text_full": "т", "authority_kind": "action", "status": "active",
                "limit_applies": False,
            },
        )
    ).json()
    lvl = (await client.post(f"{BASE}/org-levels/", json={"code": "CEO-1", "rank": 1})).json()
    scope = (
        await client.post(
            f"{BASE}/org-scopes/",
            json={"scope_type": "metablock", "name": "КЦ", "company": "МГТС"},
        )
    ).json()
    return cat, auth, lvl, scope


async def test_cell_upsert_regenerates(client, as_lawyer):
    _, auth, lvl, scope = await _seed_catalog(client)

    r = await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": auth["id"], "org_scope_id": scope["id"], "granted": True},
    )
    assert r.status_code == 200, r.text

    resolved = (await client.get(f"{BASE}/matrix/resolved?authority_id={auth['id']}")).json()
    assert len(resolved) == 1  # 1 скоуп × 1 уровень
    assert resolved[0]["org_scope_id"] == scope["id"]
    assert resolved[0]["org_level_id"] == lvl["id"]

    # повторный PUT (upsert) той же ячейки — по-прежнему одна строка
    r = await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": auth["id"], "org_scope_id": scope["id"], "granted": True},
    )
    assert r.status_code == 200

    # удаление ячейки → пересчёт обнуляет resolved
    r = await client.delete(
        f"{BASE}/matrix/cell?authority_id={auth['id']}&org_scope_id={scope['id']}"
    )
    assert r.status_code == 204
    resolved = (await client.get(f"{BASE}/matrix/resolved?authority_id={auth['id']}")).json()
    assert resolved == []


async def test_cell_upsert_writes_audit(client, as_lawyer, db_session):
    _, auth, lvl, scope = await _seed_catalog(client)
    await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": auth["id"], "org_scope_id": scope["id"], "granted": True},
    )
    cnt = (
        await db_session.execute(
            select(func.count()).select_from(PoaAudit)
            .where(PoaAudit.entity_type == "authority_grant")
        )
    ).scalar_one()
    assert cnt >= 1


async def test_regenerate_endpoint(client, as_lawyer):
    _, auth, lvl, scope = await _seed_catalog(client)
    await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": auth["id"], "org_scope_id": scope["id"], "granted": True},
    )
    r = await client.post(f"{BASE}/matrix/regenerate")
    assert r.status_code == 200
    assert r.json()["resolved_count"] == 1


async def test_resolve_endpoint(client, as_lawyer):
    _, auth, lvl, scope = await _seed_catalog(client)
    await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": auth["id"], "org_scope_id": scope["id"], "granted": True},
    )
    emp = (
        await client.post(
            f"{BASE}/employees/",
            json={"fio": "Иванов И.И.", "company": "МГТС",
                  "org_scope_id": scope["id"], "org_level_id": lvl["id"]},
        )
    ).json()

    r = await client.get(f"{BASE}/resolve/{emp['id']}")
    assert r.status_code == 200
    data = r.json()
    assert data["employee_id"] == emp["id"]
    assert [a["code"] for a in data["authorities"]] == ["POA-M2-1"]


async def test_request_approve_appears_in_resolve(client, as_lawyer):
    cat, auth, lvl, scope = await _seed_catalog(client)
    extra = (
        await client.post(
            f"{BASE}/authorities/",
            json={"code": "POA-EXTRA", "category_id": cat["id"], "name_short": "Э",
                  "text_full": "т", "authority_kind": "action", "status": "active",
                  "limit_applies": False},
        )
    ).json()
    emp = (
        await client.post(
            f"{BASE}/employees/",
            json={"fio": "Петров", "company": "МГТС",
                  "org_scope_id": scope["id"], "org_level_id": lvl["id"]},
        )
    ).json()
    req = (
        await client.post(
            f"{BASE}/authority-requests/",
            json={"employee_id": emp["id"], "authority_id": extra["id"],
                  "justification": "нужно"},
        )
    ).json()

    r = await client.post(f"{BASE}/authority-requests/{req['id']}/approve")
    assert r.status_code == 200
    assert r.json()["status"] == "approved"

    data = (await client.get(f"{BASE}/resolve/{emp['id']}")).json()
    by_code = {a["code"]: a for a in data["authorities"]}
    assert "POA-EXTRA" in by_code
    assert by_code["POA-EXTRA"]["derivation"] == "manual_exception"


async def test_double_approve_conflict(client, as_lawyer):
    cat, auth, lvl, scope = await _seed_catalog(client)
    emp = (
        await client.post(
            f"{BASE}/employees/",
            json={"fio": "Сидоров", "company": "МГТС"},
        )
    ).json()
    req = (
        await client.post(
            f"{BASE}/authority-requests/",
            json={"employee_id": emp["id"], "authority_id": auth["id"]},
        )
    ).json()
    assert (await client.post(f"{BASE}/authority-requests/{req['id']}/approve")).status_code == 200
    # повторное решение → 409
    assert (await client.post(f"{BASE}/authority-requests/{req['id']}/reject")).status_code == 409


async def test_matrix_forbidden_for_employee(client, as_employee):
    for path in ("matrix/", "matrix/resolved", "employees/", "authority-requests/"):
        assert (await client.get(f"{BASE}/{path}")).status_code == 403
    r = await client.put(
        f"{BASE}/matrix/cell",
        json={"authority_id": 1, "granted": True},
    )
    assert r.status_code == 403
    assert (await client.get(f"{BASE}/resolve/1")).status_code == 403
