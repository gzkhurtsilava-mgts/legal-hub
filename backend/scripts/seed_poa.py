"""Сид тестовых данных модуля «Доверенности».

Источник формулировок: рабочие документы «Полномочия СЕО-1» и
«Полномочия СЕО-2 (Коммерческий блок)». Повторяющиеся в блоках формулировки
(представительство в госорганах, NDA, заверение копий и т.д.) дедуплицированы
в универсальные полномочия либо в одно полномочие с грантами на несколько узлов.
Оргструктура — только подразделения, названные в документах дословно; разделы,
озаглавленные должностью (директор по стратегии/комплаенс/цифровизации, СЕО-2
директорские), узлами НЕ создаются — их полномочия добавятся после получения
реальных названий подразделений.
ФИО сотрудников, номера и даты доверенностей — вымышленные.

Запуск: docker exec legal-hub-backend python -m scripts.seed_poa
Идемпотентен: записи ищутся по уникальным ключам (code / number / fio / name).
"""
import asyncio
from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.poa import (
    Authority,
    AuthorityCategory,
    AuthorityGrant,
    AuthorityKind,
    AuthorityRequest,
    AuthorityStatus,
    CertificateStatus,
    CertificateType,
    DealDirection,
    Employee,
    GrantDerivation,
    IssueMethod,
    LevelSource,
    LimitRule,
    OrgLevel,
    OrgScope,
    OrgSource,
    PoaCertificate,
    PoaOriginalIssue,
    RequestStatus,
    ScopeType,
)
from app.services.poa.resolver import regenerate_resolved_grants

K = AuthorityKind
D = DealDirection

# ─── Уровни и лимиты ──────────────────────────────────────────────────────────

ORG_LEVELS = [("CEO-1", 1), ("CEO-2-", 2)]

# Фаза 1: один потолок на уровень. Реальные суммы из документов (150/100/50/30 млн
# по блокам) зашиты в формулировки text_full; здесь — типовые максимумы.
LIMIT_RULES = {"CEO-1": Decimal("150000000"), "CEO-2-": Decimal("50000000")}

# ─── Оргструктура (компания МГТС, ручной ввод) ────────────────────────────────
# key: (parent_key, scope_type, name)

SCOPES = {
    "mgts": (None, ScopeType.metablock, "ПАО МГТС"),
    "comm": ("mgts", ScopeType.block, "Коммерческий блок"),
    "tech": ("mgts", ScopeType.block, "Технический блок"),
    "sec": ("mgts", ScopeType.block, "Блок безопасности и режима секретности"),
    "fin": ("mgts", ScopeType.block, "Финансовый блок"),
    "hr": ("mgts", ScopeType.block, "Блок по управлению персоналом"),
    "legal": ("mgts", ScopeType.block, "Блок правового обеспечения"),
    "admin": ("mgts", ScopeType.block, "Административный блок"),
    "it": ("mgts", ScopeType.block, "Блок информационных технологий"),
    # CEO-2: подразделения Коммерческого блока (названия дословно из документа)
    "dep-dkri": (
        "comm", ScopeType.department, "Департамент коммерческого развития инфраструктуры"
    ),
    "dep-compens": (
        "comm", ScopeType.department,
        "Департамент сопровождения проектов по компенсации потерь",
    ),
    "dep-gov": (
        "comm", ScopeType.department,
        "Департамент взаимодействия с государственными заказчиками",
    ),
    "center-sales": (
        "comm", ScopeType.unit, "Центр продаж и реализации новых услуг и сервисов"
    ),
    "center-tech": (
        "comm", ScopeType.unit, "Центр технического развития новых услуг и сервисов"
    ),
}

# ─── Категории полномочий (H1 → H2) ───────────────────────────────────────────
# (slug, parent_slug | None, name)

