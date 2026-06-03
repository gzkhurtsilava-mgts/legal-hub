# План: модуль `knowledge` (база знаний)

## Context

Юридическому отделу (БПО МГТС, 22-27 юристов) нужна база знаний, которой пользуются они сами + до 2000 сотрудников других подразделений. Юристы самостоятельно наполняют и администрируют контент: информационные статьи, документы с версионированием (аналог редакций в Консультант+), внешние ссылки и FAQ. Главный сценарий — большая поисковая строка на главной с морфологией и нечётким поиском по всей базе. Сейчас в `legal-hub` готов скелет (auth + дизайн-система + дев-окружение), модулей контента ещё нет — нужно построить с нуля, следуя существующим паттернам (`app/api/`, `app/models/`, `app/schemas/`, `app/services/`).

Модуль большой (~8 недель), поэтому разбит на milestones. M0-M1 расписаны детально, остальные — обзорно, уточняем перед стартом каждого.

---

## Согласованные решения

| Вопрос | Решение |
|---|---|
| Типы сущностей | Article, Document, Link, FAQ |
| Уровни доступа | 2: `public` (все авторизованные) и `bpo_only` (только admin+lawyer) |
| Workflow | `draft` → `published` → `archived` (без review-стадии) |
| Иерархия разделов | Самореферентная (`parent_id`), в UI показываем 2-3 уровня |
| Права редактирования | admin: всё; lawyer: только разделы, где он назначен owner |
| Поиск | PostgreSQL FTS (`russian`) + `pg_trgm` + конвертер EN↔RU раскладки |
| **Preview документов** | **Серверная конвертация через JodConverter** (`harbor.mgts.ru/dockerhub/eugenmayer/jodconverter`). Все форматы → PDF. Просмотр в браузере через native `<iframe>` (без npm-пакетов) |
| Recent / счётчики / комментарии / уведомления | Не в MVP |
| Избранное | В MVP |

---

## Архитектура

### Данные — таблицы (новые)

Все новые модели — в `backend/app/models/knowledge.py`, схемы — в `backend/app/schemas/knowledge.py`, эндпоинты — в `backend/app/api/knowledge.py`, бизнес-логика — в `backend/app/services/knowledge/`.

**`sections`** — иерархия разделов
```
id PK, parent_id FK→sections(NULL), name, slug, description, icon, order_index,
visibility ENUM('public','bpo_only'), created_at, updated_at
```
UNIQUE (parent_id, slug). Слаг — для URL.

**`section_lawyers`** — m2m: какие юристы owner какого раздела
```
section_id FK, user_id FK, PK(section_id, user_id)
```

**`knowledge_items`** — единая базовая таблица для всех типов
```
id PK, section_id FK, item_type ENUM('article','document','link','faq'),
title VARCHAR(500), summary TEXT,
visibility ENUM('public','bpo_only'), status ENUM('draft','published','archived'),
author_id FK→users, published_at TIMESTAMP NULL,
created_at, updated_at,
content_text TEXT  (plain-text для FTS, заполняется сервисом),
search_vector TSVECTOR  (GENERATED ALWAYS AS STORED)
```

**Type-specific таблицы (joined inheritance):**

**`articles`** (1:1)
```
item_id FK PK, content JSONB (TipTap JSON), attachments JSONB, toc_enabled BOOLEAN
```

**`documents`** (1:1)
```
item_id FK PK, current_version_id FK→document_versions NULL
```

**`document_versions`**
```
id PK, document_id FK, version_label VARCHAR(100), effective_date DATE,
original_filename, original_file_path, original_mime_type, file_size INT,
preview_pdf_path NULL, conversion_status ENUM('pending','processing','ready','failed'),
extracted_text TEXT, notes TEXT,
uploaded_by FK→users, uploaded_at TIMESTAMP
```
INDEX (document_id, effective_date DESC).

**`links`** (1:1) — `item_id FK PK, url VARCHAR(2048)`

**`faqs`** (1:1) — `item_id FK PK, answer TEXT` (вопрос = knowledge_items.title)

**`tags`** — `id PK, name UNIQUE, slug UNIQUE, color NULL`

**`knowledge_item_tags`** m2m — `item_id FK, tag_id FK`

**`user_favorites`** — `user_id FK, item_id FK, created_at`

### Postgres extensions (в первой миграции)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### FTS-инфраструктура

