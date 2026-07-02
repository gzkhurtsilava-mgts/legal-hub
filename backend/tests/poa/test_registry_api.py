"""M3: HTTP-тесты реестра доверенностей — CRUD, выдача оригинала, авто-expired,
revoke + срез «кто имеет X», RBAC. Требуют PostgreSQL."""

from datetime import date, timedelta

import pytest

pytestmark = pytest.mark.asyncio

BASE = "/api/poa"


async def _authority(client, code="POA-R1"):
    cat = (await client.post(f"{BASE}/categories/", json={"level": 1, "name": "Кат"})).json()
    return (
        await client.post(
            f"{BASE}/authorities/",
            json={"code": code, "category_id": cat["id"], "name_short": "П",
                  "text_full": "т", "authority_kind": "action", "status": "active"},
        )
    ).json()


async def _mk_cert(client, number, authority_ids, valid_to=None):
    payload = {
        "number": number, "grantor_company": "МГТС", "grantee_fio": "Иванов И.И.",
        "cert_type": "paper", "issued_date": "2026-01-01", "authority_ids": authority_ids,
    }
    if valid_to is not None:
        payload["valid_to"] = valid_to
    return await client.post(f"{BASE}/registry/", json=payload)


async def test_certificate_crud_with_authorities(client, as_lawyer):
    a1 = await _authority(client, "POA-A1")
    a2 = await _authority(client, "POA-A2")
    r = await _mk_cert(client, "2026-001", [a1["id"], a2["id"]])
    assert r.status_code == 201, r.text
    cert = r.json()
    # перечень полномочий — FK-ссылки, не текст
    assert {a["code"] for a in cert["authorities"]} == {"POA-A1", "POA-A2"}
    assert cert["status"] == "active"

    r = await client.get(f"{BASE}/registry/{cert['id']}")
    assert r.status_code == 200
    assert r.json()["number"] == "2026-001"

    # замена перечня полномочий
    r = await client.put(
        f"{BASE}/registry/{cert['id']}", json={"authority_ids": [a1["id"]]}
    )
    assert r.status_code == 200
    assert {a["code"] for a in r.json()["authorities"]} == {"POA-A1"}


async def test_duplicate_number_and_bad_authority(client, as_lawyer):
    a1 = await _authority(client, "POA-B1")
    assert (await _mk_cert(client, "2026-010", [a1["id"]])).status_code == 201
    assert (await _mk_cert(client, "2026-010", [a1["id"]])).status_code == 409
    assert (await _mk_cert(client, "2026-011", [9999])).status_code == 400


async def test_who_has_authority_and_revoke(client, as_lawyer):
    a1 = await _authority(client, "POA-C1")
    cert = (await _mk_cert(client, "2026-020", [a1["id"]])).json()

    # срез «кто имеет полномочие X» — активные доверенности
    r = await client.get(f"{BASE}/registry/?authority_id={a1['id']}&status=active")
    assert [c["number"] for c in r.json()] == ["2026-020"]

    # отзыв → авто-инвалидация: из активного среза исчезает
    r = await client.post(f"{BASE}/registry/{cert['id']}/revoke")
    assert r.status_code == 200 and r.json()["status"] == "revoked"
    r = await client.get(f"{BASE}/registry/?authority_id={a1['id']}&status=active")
    assert r.json() == []
    # без фильтра статуса — по-прежнему видна как отозванная
    r = await client.get(f"{BASE}/registry/?authority_id={a1['id']}")
    assert [c["status"] for c in r.json()] == ["revoked"]

    # повторный отзыв → 409
    assert (await client.post(f"{BASE}/registry/{cert['id']}/revoke")).status_code == 409


async def test_auto_expired(client, as_lawyer):
    a1 = await _authority(client, "POA-D1")
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    cert = (await _mk_cert(client, "2026-030", [a1["id"]], valid_to=yesterday)).json()
    # при чтении срок истёк → статус expired
    r = await client.get(f"{BASE}/registry/{cert['id']}")
    assert r.json()["status"] == "expired"


async def test_original_issue(client, as_lawyer):
    a1 = await _authority(client, "POA-E1")
    cert = (await _mk_cert(client, "2026-040", [a1["id"]])).json()
    r = await client.post(
        f"{BASE}/registry/{cert['id']}/original-issue",
        json={"recipient_fio": "Петров П.П.", "issued_date": "2026-02-01",
              "method": "in_person", "confirmed": True},
    )
    assert r.status_code == 201, r.text
    assert r.json()["method"] == "in_person"

    r = await client.get(f"{BASE}/registry/{cert['id']}/original-issues")
    assert len(r.json()) == 1
    assert r.json()[0]["recipient_fio"] == "Петров П.П."


async def test_registry_forbidden_for_employee(client, as_employee):
    assert (await client.get(f"{BASE}/registry/")).status_code == 403
    r = await _mk_cert(client, "2026-050", [])
    assert r.status_code == 403