CATEGORIES = [
    ("deals", None, "Сделки"),
    ("deal-sales", "deals", "Сбытовые (доходные) договоры"),
    ("deal-procure", "deals", "Закупочные и закупочно-сбытовые договоры"),
    ("deal-infra", "deals", "Инфраструктура и эксплуатация"),
    ("deal-it", "deals", "ИТ и программное обеспечение"),
    ("deal-hr", "deals", "Кадровые и социальные договоры"),
    ("deal-fin", "deals", "Финансовые сделки"),
    ("deal-agree", "deals", "Соглашения без финансовых обязательств"),
    ("signing", None, "Подписание документов"),
    ("sign-primary", "signing", "Первичные учётные документы"),
    ("sign-procure", "signing", "Закупочная документация"),
    ("sign-corp", "signing", "Корпоративные и эмитентские документы"),
    ("sign-gov", "signing", "Отчётность и документы для госорганов"),
    ("sign-hr", "signing", "Кадровые документы"),
    ("sign-letters", "signing", "Письма, справки и коммерческие предложения"),
    ("sign-tmc", "signing", "Доверенности на ТМЦ"),
    ("rep", None, "Представительство"),
    ("rep-gov", "rep", "Госорганы, суды и прокуратура"),
    ("rep-corp", "rep", "Корпоративное представительство"),
    ("rep-tender", "rep", "Закупки и торги"),
    ("rep-third", "rep", "От имени третьих лиц"),
    ("actions", None, "Универсальные действия"),
    ("act-tech", "actions", "Технические условия и разрешения"),
    ("act-certify", "actions", "Заверение копий"),
    ("act-secrecy", "actions", "Режим секретности и тайна"),
    ("act-ops", "actions", "Операционные действия"),
]

# ─── Каталог полномочий ───────────────────────────────────────────────────────
# Метаданные и гранты — в poa_catalog.py; дословные тексты — в poa_texts.py.
from scripts.poa_catalog import catalog as _build_catalog  # noqa: E402
from scripts.poa_texts import load_texts as _load_texts  # noqa: E402

AUTHORITIES = _build_catalog(_load_texts())

# ─── Сотрудники (ФИО вымышленные) ────────────────────────────────────────────
# (fio, position, scope_key, level_code, tab_number)

EMPLOYEES = [
    ("Соколов Андрей Викторович", "Вице-президент по коммерции", "comm", "CEO-1", "100501"),
    ("Морозов Дмитрий Александрович", "Вице-президент по технике", "tech", "CEO-1", "100502"),
    ("Волков Сергей Николаевич", "Вице-президент по безопасности", "sec", "CEO-1", "100503"),
    ("Кузнецова Елена Владимировна", "Вице-президент по финансам", "fin", "CEO-1", "100504"),
    ("Романова Ольга Игоревна", "Вице-президент по управлению персоналом", "hr", "CEO-1",
     "100505"),
    ("Белов Максим Андреевич", "Вице-президент по правовым вопросам", "legal", "CEO-1",
     "100506"),
    ("Никитин Павел Сергеевич", "Вице-президент по административным вопросам", "admin",
     "CEO-1", "100507"),
    ("Орлова Анна Михайловна", "Вице-президент по информационным технологиям", "it",
     "CEO-1", "100508"),
    ("Григорьев Алексей Владимирович",
     "Директор департамента коммерческого развития инфраструктуры", "dep-dkri", "CEO-2-",
     "100604"),
    ("Степанова Ирина Николаевна",
     "Руководитель департамента сопровождения проектов по компенсации потерь",
     "dep-compens", "CEO-2-", "100605"),
    ("Лебедева Татьяна Сергеевна",
     "Руководитель департамента взаимодействия с государственными заказчиками", "dep-gov",
     "CEO-2-", "100607"),
    ("Ефимов Денис Валерьевич",
     "Руководитель центра продаж и реализации новых услуг и сервисов", "center-sales",
     "CEO-2-", "100608"),
    ("Смирнов Олег Геннадьевич",
     "Руководитель центра технического развития новых услуг и сервисов", "center-tech",
     "CEO-2-", "100609"),
]

# ─── Заявки на полномочия ─────────────────────────────────────────────────────
# (fio, authority_code | None, proposed_text, justification, status, approver)

