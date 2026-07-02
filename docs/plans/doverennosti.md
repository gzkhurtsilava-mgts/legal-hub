# Doverennosti (Powers of Attorney) module

> Status: 🟢 **M0–M2 done** (models, catalog CRUD, resolving engine + matrix + audit). M3 next.
> This plan mirrors the format of `knowledge-module.md` / `processes-module.md`.

---

## Context

Модуль **«Доверенности»** внутри портала Legal Hub — одновременно рабочее место юриста
(единый центр управления доверенностями) и самообслуживание для ~2000 сотрудников МГТС и ДЗО.
Не greenfield: строится по конвенциям модулей `knowledge` и `processes`.

Проблема: матрица полномочий, реестр и журнал выданных доверенностей сегодня ведутся
разрозненно (Service Desk + бумажный журнал + Boss Referent); нет единого источника правды,
нет автовыдачи полномочий по уровню, ручная генерация ломает стили.

**Архитектурный принцип:** одна база полномочий (single source of truth) и пять способов её
потребления (навигатор, конструктор, реестр, личный кабинет, workflow оформления). Порядок
ценности: база + реестр → навигатор + конструктор → личный кабинет → полный workflow.

Заглушка уже есть: `frontend/app/(portal)/services/poa/page.tsx` (ComingSoon) + запись в
`frontend/lib/apps.ts` (`id: "poa"`).

---

## Agreed decisions

