# Legal Hub — Project Rules for Claude Code

## COMMUNICATION
Always communicate with the user in Russian.
Keep all code, comments, variable names, API endpoints, and technical documents in English.
Be direct and professional — no explaining basics, no filler phrases.
For architectural decisions: explain the tradeoff. For operational tasks: just do it.

---

## PROJECT CONTEXT
Corporate portal for the Legal Operations team (БПО) at МГТС.
Single developer: full-stack + product owner + product manager.
Stack is FIXED — do not suggest alternatives without being asked.

**Audience:**
- Internal customers: up to 2000 employees (МГТС staff)
- Legal team (БПО): 22–27 lawyers
- No external users

---

## TECH STACK (fixed, do not change)

### Backend
- Python 3.12.7 / FastAPI 0.115.5 / uvicorn[standard] 0.32.1
- SQLAlchemy 2.0 (asyncio) / asyncpg 0.30.0 / Alembic 1.14.0
- Pydantic v2 2.10.3 / pydantic-settings 2.6.1
- Redis 5.2.1 / arq 0.26.1 (NOT Celery)
- python-jose[cryptography] 3.3.0 / passlib[bcrypt] 1.7.4
- httpx 0.28.1 / ruff 0.8.4
- Package manager: uv (NOT pip/poetry)

### Frontend
- Next.js 14.2.18 (App Router) / React 19.2.1 / TypeScript 5.7.2
- Tailwind CSS 3.4.17
- @mts-ds/granat2-react 1.0.3 + @mts-ds/base 3.3.0 (MTS Granat design system)
- @tanstack/react-query 5.59.0 / react-hook-form 7.54.2 / zod 3.24.1
- zustand 5.0.1 / lucide-react 1.0.1 / clsx 2.1.1
- Package manager: pnpm (NOT npm/yarn)

### Infrastructure
- PostgreSQL 16.4 / Redis 7.4-alpine
- Docker + Docker Compose (all code runs INSIDE containers)
- GitLab CI (corp instance) / Nginx (prod reverse proxy)

---

## CORPORATE INFRASTRUCTURE (critical)

### npm Registry — CRITICAL
All npm installs go through corporate Nexus, NOT public npmjs.
`.npmrc` is already set: `registry=https://nexus.mgts.ru/repository/npm-all/`
Never suggest `npm install` without this registry. Always use pnpm.

### Docker Images
- Local dev: public Docker Hub images are OK
- Corp deployment: use `harbor.mgts.ru/dockerhub/` prefix
  - Example: `FROM harbor.mgts.ru/dockerhub/node:20.18.0-alpine`
- Never use `latest` tags — always pin exact versions

### Corporate Proxy
```
http://proxywg.mgts.corp.net:3128
```
Docker Desktop is configured for this proxy.
Git uses `http.sslVerify false` (corp MITM inspection).

### Alpine Repos in Docker (corp proxy)
```
https://nexus.mgts.ru/repository/alpine-proxy/v3.20/main
https://nexus.mgts.ru/repository/alpine-proxy/v3.20/community
```

### Corp Certs (prod Dockerfile only)
Three CA certs passed as build-args: MGTS_ROOT_CA, MGTS_INT_SUB_CA, MGTS_EXT_SUB_CA.
Local dev does NOT need this.

### GitLab CI
- Corp instance, runner tag: `[prod]`
- Deploy triggered by tag: `release-X.X.X` (pattern: `^release-\d+\.\d+\.\d+$`)

---

## ARCHITECTURE PRINCIPLES

### Modular Monolith (not microservices)
One repo, two apps (backend + frontend), clear module boundaries.
Each module = one Django-style structure:
- Backend: `app/api/{module}.py` + `app/models/{module}.py` + `app/schemas/{module}.py` + `app/services/{module}.py`
- Frontend: `app/{module}/page.tsx` + `components/{module}/{Component}.tsx`

### API-First Backend
All data served through REST endpoints from day one, even if frontend doesn't use them yet.
Required for future integrations: Bitrix24, corp bot, SSO.

### Maintainability Over Everything
Primary criterion: maintainable by ONE person.
Scalability to 2000 users is secondary (max 20–50 concurrent users).

### Process Hub (data model only, no UI yet)
- Table `processes` — master entity for every БПО process
- Polymorphic `process_references` — any entity in the system can link to a process
- Log every process access via any service
- Analytics: "NDA approval process mentioned in 14 places, 87 accesses this month"
**Build the data model from day one, UI comes later.**

---

## DESIGN SYSTEM

### Priority rule
`@mts-ds` components first → custom Tailwind components → **NEVER mix their styles**.
Tailwind only for layout and spacing that `@mts-ds` doesn't cover.
Do not apply Tailwind utility classes directly on `@mts-ds` component roots — wrap them.

---