REQUESTS = [
    ("Ефимов Денис Валерьевич", "POA-DEAL-190", None,
     "Запуск пилота продаж новых сервисов сверх текущего пула.",
     RequestStatus.pending, None),
    ("Смирнов Олег Геннадьевич", "POA-REP-181", None,
     "Участие в госзакупках по инфраструктурным проектам ДРИП.",
     RequestStatus.approved, "lawyer@test.ru"),
    ("Ефимов Денис Валерьевич", None,
     "Подписывать гарантийные письма, содержащие финансовые обязательства, на сумму до "
     "1 000 000 рублей.",
     "Ускорение согласования коммерческих предложений с заказчиками.",
     RequestStatus.rejected, "lawyer@test.ru"),
    ("Степанова Ирина Николаевна", None,
     "Заверять копии соглашений с заказчиками/инвесторами для представления в "
     "Росреестр.",
     "Регулярные запросы Росреестра при регистрации соглашений о компенсации потерь.",
     RequestStatus.pending, None),
]

# ─── Реестр выданных доверенностей (номера и даты вымышленные) ────────────────

CERTIFICATES = [
    dict(
        number="77/2026-014", fio="Соколов Андрей Викторович",
        cert_type=CertificateType.paper,
        issued=date(2026, 1, 15), valid_to=date(2027, 1, 14),
        status=CertificateStatus.active,
        signer="Генеральный директор ПАО МГТС",
        registration_data="Реестр доверенностей № 77-2026/14",
        limits={"level": "CEO-1", "amount": 150000000, "currency": "RUB"},
        authority_codes=["POA-DEAL-010", "POA-DEAL-011", "POA-DEAL-018", "POA-DEAL-019",
                         "POA-DEAL-001", "POA-SIGN-001", "POA-SIGN-002", "POA-REP-001"],
        issues=[("Соколов Андрей Викторович", date(2026, 1, 16), IssueMethod.in_person,
                 True, "Получено лично в БПО")],
    ),
    dict(
        number="77/2026-102", fio="Морозов Дмитрий Александрович",
        cert_type=CertificateType.mchd,
        issued=date(2026, 3, 1), valid_to=date(2027, 2, 28),
        status=CertificateStatus.active,
        signer="Генеральный директор ПАО МГТС",
        registration_data="МЧД № 77-2026/102, ЕИС Федеральной нотариальной палаты",
        limits={"level": "CEO-1", "amount": 150000000, "currency": "RUB"},
        authority_codes=["POA-DEAL-020", "POA-DEAL-029", "POA-SIGN-020",
                         "POA-ACT-020", "POA-ACT-021", "POA-REP-001"],
        issues=[],
    ),
    dict(
        number="77/2025-231", fio="Кузнецова Елена Владимировна",
        cert_type=CertificateType.notarial,
        issued=date(2025, 12, 1), valid_to=date(2026, 11, 30),
        status=CertificateStatus.active,
        signer="Генеральный директор ПАО МГТС",
        registration_data="Нотариус г. Москвы, реестр № 77/123-н/77-2025-5-1187",
        limits={"level": "CEO-1", "amount": 150000000, "currency": "RUB"},
        authority_codes=["POA-DEAL-050", "POA-SIGN-050", "POA-SIGN-051", "POA-SIGN-101",
                         "POA-REP-050"],
        issues=[("Кузнецова Елена Владимировна", date(2025, 12, 3),
                 IssueMethod.ring_mail, False, None)],
    ),
    dict(
        number="77/2025-118", fio="Григорьев Алексей Владимирович",
        cert_type=CertificateType.paper,
        issued=date(2025, 6, 10), valid_to=date(2026, 6, 9),
        status=CertificateStatus.expired,
        signer="Генеральный директор ПАО МГТС",
        registration_data="Реестр доверенностей № 77-2025/118",
        limits={"level": "CEO-2-", "amount": 50000000, "currency": "RUB"},
        authority_codes=["POA-DEAL-150", "POA-SIGN-150", "POA-DEAL-154", "POA-SIGN-154"],
        issues=[("Григорьев Алексей Владимирович", date(2025, 6, 11), IssueMethod.postal,
                 True, "РПО 10100085123456")],
    ),
    dict(
        number="77/2026-055", fio="Смирнов Олег Геннадьевич",
        cert_type=CertificateType.paper,
        issued=date(2026, 2, 20), valid_to=date(2027, 2, 19),
        status=CertificateStatus.revoked,
        signer="Генеральный директор ПАО МГТС",
        registration_data="Реестр доверенностей № 77-2026/55, отозвана приказом № 214",
        limits={"level": "CEO-2-", "amount": 50000000, "currency": "RUB"},
        authority_codes=["POA-DEAL-200", "POA-DEAL-201", "POA-SIGN-200", "POA-SIGN-203"],
        issues=[("Смирнов Олег Геннадьевич", date(2026, 2, 21), IssueMethod.in_person,
                 True, None)],
    ),
]


