"""M3 (Фаза 2): конструктор доверенностей — рендер шаблона в docx.

PDF-ветка (jodconverter) в тесты не включена: внешняя зависимость. Здесь
проверяется генерация docx из размеченного шаблона + RBAC/валидация."""

import pytest

pytestmark = pytest.mark.asyncio

BASE = "/api/poa"


async def _authority(client, code="POA-DOC-1"):
    cat = (await client.post(f"{BASE}/categories/", json={"level": 1, "name": "Кат"})).json()
    return (
        await client.post(
            f"{BASE}/authorities/",
            json={"code": code, "category_id": cat["id"], "name_short": "П",
                  "text_full": "подписывать договоры от имени общества",
                  "authority_kind": "deal", "status": "active"},
        )
    ).json()


async def test_list_templates(client, as_lawyer):
    r = await client.get(f"{BASE}/documents/templates")
    assert r.status_code == 200
    assert "mgts_default" in r.json()


async def test_render_docx(client, as_lawyer):
    a = await _authority(client)
    r = await client.post(
        f"{BASE}/documents/render",
        json={"grantee_fio": "Иванов Иван Иванович", "grantee_passport": "паспорт 4500 123456",
              "validity": "до 31.12.2026", "authority_ids": [a["id"]], "output": "docx"},
    )
    assert r.status_code == 200, r.text
    # docx = zip → сигнатура PK
    assert r.content[:2] == b"PK"
    assert "attachment" in r.headers.get("content-disposition", "")


async def test_render_missing_authority(client, as_lawyer):
    r = await client.post(
        f"{BASE}/documents/render",
        json={"grantee_fio": "Иванов", "authority_ids": [999999]},
    )
    assert r.status_code == 400


async def test_render_bad_template(client, as_lawyer):
    r = await client.post(
        f"{BASE}/documents/render",
        json={"grantee_fio": "Иванов", "template": "no_such_template"},
    )
    assert r.status_code == 404


async def test_render_forbidden_for_employee(client, as_employee):
    assert (await client.get(f"{BASE}/documents/templates")).status_code == 403
    r = await client.post(f"{BASE}/documents/render", json={"grantee_fio": "x"})
    assert r.status_code == 403