| # | Вопрос | Решение | Следствие |
|---|--------|---------|-----------|
| 1 | Источник уровня сотрудника | **Гибрид.** HR даёт должность+ФИО, но не вычисляет уровень. Пока интеграции нет — ручной ввод; позже деривация из должности + HR | `employee.org_level_id` nullable + `level_source(manual\|derived\|hr)`; таблица-заготовка `poa_position_level_rules` |
| 2 | Источник правды матрицы | **Нативная админка в PostgreSQL** (не YAML-в-git) | Юрист правит матрицу в вебе; версионирование/аудит — таблицами |
| 3 | Компании (МГТС + ДЗО) | **Компания — атрибут** орг-скоупа/сотрудника | Единый движок резолвинга, без дублирования |
| 4 | Резолвинг | **Материализация с генерацией**: авторские правила → плоские аудируемые строки | Таблица `poa_resolved_grants` поверх `poa_authority_grants`; `derivation` на каждой строке |
| 5 | Дизайн-система | Скилл .claude/skills/mgts-design/ + frontend/components/ui/ и @mts-ds/*. Table/Modal — кастом. | |
| 6 | Движок workflow (Модуль 6) | Отложено; Camunda vs FSM — при планировании фазы 4 | В фазе 1 — только сущность-каркас + точки интеграции |
| 7 | Передоверие | **Не входит в бизнес МГТС — исключено.** | Убраны `sub_delegation_only`, `can_conclude_deals_default`, enum `sub_delegation`, `poa_sub_delegation_coeff` |
| 8 | Модель матрицы (по интервью Масловой) | **Две независимые оси.** ПОДРАЗДЕЛЕНИЕ → какие полномочия доступны (наследование вниз по оргдереву); УРОВЕНЬ → лимит. Полномочие = «доступное меню», юрист/инициатор выбирает подмножество; лимит из матрицы — потолок (можно только меньше) | `authority_grant` = полномочие×скоуп (без уровня); различие судебник/договорник = дробность оргдерева |
| 9 | Уровень | **Два тира: CEO-1 и «CEO-2 и ниже».** Влияет только на лимит, не на список полномочий | `limit_rule` ключ = `org_level_id` (один лимит на уровень) |
| 10 | Регионы / класс лимита | **Исключены — у МГТС нет.** | Убраны `scope_class`, `region_tier`, `is_corporate_center`, `limit_class`/`exception_kind` |
| 11 | Справочник оргструктуры / HRGate | Дерево `org_scopes` до отдела/иной единицы; источник гибридный (вручную/HRGate) — задел | + `scope_type(division\|unit)`, `org_scopes.source`, `external_id` (синк с HRGate — позже) |

---

## Architecture

### Data model — Module 1 (`backend/app/models/poa.py`)

Сущности: `AuthorityCategory` (дерево H1–H5), `Authority` (каталог формулировок),
`OrgScope` (дерево оргструктуры до отдела; `company`, `source`, `external_id`),
`OrgLevel` (два тира: CEO-1 / CEO-2 и ниже), `AuthorityGrant` (доступность =
полномочие×скоуп), `LimitRule` (лимит по уровню), `Employee`, `PositionLevelRule`,
`AuthorityRequest`, `ResolvedGrant` (материализация).

Ключевые свойства модели (решения №8–11):
- `AuthorityGrant` = `authority × org_scope` (уровень на доступность не влияет). Полномочие
  наследуется вниз по оргдереву; `org_scope=null` → во всех скоупах.
- `LimitRule` = один лимит на уровень (`org_level_id` unique). Регионов/классов лимита нет.
- `OrgScope.company` — компания как атрибут; `source/external_id` — задел под HRGate.
- `Employee.org_level_id` nullable + `level_source` (решение №1).
- `poa_resolved_grants` — материализация пула доступного (по `(org_scope_id, org_level_id)`).

### Data model — Module 2 (Registry)

`PoaCertificate` (перечень полномочий — FK на `Authority` через `poa_certificate_authorities`,
**не текст**), `PoaOriginalIssue` (под-запись «выдача оригинала»: получатель/дата/способ/
подтверждение). Статусы `active|revoked|expired` с авто-`expired` по `valid_to`.

### Audit — `PoaAudit`

Отдельная таблица (не JSONB-changelog): `(entity_type, entity_id, action, diff JSONB, user_id, at)`.
Пишется на изменения `authority` / `authority_grant` / `limit_rule` / `authority_request`.

### Resolving engine — `backend/app/services/poa/resolver.py` (M2)

**(A) Генерация `resolved_grant`** (пул доступного) из авторских правил: для каждого узла
оргструктуры собираем ближайшее правило на полномочие (сам узел `base_rule` > предки
`cascade`); `org_scope=null` и универсальные полномочия → доступны везде (`universal`);
явный запрет (`granted=false`) убирает ячейку. Затем для каждого узла × уровень считаем лимит.

**(B) `resolve(employee)`** = строки `resolved_grant` по scope+level сотрудника + одобренные
`authority_request` (manual_exception).

**`compute_limit` precedence:** income/`limit_applies=false` → без лимита (`unlimited`) →
`no_limit` (зелёное) → потолок из `limit_rule` по уровню. Все ветки трассируемы через `derivation`.

### RBAC — `backend/app/core/deps.py`

- **Юрист** = `require_role(UserRole.admin, UserRole.lawyer)`: матрица/каталог/лимиты/аппрув/реестр.
- **Пользователь** = `UserRole.employee`: свой срез (`resolve`), навигатор, заявка, «мои доверенности».

### API surface (`backend/app/api/poa/` — пакет суб-роутеров, как `api/processes/`)

Каталог/деревья (`/poa/authorities`, `/categories`, `/org-scopes`, `/org-levels`); матрица/лимиты
(`/poa/matrix`, `PUT /poa/matrix/cell`, `/limit-rules`, `POST /poa/matrix/regenerate`); резолвинг/
заявки (`GET /poa/resolve/{employee_id}`, `/employees`, `/authority-requests[/{id}/approve|reject]`);
реестр (`/poa/registry`, `/{id}/original-issue`, `/{id}/revoke`, `/registry/search`); аудит/экспорт.

### Frontend (`app/(portal)/services/poa/**`, `components/poa/**`, `lib/api/poa.ts`)

API-слой по образцу `lib/api/knowledge.ts` (`apiFetch` + React Query). Страницы: `registry/`,
`registry/[id]/`, `my/`, `admin/matrix/`, `admin/authorities/`, `admin/limits/`, `admin/requests/`.
Компонент `MatrixGrid` (жёлтое=выдано / зелёное=без лимита / серое=недоступно). Примитивы —
`components/ui/` + `@mts-ds/*`. Формы — react-hook-form + zod. Только токены (`--brand-blue`).

---

## Milestones

### Phase 1 — Foundation (Modules 1 + 2)

| M | Веха | Содержимое | Критерий приёмки |
|---|------|-----------|------------------|
| **M0** ✅ | Тест-инфра + модели | `tests/conftest.py`; `models/poa.py` (14 таблиц); миграция `a7b1c2d3e4f5_poa_m0` | миграция применяется/откатывается; метаданные-тесты зелёные |
| **M1** ✅ | Каталог + деревья + CRUD | `schemas/poa.py`, `api/poa/` CRUD + RBAC | юрист ведёт каталог/категории/скоупы/лимиты; 200 для юриста, 403 для employee |
| **M2** ✅ | Движок + матрица | `services/poa/resolver.py` (генерация + resolve + compute_limit); эндпоинты матрицы/resolve; аудит | резолвинг корректно выдаёт полномочия+лимиты (universal, наследование по оргдереву, income=∞, no_limit, лимит по уровню, запрет); правка ячейки → пересчёт |
| **M3** | Реестр + выдача оригинала | `PoaCertificate` (FK), `PoaOriginalIssue`, авто-`expired`, поиск; фронт реестра | реестр заменяет журнал (вкл. выдачу оригинала); срез «кто имеет X»; авто-инвалидация при revoke |
| **M4** | Админка матрицы (фронт) | `MatrixGrid` с цвет-кодом, редакторы, очередь заявок, аудит-лог | юрист ведёт матрицу визуально; изменения в аудите |

**Критерий приёмки Фазы 1:** юрист ведёт матрицу; резолвинг корректно выдаёт полномочия по
уровню; реестр заменяет бумажный журнал. Автономная ценность достигнута.

### Phase 2 — Self-service (обзор)
Модуль 4 (Навигатор: 3 вопроса → 35 сценариев + 5 ДЗО, правила в общем конфиге для веба и LLM,
выход = преднастроенный вход в workflow) + Модуль 3 (Конструктор: `docxtpl` + LibreOffice/
JodConverter → docx/PDF/МЧД). **M0 фазы 2:** установить docxtpl + Office→PDF конвертер
(`harbor.mgts.ru/dockerhub/eugenmayer/jodconverter`).

### Phase 3 — Мои доверенности (обзор)
Модуль 5: тонкий view поверх реестра + статусов заявок.

### Phase 4 — Сервис оформления (каркас, отдельный план)
Модуль 6: заявка на оформление со статусами; точки входа из навигатора; запись в реестр;
заглушки согласования/подписи. Camunda vs FSM — TBD.

---

## Critical files

**Backend (M0, done):** `app/models/poa.py`, `app/models/__init__.py` (регистрация),
`app/core/config.py`, `alembic/versions/a7b1c2d3e4f5_poa_m0.py`,
`tests/conftest.py`, `tests/poa/test_models.py`.
**Backend (M1+):** `app/schemas/poa.py`, `app/api/poa/{__init__,catalog,matrix,registry,requests,
audit}.py`, `app/services/poa/resolver.py`, `app/main.py` (регистрация роутера), `tests/poa/*`.
**Frontend (M4+):** `lib/api/poa.ts`, `app/(portal)/services/poa/**`, `components/poa/**`.
**Reference:** `app/models/knowledge.py`, `app/api/processes/__init__.py`, `app/core/deps.py`,
`alembic/versions/a2b3c4d5e6f7_processes_m0.py`; `frontend/components/ui/index.tsx`.

---

## Verification

**M0 (done, offline — БД в этой среде нет):**
- Модели импортируются, мапперы конфигурируются (14 poa-таблиц).
- Миграция импортируется; `alembic heads` = единственный head `a7b1c2d3e4f5`.
- Паритет миграция↔модели: все таблицы и колонки совпадают.
- `pytest tests/poa/test_models.py` — 9 passed; `ruff check app/ tests/` — clean.
- **Требует БД (в Docker):** `alembic upgrade head` применяется и `downgrade` откатывается;
  `TEST_DATABASE_URL` для DB-фикстур conftest.

**M1+ (pytest):** CRUD 200/403 по ролям; движок — по тесту на каждое правило PRD 3.2;
регенерация resolved_grant; реестр (FK, revoke-срез, авто-expired); аудит.

**Запуск:** `docker compose up`; `cd backend && pytest`; фронт — вручную.

---

## Out of scope (Phase 1)
- Содержание матрицы (конкретные полномочия/лимиты) — вводят юристы вручную.
- Полный workflow (Модуль 6) — только каркас.
- Деривация CEO-N из должности + HR-интеграция — только схема-заготовка.
- Camunda vs FSM — фаза 4.
