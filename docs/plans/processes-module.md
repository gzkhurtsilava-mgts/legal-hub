# Processes Module — Plan

## Context

Модуль "Карта процессов" — пятиуровневая иерархия описания работы БПО.
Два режима над одной БД и одним API:
- **Edit mode** — формы ввода и редактирования L1–L5
- **View mode** — read-only методологически оформленное представление

## Agreed decisions

- L2 (домены) упрощены до `id, name, mission` — поля из промпта (category, scope_in/out, cloc_maturity и т.д.) удалены намеренно, не восстанавливать
- L1 view — плоский список доменов с поиском, без группировки по категориям (категории удалены)
- BPMN-диаграмма — поле `bpmn_diagram` зарезервировано в схеме, UI НЕ строить
- Architecture-страница из демо — не реализовывать
- Аутентификация — только существующая JWT (без ролевой модели внутри модуля)
- Двухтрековая модель (workflow/service) — определяет какие секции отображать на L3 и L4 в обоих режимах
- Lifecycle (as-is/to-be) — отдельные связанные записи через `lifecycle_ref_id`, не статусное поле
- ID-конвенция: `LEG.{DOMAIN}.W.{NNN}` / `LEG.{DOMAIN}.S.{NNN}` для L3; генерация через `/api/processes/next-id`

## Current state after M0

✅ Реализовано:
- БД-схема: все таблицы L2–L5 + junction tables + справочники
- L2 (pm_domains): полный CRUD — backend + frontend
- 7 справочников: полный CRUD — backend + frontend
- Утилиты: `/api/processes/landscape`, `/api/processes/next-id`, `/api/processes/next-activity-id`
- Frontend: `/processes` (L1 карта), `/processes/domains/[id]` (L2 просмотр-заглушка), `/processes/edit/*` (L2 + справочники)

❌ Не реализовано: L3, L4, L5 (всё)

---

## M1 — L3 Process CRUD (Edit mode) (~2 недели)

Цель: можно создавать, редактировать, удалять процессы (workflow и service).

### Backend

1. `backend/app/api/processes/processes.py` — новый router
   - `GET /api/processes/` — список с фильтрами: `domain_id`, `type`, `status`, `bu_id`, поиск по `q`
   - `POST /api/processes/` — создание
   - `GET /api/processes/{process_id}` — детальная карточка со всеми связями
   - `PUT /api/processes/{process_id}` — обновление (любые поля, partial)
   - `DELETE /api/processes/{process_id}` — удаление (защита: нельзя если есть L4)

2. Junction endpoints (вложенные или отдельные):
   - `PUT /api/processes/{id}/business-units` — замена списка БЮ
   - `PUT /api/processes/{id}/systems` — замена списка систем
   - `PUT /api/processes/{id}/regulations` — замена списка нормативки
   - `PUT /api/processes/{id}/risks` — замена списка рисков
   - `PUT /api/processes/{id}/raci` — замена RACI-матрицы
   - `PUT /api/processes/{id}/metrics` — замена метрик
   - `PUT /api/processes/{id}/automation-candidates` — замена кандидатов на автоматизацию (workflow)
   - `PUT /api/processes/{id}/improvement-candidates` — замена (service)

3. Lifecycle:
   - `POST /api/processes/{id}/create-to-be` — копирует запись с суффиксом `.TB1` и устанавливает `lifecycle_ref_id`

4. Новые Pydantic-схемы в `schemas/processes.py`:
   - `PmProcessCreate`, `PmProcessUpdate`, `PmProcessResponse` (с вложенными связями)
   - `PmProcessListItem` (облегчённый, без junction-таблиц — для списков)

### Frontend

1. `lib/api/processes.ts` — хуки для L3:
   - `useProcesses(filters)`, `useProcess(id)`, `useCreateProcess()`, `useUpdateProcess(id)`, `useDeleteProcess(id)`
   - Хуки для junction endpoints

2. `/processes/edit/domains/[id]` — обновить: добавить список процессов домена с кнопкой "Добавить процесс"

3. `/processes/edit/processes/new?domain_id=XXX` — форма создания:
   - Шаг 1: тип (workflow / service) — выбор определяет какие секции показывать
   - ID-помощник (предлагает следующий номер, редактируется)
   - Общие поля: name, domain, owner_role, status, version, last_updated, next_review

4. `/processes/edit/processes/[id]` — форма редактирования, секции:
   - **Общее** — общие поля + lifecycle
   - **SIRPORC** — таблица 7 колонок, каждая ячейка — редактируемый список строк (add/remove)
   - **Бизнес-юниты** — 3 режима: все / все с исключениями / конкретный список
   - **Системы** — multiselect из справочника + inline-создание
   - **Нормативка** — multiselect + articles + relevance_note
   - **Риски** — multiselect + impact/probability/control
   - _(workflow only)_ **RACI** — таблица role × activity, чекбоксы R/A/C/I
   - _(workflow only)_ **Метрики** — список name/value/unit/status
   - _(workflow only)_ **SLA** — одно поле sla_days
   - _(workflow only)_ **Pain points** — список строк
   - _(workflow only)_ **Кандидаты на автоматизацию** — список idea/impact/effort/score
   - _(service only)_ **Компетенции** — список строк
   - _(service only)_ **Оценка трудозатрат** — simple/medium/complex + factors
   - _(service only)_ **Decision points** — список decision/factors
   - _(service only)_ **Case library** — список прецедентов
   - _(service only)_ **Кандидаты на улучшение** — список idea/type/impact/effort/score
   - **Связи с процессами** — список connections (up/down/related + target + note)
   - **Changelog** — лог изменений + кнопка "Добавить запись"
   - **JSON** — raw просмотр для отладки