# ─── Сидеры ───────────────────────────────────────────────────────────────────

async def seed_levels(db) -> dict[str, OrgLevel]:
    levels: dict[str, OrgLevel] = {}
    for code, rank in ORG_LEVELS:
        obj = (
            await db.execute(select(OrgLevel).where(OrgLevel.code == code))
        ).scalar_one_or_none()
        if obj is None:
            obj = OrgLevel(code=code, rank=rank)
            db.add(obj)
            print(f"[seed] Уровень: {code}")
        levels[code] = obj
    await db.flush()
    return levels


async def seed_limit_rules(db, levels: dict[str, OrgLevel]) -> None:
    for code, amount in LIMIT_RULES.items():
        level = levels[code]
        obj = (
            await db.execute(select(LimitRule).where(LimitRule.org_level_id == level.id))
        ).scalar_one_or_none()
        if obj is None:
            db.add(LimitRule(org_level_id=level.id, amount=amount, currency="RUB"))
            print(f"[seed] Лимит {code}: {amount} RUB")
    await db.flush()


async def seed_scopes(db) -> dict[str, OrgScope]:
    scopes: dict[str, OrgScope] = {}
    for key, (parent_key, scope_type, name) in SCOPES.items():
        obj = (
            await db.execute(select(OrgScope).where(OrgScope.name == name))
        ).scalar_one_or_none()
        if obj is None:
            obj = OrgScope(
                parent_id=scopes[parent_key].id if parent_key else None,
                scope_type=scope_type, name=name, company="МГТС",
                source=OrgSource.manual,
            )
            db.add(obj)
            await db.flush()
            print(f"[seed] Оргузел: {name}")
        scopes[key] = obj
    return scopes


async def seed_categories(db) -> dict[str, AuthorityCategory]:
    cats: dict[str, AuthorityCategory] = {}
    for sort, (slug, parent_slug, name) in enumerate(CATEGORIES):
        level = 1 if parent_slug is None else 2
        obj = (
            await db.execute(
                select(AuthorityCategory).where(
                    AuthorityCategory.name == name, AuthorityCategory.level == level
                )
            )
        ).scalar_one_or_none()
        if obj is None:
            obj = AuthorityCategory(
                parent_id=cats[parent_slug].id if parent_slug else None,
                level=level, name=name, sort_order=sort,
            )
            db.add(obj)
            await db.flush()
            print(f"[seed] Категория: {name}")
        cats[slug] = obj
    return cats


async def seed_authorities(
    db, cats: dict[str, AuthorityCategory], scopes: dict[str, OrgScope]
) -> dict[str, Authority]:
    authorities: dict[str, Authority] = {}
    for data in AUTHORITIES:
        obj = (
            await db.execute(select(Authority).where(Authority.code == data["code"]))
        ).scalar_one_or_none()
        if obj is None:
            obj = Authority(
                code=data["code"],
                category_id=cats[data["cat"]].id,
                name_short=data["short"],
                text_full=data["full"],
                authority_kind=data["kind"],
                deal_direction=data["direction"],
                is_universal=False,
                limit_applies=data["limit"],
                is_no_limit=data["no_limit"],
                status=AuthorityStatus.active,
                version=1,
                valid_from=date(2025, 1, 1),
                updated_by="seed",
            )
            db.add(obj)
            await db.flush()
            print(f"[seed] Полномочие: {data['code']} {data['short'][:50]}")
        else:
            # Обновляем поля из каталога (дословный текст, категория, флаги).
            obj.category_id = cats[data["cat"]].id
            obj.name_short = data["short"]
            obj.text_full = data["full"]
            obj.authority_kind = data["kind"]
            obj.deal_direction = data["direction"]
            obj.is_universal = False
            obj.limit_applies = data["limit"]
            obj.is_no_limit = data["no_limit"]
            obj.updated_by = "seed"
        authorities[data["code"]] = obj
        # Гранты: полномочие × узел оргструктуры.
        for scope_key in data["scopes"]:
            scope = scopes[scope_key]
            exists = (
                await db.execute(
                    select(AuthorityGrant).where(
                        AuthorityGrant.authority_id == obj.id,
                        AuthorityGrant.org_scope_id == scope.id,
                    )
                )
            ).scalar_one_or_none()
            if exists is None:
                db.add(AuthorityGrant(
                    authority_id=obj.id, org_scope_id=scope.id,
                    granted=True, derivation=GrantDerivation.base_rule,
                ))
    await db.flush()
    return authorities