`search_vector` — GENERATED STORED:
```sql
setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
setweight(to_tsvector('russian', coalesce(summary, '')), 'B') ||
setweight(to_tsvector('russian', coalesce(content_text, '')), 'C')
```
Индексы: `GIN(search_vector)`, `GIN(title gin_trgm_ops)`.

`content_text` обновляется сервисом при сохранении:
- Article → рекурсивный обход TipTap JSON
- Document → `extracted_text` из свежей версии
- Link → `title + url`
- FAQ → `title + answer`

### EN↔RU конвертер раскладки

`app/services/knowledge/search_query.py`:
- `translate_layout(q)` — QWERTY↔ЙЦУКЕН маппинг
- Итоговый SQL: `WHERE ... OR ...` по обеим вариациям запроса

### File storage

Docker volume `media_storage`, смонтирован в `/media` у backend + worker:
```
/media/documents/{document_id}/{version_id}/original/<filename>
/media/documents/{document_id}/{version_id}/preview/<filename>.pdf
/media/attachments/{item_id}/<uuid>-<filename>
/media/inline/{yyyy}/{mm}/<uuid>-<filename>
```

Эндпоинт `GET /api/files/{path:path}` — проверяет auth + visibility родительского item, отдаёт через `StreamingResponse`.

### Background jobs (arq)

Новый сервис `worker` в docker-compose. Точка входа — `backend/app/worker.py`.

Задачи в M4:
- `convert_to_pdf(version_id)` — HTTP POST к JodConverter REST API, сохраняет PDF в `/media/…/preview/`
- `extract_text(version_id)` — `pypdf` / `python-docx` / `openpyxl`, сохраняет в `extracted_text`, копирует в `content_text` родительского item

### Document conversion — JodConverter

Образ: `harbor.mgts.ru/dockerhub/eugenmayer/jodconverter` (подтверждён в Harbor).
Новый сервис в docker-compose: `jodconverter` на порту 8081.
Воркер вызывает его REST API: `POST /lool/convert-to/pdf`.

### RBAC

В `app/core/deps.py` уже есть `require_role`. Добавить:
- `require_section_owner(section_id)` — `(role == admin) OR (user.id IN section_lawyers WHERE section_id)`

---

## API surface

Префикс `/api/knowledge`:

```
# Sections
GET/POST /sections
GET/PUT/DELETE /sections/{id}

# Items
GET/POST /items                           (фильтры: section_id, item_type, tags, q, favorites_only)
GET/PUT/DELETE /items/{id}
POST /items/{id}/publish
POST /items/{id}/archive

# Document versions
POST/GET /items/{id}/versions
DELETE   /items/{id}/versions/{version_id}

# Favorites
GET  /favorites
POST/DELETE /items/{id}/favorite

# Search
GET /search/typeahead?q=
GET /search?q=&section_id=&item_type=&tags=

# Tags
GET/POST /tags
DELETE   /tags/{id}

# Uploads (inline media + attachments)
POST /uploads/media
POST /uploads/attachment
```

Отдельный роутер: `GET /api/files/{path:path}`

---

## Frontend pages

`frontend/app/(portal)/knowledge/`:
```
page.tsx                        — главная: SearchBig + cards разделов
sections/[slug]/page.tsx        — раздел: items + фильтры
items/[id]/page.tsx             — детальная (диспетчер по item_type)
favorites/page.tsx
admin/page.tsx                  — список (admin+lawyer)
admin/items/new/page.tsx
admin/items/[id]/edit/page.tsx
admin/sections/page.tsx
```

Компоненты в `frontend/components/knowledge/`:
- `SearchBig.tsx`, `SectionCard.tsx`, `ItemCard.tsx`, `FilterPanel.tsx`, `FavoritesToggle.tsx`
- `viewers/ArticleViewer.tsx`, `viewers/DocumentViewer.tsx` (iframe для PDF), `viewers/LinkViewer.tsx`, `viewers/FaqViewer.tsx`
- `editors/ArticleEditor.tsx` (TipTap), `editors/DocumentUpload.tsx`, `editors/VersionUpload.tsx`, `editors/LinkEditor.tsx`, `editors/FaqEditor.tsx`

### Инфраструктурные пробелы — закрыть в M0

