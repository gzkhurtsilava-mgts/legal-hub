"""M5 (Фаза 3): личный кабинет — «мои доверенности» и «мои заявки».

Связка сотрудник↔учётка по ФИО (User.full_name). as_employee создаёт
пользователя с full_name='employee' — под него и заводим данные."""

from datetime import date

import pytest

from app.models.poa import (
    Authority,
    AuthorityCategory,
    AuthorityKind,
    AuthorityRequest,
    AuthorityStatus,
    CertificateStatus,
    CertificateType,
    Employee,
    PoaCertificate,
    RequestStatus,
)

pytestmark = pytest.mark.asyncio

BASE = "/api/poa"


async def _flush(db, obj):
    db.add(obj)
    await db.flush()
    return obj


async def test_my_certificates_filtered_by_fio(client, as_employee, db_session):
    await _flush(db_session, PoaCertificate(
        number="M-001", grantor_company="МГТС", grantee_fio="employee",
        cert_type=CertificateType.paper, issued_date=date(2026, 1, 1),
        status=CertificateStatus.active))
    await _flush(db_session, PoaCertificate(
        number="M-002", grantor_company="МГТС", grantee_fio="Другой Человек",
        cert_type=CertificateType.paper, issued_date=date(2026, 1, 1),
        status=CertificateStatus.active))

    r = await client.get(f"{BASE}/my/certificates")
    assert r.status_code == 200
    assert [c["number"] for c in r.json()] == ["M-001"]


async def test_my_requests_enriched(client, as_employee, db_session):
    cat = await _flush(db_session, AuthorityCategory(level=1, name="Кат"))
    auth = await _flush(db_session, Authority(
        code="POA-MY", category_id=cat.id, name_short="Моё полномочие",
        text_full="текст", authority_kind=AuthorityKind.action,
        status=AuthorityStatus.active))
    emp = await _flush(db_session, Employee(fio="employee", company="МГТС"))
    await _flush(db_session, AuthorityRequest(
        employee_id=emp.id, authority_id=auth.id, status=RequestStatus.pending))
    # заявка другого сотрудника — не должна попасть
    other = await _flush(db_session, Employee(fio="Иванов", company="МГТС"))
    await _flush(db_session, AuthorityRequest(
        employee_id=other.id, authority_id=auth.id, status=RequestStatus.approved))

    r = await client.get(f"{BASE}/my/requests")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["authority_code"] == "POA-MY"
    assert data[0]["authority_name"] == "Моё полномочие"
    assert data[0]["status"] == "pending"


async def test_my_requires_auth(client):
    # без сессии — 401
    assert (await client.get(f"{BASE}/my/certificates")).status_code == 401