async def seed_employees(
    db, scopes: dict[str, OrgScope], levels: dict[str, OrgLevel]
) -> dict[str, Employee]:
    employees: dict[str, Employee] = {}
    for fio, position, scope_key, level_code, tab in EMPLOYEES:
        obj = (
            await db.execute(select(Employee).where(Employee.fio == fio))
        ).scalar_one_or_none()
        if obj is None:
            obj = Employee(
                fio=fio, position=position, company="МГТС",
                org_scope_id=scopes[scope_key].id,
                org_level_id=levels[level_code].id,
                level_source=LevelSource.manual, tab_number=tab,
            )
            db.add(obj)
            print(f"[seed] Сотрудник: {fio}")
        employees[fio] = obj
    await db.flush()
    return employees


async def seed_requests(
    db, employees: dict[str, Employee], authorities: dict[str, Authority]
) -> None:
    for fio, code, proposed, justification, status, approver in REQUESTS:
        emp = employees[fio]
        stmt = select(AuthorityRequest).where(AuthorityRequest.employee_id == emp.id)
        if code is not None:
            stmt = stmt.where(AuthorityRequest.authority_id == authorities[code].id)
        else:
            stmt = stmt.where(AuthorityRequest.proposed_text == proposed)
        if (await db.execute(stmt)).scalars().first() is not None:
            continue
        db.add(AuthorityRequest(
            employee_id=emp.id,
            authority_id=authorities[code].id if code else None,
            proposed_text=proposed, justification=justification,
            status=status, approver=approver,
        ))
        print(f"[seed] Заявка: {fio} — {code or proposed[:40]} ({status.value})")
    await db.flush()


async def seed_certificates(
    db, employees: dict[str, Employee], authorities: dict[str, Authority]
) -> None:
    for data in CERTIFICATES:
        exists = (
            await db.execute(
                select(PoaCertificate).where(PoaCertificate.number == data["number"])
            )
        ).scalar_one_or_none()
        if exists is not None:
            continue
        emp = employees[data["fio"]]
        cert = PoaCertificate(
            number=data["number"], grantor_company="ПАО МГТС",
            grantee_employee_id=emp.id, grantee_fio=emp.fio,
            grantee_position=emp.position, grantee_tab_number=emp.tab_number,
            cert_type=data["cert_type"], issued_date=data["issued"],
            valid_to=data["valid_to"], limits=data["limits"],
            signer=data["signer"], registration_data=data["registration_data"],
            status=data["status"],
        )
        cert.authorities = [authorities[c] for c in data["authority_codes"]]
        db.add(cert)
        await db.flush()
        for recipient, issued, method, confirmed, note in data["issues"]:
            db.add(PoaOriginalIssue(
                certificate_id=cert.id, recipient_fio=recipient, issued_date=issued,
                method=method, confirmed=confirmed, confirmation_note=note,
            ))
        print(f"[seed] Доверенность: № {data['number']} — {emp.fio} "
              f"({data['status'].value})")
    await db.flush()


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        levels = await seed_levels(db)
        await seed_limit_rules(db, levels)
        scopes = await seed_scopes(db)
        cats = await seed_categories(db)
        authorities = await seed_authorities(db, cats, scopes)
        employees = await seed_employees(db, scopes, levels)
        await seed_requests(db, employees, authorities)
        await seed_certificates(db, employees, authorities)
        count = await regenerate_resolved_grants(db)
        await db.commit()
    print(f"\n[seed] Готово. Полномочий: {len(AUTHORITIES)}, "
          f"resolved-строк: {count}")


if __name__ == "__main__":
    asyncio.run(seed())