1. **React Query** — `QueryClientProvider` в `app/layout.tsx` + `lib/api/client.ts` (fetch с `Authorization` header)
2. **TipTap** — `@tiptap/react`, `@tiptap/starter-kit`, extensions (image, link, toc, youtube, spoiler). Пакеты `@tiptap` есть в `npmjs` Nexus ✅
3. **arq worker** — `backend/app/worker.py` + сервис в docker-compose
4. **media volume** — named volume `media_storage` + маунт в backend + worker
5. **PDF viewer** — browser native `<iframe src="/api/files/...">`, npm-пакеты не нужны

---

## Milestones

| # | Milestone | Срок | Содержимое |
|---|---|---|---|
| **M0** | Инфраструктура | 1 нед | React Query + API client, arq worker, media volume, pg_trgm/unaccent, модели sections/knowledge_items, `/api/files` с ACL |
| **M1** | Sections + Items CRUD | 1 нед | Все эндпоинты, draft/publish/archive, теги, RBAC, seed-данные |
| **M2** | Поиск + публичный UI | 1.5 нед | FTS, layout-конвертер, typeahead, главная `/knowledge`, страница раздела, избранное |
| **M3** | Articles + TipTap editor | 2 нед | Article model+API, TipTap editor + media upload + attachments + ToC, viewer |
| **M4** | Documents + версионирование | 2 нед | Document model+versions, upload, JodConverter service, PDF iframe viewer, FTS extraction |
| **M5** | Links + FAQ | 0.5 нед | Тривиально на готовом фундаменте |
| **M6** | Полировка | 0.5 нед | Edge cases, dark mode, фиксы по обратной связи |

**Итого: ~8.5 недель.**

---

## Критичные файлы

### Backend (новые)
- `backend/app/models/knowledge.py`
- `backend/app/schemas/knowledge.py`
- `backend/app/api/knowledge.py`
- `backend/app/api/files.py`
- `backend/app/services/knowledge/` — `items.py`, `search.py`, `search_query.py`, `storage.py`, `text_extract.py`
- `backend/app/worker.py`
- `backend/alembic/versions/` — новые миграции

### Backend (изменения)
- `backend/app/main.py` — регистрация роутеров
- `backend/app/core/deps.py` — `require_section_owner`
- `backend/app/models/__init__.py` — re-export новых моделей
- `backend/pyproject.toml` — добавить `arq`, `pypdf`, `python-docx`, `openpyxl`

### Frontend (новые)
- `frontend/lib/api/client.ts`
- `frontend/lib/api/knowledge.ts`
- `frontend/app/(portal)/knowledge/**`
- `frontend/components/knowledge/**`

### Frontend (изменения)
- `frontend/app/layout.tsx` — `QueryClientProvider`
- `frontend/components/layout/Header.tsx` — ссылка на /knowledge
- `frontend/package.json` — TipTap packages

### Infra (изменения)
- `docker-compose.yml` — сервисы `worker` + `jodconverter`, volume `media_storage`

### Patterns to reuse
- `app/core/deps.py::get_current_user`, `require_role`
- `app/models/user.py::User`, `UserRole`
- `app/api/auth.py` — паттерн роутера
- `app/scripts/seed.py` — расширить для knowledge seed
- `frontend/components/layout/SearchBar.tsx` — основа для SearchBig
- `frontend/types/next-auth.d.ts::UserRole`

---

## Verification

### Backend smoke tests (pytest + httpx.AsyncClient — поднять в M0)
- CRUD sections/items от admin → 200
- Lawyer создаёт item в чужом разделе → 403
- Employee публикует → 403
- Поиск: морфология, опечатки (pg_trgm), раскладка EN↔RU
- Visibility: employee не видит `bpo_only` в списке/поиске
- Документ: загрузка → версия в списке → PDF доступен → старая версия доступна

### Frontend (вручную)
- Typeahead, переходы по разделам, фильтры, избранное
- TipTap editor: вставка картинок/видео/спойлеров, ToC
- DocumentViewer: PDF открывается через iframe, переключение версий
- Dark mode

### Performance
- ≥500 items: typeahead < 300ms, полный поиск < 800ms

---

## Out of scope (MVP)

- Review-стадия в workflow
- Recent views / счётчик просмотров
- Комментарии
- In-app / email уведомления о новых версиях
- Visual diff статей
- Совместное редактирование
- True-semantic search (эмбеддинги)
- Экспорт в PDF
- MinIO/S3 (добавим когда вырастет объём)