5. `/processes/edit/processes` — список всех процессов с фильтрами (домен, тип, статус, БЮ)

### Verification M1
- Создать workflow-процесс в домене, сохранить SIRPORC, добавить риск из справочника
- Создать service-процесс, убедиться что workflow-секции не показываются
- Создать to-be версию процесса
- Список процессов фильтруется по домену и типу

---

## M2 — L4 Activity + L5 SOP (Edit mode) (~1.5 недели)

Цель: можно декомпозировать процесс на активности и добавлять СОП к активностям.

### Backend

1. `backend/app/api/processes/activities.py`:
   - `GET /api/processes/{process_id}/activities/` — список в порядке order_index
   - `POST /api/processes/{process_id}/activities/` — создание
   - `GET /api/processes/{process_id}/activities/{activity_id}` — детально
   - `PUT /api/processes/{process_id}/activities/{activity_id}` — обновление
   - `DELETE /api/processes/{process_id}/activities/{activity_id}` — удаление
   - `PUT /api/processes/{process_id}/activities/reorder` — массовое обновление order_index

2. `backend/app/api/processes/sops.py`:
   - CRUD аналогично, привязано к activity_id

3. `/api/processes/next-activity-id` уже есть — проверить и доработать если нужно

### Frontend

1. L4 — инлайн в странице редактирования L3 (`/processes/edit/processes/[id]`):
   - Секция "Активности" внизу формы L3
   - Список существующих активностей с drag-and-drop переупорядочиванием (или кнопки ↑↓)
   - Кнопка "Добавить активность" → раскрывает inline-форму или открывает `/processes/edit/processes/[id]/activities/new`
   - Клик на активность → `/processes/edit/processes/[id]/activities/[activity_id]`

2. `/processes/edit/processes/[id]/activities/[activity_id]` — форма активности:
   - Общие: id, name, description
   - _(workflow only)_ type (manual/system/decision), raci_role, duration, automation_potential, data_operations, decision_logic
   - _(service only)_ phase_number, quality_criteria
   - Внизу: список СОП этой активности

3. L5 — инлайн в странице L4 или отдельная страница:
   - `/processes/edit/processes/[id]/activities/[activity_id]/sops/[sop_id]`
   - Поля: title (главное), audience_role, preconditions, steps (иерархия title/substeps/tips/warnings), checklist, faq, related_docs, changelog

### Verification M2
- Добавить 3 активности к workflow-процессу, переупорядочить
- Добавить СОП к активности с шагами и чек-листом
- Убедиться что для service-активности нет workflow-полей

---

## M3 — View mode (все уровни) (~1.5 недели)

Цель: read-only представление данных, методологически оформленное. Навигация по уровням через breadcrumbs.

### L1 — `/processes` (обновить существующую страницу)
- Уже есть плоский список доменов с поиском — достаточно, не переделывать в плитки (категорий нет)
- Добавить: счётчики процессов, заглушка для пустых доменов (текст "запланировано")

### L2 — `/processes/domains/[id]` (обновить существующую страглушку)
- Domain card: миссия, кол-во процессов
- Каталог L3: две колонки (Процедуры / Услуги) — карточки с именем, статусом, owner
- Клик на процесс → L3 view

### L3 — `/processes/[process_id]`

Workflow:
- Header: название, статус (as-is/to-be badge), owner, SLA, next_review
- Sticky ToC (левая колонка)
- SIRPORC-таблица 7 колонок, R-колонки визуально выделены
- Список L4-активностей (упорядоченный, клик → L4 view)
- RACI-матрица (роли × активности)
- Метрики / SLA
- Риски (таблица)
- Нормативка (список)
- Связи с процессами
- Pain points
- Кандидаты на автоматизацию
- Список СОП

Service:
- Header аналогично
- SIRPORC-таблица
- Обязательные и опциональные активности (без строгого порядка)
- Компетенции
- Оценка трудозатрат
- Decision points
- Case library
- Кандидаты на улучшение
- Методологические гайды (СОП)

### L4 — `/processes/[process_id]/activities/[activity_id]`

Workflow:
- Header, описание, тип (manual/system/decision)
- RACI, duration, automation_potential
- Таблица операций с данными
- Decision logic (если type=decision)
- Список СОП

Service:
- Header, описание, phase_number
- Quality criteria

### L5 — `/processes/[process_id]/activities/[activity_id]/sops/[sop_id]`
- Заголовок, аудитория, прекондишены
- Пошаговые инструкции с подшагами, tips, warnings
- Чек-лист
- FAQ (раскрывающиеся пункты)
- Связанные документы
- Changelog

### Verification M3
- Пройти полный маршрут: L1 → L2 → L3 → L4 → L5 через клики
- Breadcrumbs работают на каждом уровне
- SIRPORC-таблица корректно отображается, R-колонки выделены
- Workflow и service показывают разные секции

---

## Out of scope (этот этап)

- BPMN-диаграмма для workflow
- Architecture-страница из демо
- Ролевая модель доступа (пока одна роль)
- Интеграции с другими модулями (process_references)
- BPM-движок / исполнение процессов
- Поля домена L2 из промпта (category, scope, cloc) — намеренно упрощены
- L1 группировка по категориям — намеренно упрощена