### МГТС Color Branding (critical)

MTS Granat uses `--color-brand-mts-red` as its primary brand token.
МГТС overrides this with МГТС blue (`#008ae0`) via CSS custom properties.

**`globals.css` must contain:**
```css
:root {
  --brand-blue: #008ae0;
  --color-brand-mts-red: var(--brand-blue);
}

.mtsds-vars {
  --color-control-primary-active: var(--brand-blue);
  --color-control-active-tabbar: var(--brand-blue);
  --color-accent-notification: var(--brand-blue);
  --color-brand-mts-red: var(--brand-blue);
}
```

**The root layout wrapper must carry both classes:**
```tsx
// app/layout.tsx
<body className="mtsds-vars mgts-corai-vars">
  {children}
</body>
```

This makes all Granat components render in МГТС blue automatically — no per-component overrides needed.

---

### Available CSS Tokens — use these, never hardcode hex

**Colors:**
```
--brand-blue                          #008ae0 (МГТС primary)
--color-background-primary            white
--color-background-secondary          #f2f3f7
--color-background-lower              page bg #e9ecf0
--color-background-inverted           #1d2023
--color-text-primary                  #1d2023
--color-text-secondary                #626c77
--color-text-tertiary                 #969fa8
--color-text-inverted                 #fafafa
--color-icons-primary                 #1d2023
--color-icons-secondary               #8d969f
--color-accent-positive               #26cd58
--color-accent-warning                #fac031
--color-accent-negative               #f95721
```

**Shadows:**
```
--shadow-low      subtle card shadow
--shadow-middle   elevated / modal shadow
--shadow-high     popover / tooltip shadow
```

**Border radius (from `.mgts-corai-vars`):**
```
--radius-s    8px
--radius-m    12px
--radius-l    32px
--radius-xl   80px
```

**When writing custom CSS/Tailwind `style` props — use tokens, not hex:**
```tsx
// ✅ Correct
<div style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--radius-m)' }}>

// ❌ Wrong
<div style={{ background: '#ffffff', borderRadius: '12px' }}>
```

---

### Granat Component Usage

**Setup — required imports in `app/layout.tsx`:**
```tsx
import '@mts-ds/granat2-react-root/theme.css';
import '@mts-ds/granat2-react-root/fonts.css';
```

---

#### Button / ButtonIcon
```tsx
import { Button } from '@mts-ds/granat2-react-button';
import { ButtonIcon } from '@mts-ds/granat2-react-button';

// Primary (МГТС blue automatically via CSS vars)
<Button onClick={handleClick}>Сохранить</Button>

// Secondary
<Button variant="secondary" onClick={handleClick}>Отмена</Button>

// Disabled
<Button disabled>Недоступно</Button>

// Loading state — hide text, show spinner separately
<Button disabled={isLoading}>
  {isLoading ? <Spinner size="S" /> : 'Отправить'}
</Button>

// Icon button
<ButtonIcon
  size={44}
  variant="ghost"
  contextBackgroundColor="primary"   // adapts icon color to background
  aria-label="Открыть меню"
  type="button"
>
  <MenuIcon />
</ButtonIcon>

// ButtonIcon variants: "primary" | "secondary" | "ghost"
// contextBackgroundColor: "primary" | "dark" — use "primary" on white bg, "dark" on dark bg
```

---

#### Avatar
```tsx
import { Avatar, NoGenderIcon } from '@mts-ds/granat2-react-avatar';

// With name (shows initials)
<Avatar
  firstName="Иван"
  lastName="Иванов"
  size="44"
  onClick={() => router.push('/profile')}
/>

// Without name (anonymous / placeholder)
<Avatar
  firstName=""
  lastName=""
  icon={NoGenderIcon}
  svg="noGender"
  size="44"
  onClick={() => router.push('/profile')}
/>

// size: "24" | "32" | "44" | "56" | "72" | "88"
```

---

#### Badge
```tsx
import { Badge } from '@mts-ds/granat-react-badge';

<Badge label="Новое" />
<Badge label="3" />
<Badge label="Срочно" color="negative" />

// color: "positive" | "warning" | "negative" | default (blue)
```

---

#### TextField / Select (Fields)
```tsx
import { TextField } from '@mts-ds/granat2-react-fields';
import { Select } from '@mts-ds/granat2-react-fields';

<TextField
  label="Название статьи"
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  isError={!!errors.title}
  description={errors.title?.message}
/>

// With react-hook-form:
<TextField
  label="Email"
  {...register('email')}
  isError={!!errors.email}
  description={errors.email?.message}
/>
```

---

#### Tooltip
```tsx
import { Tooltip } from '@mts-ds/granat2-react-tooltip';

<Tooltip content="Подробнее об этом поле">
  <ButtonIcon variant="ghost" size={32} aria-label="Справка">
    <HelpCircleIcon />
  </ButtonIcon>
</Tooltip>
```

