"""M1: CRUD-эндпоинты фундамента Модуля 1 (каталог + деревья + лимиты).

Проверяется: RBAC (юрист 200 / employee 403), уникальность (code, rank, комбинация
лимита), FK-валидация (400), guard'ы на удаление (409). Требуют PostgreSQL (см. conftest).
"""

from decimal import Decimal

import pytest

pytestmark = pytest.mark.asyncio

BASE = "/api/poa"


# ─── helpers ──────────────────────────────────────────────────────────────────


async def _mk_category(client, **over):
    payload = {"level": 1, "name": "Сделки", "sort_order": 0, **over}
    r = await client.post(f"{BASE}/categories/", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


async def _mk_level(client, **over):
    payload = {"code": "CEO-1", "rank": 1, **over}
    r = await client.post(f"{BASE}/org-levels/", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


async def _mk_authority(client, category_id, **over):
    payload = {
        "code": "POA-DEAL-001",
        "category_id": category_id,
        "name_short": "Подписание договоров",
        "text_full": "Право подписывать договоры от имени общества.",
        "authority_kind": "deal",
        **over,
    }
    r = await client.post(f"{BASE}/authorities/", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ─── RBAC: employee получает 403 на всём каталоге ────────────────────────────


async def test_employee_forbidden_everywhere(client, as_employee):
    for path in ("categories", "authorities", "org-scopes", "org-levels", "limit-rules"):
        r = await client.get(f"{BASE}/{path}/")
        assert r.status_code == 403, f"GET {path}: {r.status_code}"
    r = await client.post(f"{BASE}/categories/", json={"level": 1, "name": "x"})
    assert r.status_code == 403


# ─── Categories ──────────────────────────────────────────────────────────────


async def test_category_crud(client, as_lawyer):
    cat = await _mk_category(client)
    cid = cat["id"]

    r = await client.get(f"{BASE}/categories/{cid}")
    assert r.status_code == 200
    assert r.json()["name"] == "Сделки"

    child = await _mk_category(client, parent_id=cid, level=2, name="Подкатегория")

    r = await client.get(f"{BASE}/categories/")
    assert r.status_code == 200
    assert {c["id"] for c in r.json()} == {cid, child["id"]}

    r = await client.put(f"{BASE}/categories/{cid}", json={"name": "Сделки (изм.)"})
    assert r.status_code == 200
    assert r.json()["name"] == "Сделки (изм.)"

    # нельзя удалить родителя с детьми
    r = await client.delete(f"{BASE}/categories/{cid}")
    assert r.status_code == 409

    # ребёнка удалить можно, затем и родителя
    assert (await client.delete(f"{BASE}/categories/{child['id']}")).status_code == 204
    assert (await client.delete(f"{BASE}/categories/{cid}")).status_code == 204


async def test_category_level_validation(client, as_lawyer):
    r = await client.post(f"{BASE}/categories/", json={"level": 6, "name": "x"})
    assert r.status_code == 422


async def test_category_bad_parent(client, as_lawyer):
    r = await client.post(
        f"{BASE}/categories/", json={"level": 2, "name": "x", "parent_id": 9999}
    )
    assert r.status_code == 400


# ─── Authorities ─────────────────────────────────────────────────────────────


async def test_authority_crud(client, as_lawyer):
    cat = await _mk_category(client)
    auth = await _mk_authority(client, cat["id"])
    aid = auth["id"]
    assert auth["updated_by"]  # проставлен из текущего пользователя

    r = await client.get(f"{BASE}/authorities/?category_id={cat['id']}")
    assert r.status_code == 200
    assert [a["id"] for a in r.json()] == [aid]

    r = await client.put(f"{BASE}/authorities/{aid}", json={"status": "active"})
    assert r.status_code == 200
    assert r.json()["status"] == "active"

    assert (await client.delete(f"{BASE}/authorities/{aid}")).status_code == 204


async def test_authority_duplicate_code(client, as_lawyer):
    cat = await _mk_category(client)
    await _mk_authority(client, cat["id"])
    r = await client.post(
        f"{BASE}/authorities/",
        json={
            "code": "POA-DEAL-001",
            "category_id": cat["id"],
            "name_short": "Дубль",
            "text_full": "текст",
            "authority_kind": "deal",
        },
    )
    assert r.status_code == 409


async def test_authority_bad_category(client, as_lawyer):
    r = await client.post(
        f"{BASE}/authorities/",
        json={
            "code": "POA-X",
            "category_id": 9999,
            "name_short": "x",
            "text_full": "y",
            "authority_kind": "action",
        },
    )
    assert r.status_code == 400


# ─── OrgScopes ───────────────────────────────────────────────────────────────


async def test_org_scope_crud(client, as_lawyer):
    r = await client.post(
        f"{BASE}/org-scopes/",
        json={"scope_type": "metablock", "name": "КЦ", "company": "МГТС",
              "is_corporate_center": True},
    )
    assert r.status_code == 201, r.text
    scope = r.json()
    sid = scope["id"]
    assert scope["company"] == "МГТС"

    child = await client.post(
        f"{BASE}/org-scopes/",
        json={"scope_type": "block", "name": "Блок", "company": "МГТС", "parent_id": sid},
    )
    assert child.status_code == 201

    r = await client.get(f"{BASE}/org-scopes/?company=МГТС")
    assert r.status_code == 200
    assert len(r.json()) == 2

    # родителя с детьми удалить нельзя
    assert (await client.delete(f"{BASE}/org-scopes/{sid}")).status_code == 409


# ─── OrgLevels ───────────────────────────────────────────────────────────────


async def test_org_level_crud_and_uniqueness(client, as_lawyer):
    lvl = await _mk_level(client)
    assert lvl["can_conclude_deals_default"] is True

    # дубль по коду
    r = await client.post(f"{BASE}/org-levels/", json={"code": "CEO-1", "rank": 2})
    assert r.status_code == 409
    # дубль по рангу
    r = await client.post(f"{BASE}/org-levels/", json={"code": "CEO-2", "rank": 1})
    assert r.status_code == 409

    lvl4 = await _mk_level(client, code="CEO-4", rank=4, can_conclude_deals_default=False)
    assert lvl4["can_conclude_deals_default"] is False

    r = await client.get(f"{BASE}/org-levels/")
    assert [x["rank"] for x in r.json()] == [1, 4]


# ─── LimitRules ──────────────────────────────────────────────────────────────


async def test_limit_rule_crud(client, as_lawyer):
    lvl = await _mk_level(client)
    payload = {
        "scope_class": "kc",
        "org_level_id": lvl["id"],
        "exception_kind": "general",
        "amount": "1000000.00",
    }
    r = await client.post(f"{BASE}/limit-rules/", json=payload)
    assert r.status_code == 201, r.text
    rule = r.json()
    assert Decimal(str(rule["amount"])) == Decimal("1000000.00")
    assert rule["currency"] == "RUB"
    assert rule["deal_direction"] == "expense"

    # дубль по уникальной комбинации
    r = await client.post(f"{BASE}/limit-rules/", json=payload)
    assert r.status_code == 409

    # обновление суммы
    r = await client.put(f"{BASE}/limit-rules/{rule['id']}", json={"amount": "2000000"})
    assert r.status_code == 200
    assert Decimal(str(r.json()["amount"])) == Decimal("2000000")

    assert (await client.delete(f"{BASE}/limit-rules/{rule['id']}")).status_code == 204


async def test_limit_rule_bad_level(client, as_lawyer):
    r = await client.post(
        f"{BASE}/limit-rules/",
        json={"scope_class": "kc", "org_level_id": 9999,
              "exception_kind": "general", "amount": "100"},
    )
    assert r.status_code == 400