---

### Fonts (MTS_GRANAT_PUBLIC archive)

Loaded globally via `@mts-ds/granat2-react-root/fonts.css`.
Available font families:
- `MTSCompact-Regular` / `MTSCompact-Medium` / `MTSCompact-Bold` — body, captions
- `MTSWide-Medium` / `MTSWide-Bold` — headings, wide style
- `MTSSans-Regular` / `MTSSans-Medium` — UI labels
- `MTSText-Regular` / `MTSText-Medium` — long-read content

Use via Tailwind custom font classes (configured in `tailwind.config.js`) or inline style:
```tsx
<h1 style={{ fontFamily: 'MTSWide-Medium' }}>Заголовок</h1>
```

---

### Theme: Dark + Light

Dark mode via `.dark` CSS class on `<html>`.
CSS variables already set in `globals.css`.
Toggle: `document.documentElement.classList.toggle('dark')`.
All Granat components respect this automatically.

---

## MODULES & RELEASE PLAN

**Release 1 (months 1–3) — MVP:**
- `core` — auth, navigation, homepage, roles
- `knowledge` — knowledge base with CMS
- `services` — БПО service catalog
- `processes` — Process Hub (data model + minimal UI)

**Release 2 (months 4–6):**
- `requests` — requests from internal customers
- `documents` — document constructor
- `dashboards` — metrics and БПО team reporting

**Release 3 (months 7–9):**
- `integrations` — Bitrix24, corp bot, SSO
- `assistant` — RAG chatbot (only when internal LLM access is granted)

---

## AUTHENTICATION

**Now:** Standard FastAPI JWT. Local test users in DB. passlib + bcrypt.
**Later:** Authlib for OIDC/SAML (provider TBD — ADFS / Keycloak / corp).
**Frontend:** NextAuth.js (Auth.js) for client-side session management.

**Roles:** admin / lawyer / manager / employee / guest

---

## CODE REQUIREMENTS

### Security hygiene (from day one)
- All secrets: environment variables only, never in code
- All DB queries: through ORM, never raw SQL with concatenation
- CSRF protection on all forms
- Logs: no personal data
- HTTPS in prod (corp cert from IT)
- DB backups from day one

### Code style
- Python: ruff (line-length 100)
- TypeScript: ESLint + Prettier, strict mode
- Comments in Russian (internal project)
- Types everywhere — TypeScript strict mode ON

### API endpoint structure
```
GET    /api/health              ← already implemented
GET    /api/{module}/
POST   /api/{module}/
GET    /api/{module}/{id}
PUT    /api/{module}/{id}
DELETE /api/{module}/{id}
```

---

## CURRENT STATE (skeleton complete)

Already built:
- Full folder structure (backend + frontend)
- docker-compose.yml (postgres 16.4 + redis 7.4 + backend + frontend)
- backend/pyproject.toml, Dockerfile, main.py, core/config.py, core/database.py
- GET /api/health → {"status":"ok"}
- frontend: package.json (@mts-ds), .npmrc, next.config.js, tailwind.config.js, tsconfig.json, layout.tsx, page.tsx, globals.css
- .env.example, .gitignore, README.md

**Next steps:**
1. `docker compose up --build` → verify localhost:3000, localhost:8000/docs
2. Alembic setup (async SQLAlchemy)
3. Module `core`: User model, JWT auth, get_current_user dependency, login form
4. Module `knowledge`: Category + Article models, CRUD, CMS UI, PostgreSQL FTS

---

## WHAT NOT TO DO
- Do NOT suggest microservices
- Do NOT suggest Kubernetes (Docker Compose now, maybe docker swarm later)
- Do NOT suggest external clouds (AWS, Azure, GCP) — blocked by corp policy
- Do NOT suggest foreign LLM APIs directly (requires security audit)
- Do NOT use `latest` Docker tags — always pin versions
- Do NOT store secrets in code or docker-compose
- Do NOT over-engineer for MVP — working first, beautiful later
- Do NOT suggest WCAG compliance
- Do NOT suggest mobile apps (web with responsive only)
- Do NOT change the fixed stack without explicit request
- Do NOT apply Tailwind classes directly on @mts-ds component roots

---

## DATABASE

PostgreSQL 16.4 in Docker container.
Local connection string:
```
postgresql+asyncpg://legalhub:legalhub_dev@localhost:5432/legalhub
```
Data persists in Docker volume `postgres_data`.
pgvector extension planned for future RAG (do not implement now, just keep in mind).

---

## GIT STRATEGY
- Dev on personal laptop
- Repo: personal GitHub
- Deploy: GitLab CI in corp environment
- Branches: `main` (prod), `dev` (development), `feature/*` (features)
