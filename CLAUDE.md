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
- Next.js 14.2.35 (App Router) / React 19.2.1 / TypeScript 5.7.2
- Tailwind CSS 3.4.17
- @mts-ds design system (see DESIGN SYSTEM section for full list)
- @tanstack/react-query 5.59.0 / react-hook-form 7.54.2 / zod 3.24.1
- zustand 5.0.1 / lucide-react 1.0.1 / clsx 2.1.1
- @floating-ui/react (required by granat2-react-tooltip)
- Package manager: npm with --legacy-peer-deps (NOT pnpm on personal laptop)

### Infrastructure
- PostgreSQL 16.4 / Redis 7.4-alpine
- Docker + Docker Compose (all code runs INSIDE containers)
- GitLab CI (corp instance) / Nginx (prod reverse proxy)

---

## CORPORATE INFRASTRUCTURE (critical)

### Two environments — DIFFERENT npm setup

**Personal laptop (development with Claude Code):**
- `.npmrc`: `registry=https://registry.npmjs.org/` (public npm)
- `@mts-ds` packages come from `node_modules/` (copied from corp)
- Always use: `npm install --legacy-peer-deps --prefer-offline`
- `--prefer-offline` is MANDATORY — prevents npm from deleting @mts-ds packages
- NEVER run plain `npm install` without `--prefer-offline` — it will delete @mts-ds

**Corp machine (Nexus access):**
- `.npmrc`: `registry=https://nexus.mgts.ru/repository/npm-all/`
- `strict-ssl=false` required (corp MITM proxy)
- Install: `npm install --legacy-peer-deps`

### @mts-ds packages — CRITICAL
All @mts-ds packages are installed in `node_modules/@mts-ds/` — real directories (NOT symlinks).
They are NOT available on public npm. Source: corporate Nexus only.
On personal laptop they were manually copied from corp machine.
All 39 packages are present — do NOT try to install them from registry.

**ALL installed @mts-ds packages (39 total):**
```
@mts-ds/base @mts-ds/core @mts-ds/granat-react-badge
@mts-ds/granat2-react @mts-ds/granat2-react-avatar @mts-ds/granat2-react-badge
@mts-ds/granat2-react-banner-primary @mts-ds/granat2-react-banner-secondary
@mts-ds/granat2-react-banner-tertiary @mts-ds/granat2-react-breadcrumb
@mts-ds/granat2-react-bulleted-list @mts-ds/granat2-react-button
@mts-ds/granat2-react-card @mts-ds/granat2-react-checkbox
@mts-ds/granat2-react-control-list @mts-ds/granat2-react-counter
@mts-ds/granat2-react-divider @mts-ds/granat2-react-droplist
@mts-ds/granat2-react-fields @mts-ds/granat2-react-internal-banner-icons
@mts-ds/granat2-react-internal-text @mts-ds/granat2-react-link
@mts-ds/granat2-react-numbered-list @mts-ds/granat2-react-pagination-dots
@mts-ds/granat2-react-progress-circle @mts-ds/granat2-react-progress-linear
@mts-ds/granat2-react-radio @mts-ds/granat2-react-root
@mts-ds/granat2-react-segmented-control @mts-ds/granat2-react-snackbar
@mts-ds/granat2-react-spinner @mts-ds/granat2-react-spoiler
@mts-ds/granat2-react-sticky-banner @mts-ds/granat2-react-switch
@mts-ds/granat2-react-tabbar @mts-ds/granat2-react-tabs
@mts-ds/granat2-react-theme @mts-ds/granat2-react-toast
@mts-ds/granat2-react-tooltip @mts-ds/react-utils
```

### npm install rules
```bash
# ✅ CORRECT — install new public package
npm install PACKAGE --legacy-peer-deps --prefer-offline

# ✅ CORRECT — install specific version
npm install next@14.2.35 react@19.2.1 --legacy-peer-deps --prefer-offline

# ❌ WRONG — will delete @mts-ds packages
npm install

# ❌ WRONG — will try to reach Nexus
npm install @mts-ds/anything
```

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

### GitHub
- Repo: `https://github.com/gzkhurtsilava-mgts/legal-hub`
- Two accounts: personal (CaravelloGK) and corp (gzkhurtsilava-mgts)
- Always push from corp account: `git remote set-url origin https://gzkhurtsilava-mgts@github.com/gzkhurtsilava-mgts/legal-hub.git`

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

### layout.tsx setup (CURRENT WORKING STATE)
```tsx
import '@mts-ds/granat2-react-root/theme.css';  // ✅ works (exports map → dist/theme.css)
// fonts.css is NOT imported here — fonts loaded via @font-face in globals.css
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="mtsds-vars mgts-corai-vars">
        {children}
      </body>
    </html>
  );
}
```

**IMPORTANT:** Do NOT import `@mts-ds/granat2-react-root/fonts.css` — it uses relative paths
that break in Next.js. Fonts are loaded via `@font-face` in `globals.css` instead.

### Fonts — loaded via @font-face in globals.css
Файлы шрифтов лежат в `frontend/public/fonts/` (скопированы из `@mts-ds/base`).
Пути в globals.css используют абсолютный URL `/fonts/...` — работает и в dev, и в production.
```css
@font-face { font-family: 'MTSCompact'; font-weight: 400;
  src: url('/fonts/MTSCompact-Regular.woff2') format('woff2'); }
@font-face { font-family: 'MTSCompact'; font-weight: 500;
  src: url('/fonts/MTSCompact-Medium.woff2') format('woff2'); }
@font-face { font-family: 'MTSCompact'; font-weight: 700;
  src: url('/fonts/MTSCompact-Bold.woff2') format('woff2'); }
@font-face { font-family: 'MTSWide'; font-weight: 500;
  src: url('/fonts/MTSWide-Medium.woff2') format('woff2'); }
@font-face { font-family: 'MTSWide'; font-weight: 700;
  src: url('/fonts/MTSWide-Bold.woff2') format('woff2'); }
@font-face { font-family: 'MTSSans'; font-weight: 400;
  src: url('/fonts/MTSSans-Regular__W.woff2') format('woff2'); }
@font-face { font-family: 'MTSSans'; font-weight: 500;
  src: url('/fonts/MTSSans-Medium__W.woff2') format('woff2'); }
@font-face { font-family: 'MTSText'; font-weight: 400;
  src: url('/fonts/MTSText-Regular.woff2') format('woff2'); }
@font-face { font-family: 'MTSText'; font-weight: 500;
  src: url('/fonts/MTSText-Medium.woff2') format('woff2'); }
```

Use fonts in components:
```tsx
<h1 style={{ fontFamily: 'MTS Wide', fontWeight: 700 }}>Заголовок</h1>
<p style={{ fontFamily: 'MTS Compact', fontWeight: 400 }}>Текст</p>
```
// ВАЖНО: имена с пробелом — 'MTS Compact', 'MTS Wide', 'MTS Text', 'MTS Sans'
// Именно так их задаёт @mts-ds внутри компонентов. MTSCompact (без пробела) = не работает.

### МГТС Color Branding (critical)
MTS Granat uses `--color-brand-mts-red`. МГТС overrides with blue `#008ae0`.

**globals.css must contain:**
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
.mgts-corai-vars {
  --radius-s: 8px;
  --radius-m: 12px;
  --radius-l: 32px;
  --radius-xl: 80px;
}
```

### Available CSS Tokens — use these, never hardcode hex
```
--brand-blue                    #008ae0 (МГТС primary)
--color-background-primary      white
--color-background-secondary    #f2f3f7
--color-background-lower        #e9ecf0 (page background)
--color-background-inverted     #1d2023
--color-text-primary            #1d2023
--color-text-secondary          #626c77
--color-text-tertiary           #969fa8
--color-text-inverted           #fafafa
--color-icons-primary           #1d2023
--color-icons-secondary         #8d969f
--color-accent-positive         #26cd58
--color-accent-warning          #fac031
--color-accent-negative         #f95721
--shadow-low / --shadow-middle / --shadow-high
--radius-s / --radius-m / --radius-l / --radius-xl
```

### Component imports — use individual packages
```tsx
import { Button, ButtonIcon } from '@mts-ds/granat2-react-button';
import { Avatar, NoGenderIcon } from '@mts-ds/granat2-react-avatar';
import { Badge } from '@mts-ds/granat-react-badge';          // NOTE: granat-react-badge (no "2")
import { TextField, Select } from '@mts-ds/granat2-react-fields';
import { Tooltip } from '@mts-ds/granat2-react-tooltip';
import { Spinner } from '@mts-ds/granat2-react-spinner';
```

### SVG icons — must be imported as React components
```tsx
import { ReactComponent as ArrowRight } from '../images/ArrowRight.svg';
<Icon icon={<ArrowRight />} />
```

### Button
```tsx
<Button onClick={handleClick}>Сохранить</Button>
<Button variant="secondary">Отмена</Button>
<Button disabled>Недоступно</Button>
<ButtonIcon size={44} variant="ghost" contextBackgroundColor="primary" aria-label="Меню">
  <MenuIcon />
</ButtonIcon>
```

### TextField
```tsx
<TextField
  label="Название"
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  isError={!!errors.title}
  description={errors.title?.message}
/>
// With react-hook-form:
<TextField label="Email" {...register('email')} isError={!!errors.email} description={errors.email?.message} />
```

### Tooltip (requires @floating-ui/react in node_modules)
```tsx
<Tooltip content="Подсказка">
  <ButtonIcon variant="ghost" size={32} aria-label="Справка"><HelpCircleIcon /></ButtonIcon>
</Tooltip>
```

### Theme: Dark + Light
Dark mode via `.dark` class on `<html>`.
Toggle: `document.documentElement.classList.toggle('dark')`.

### Design System Storybook (accessible from corp network)
```
http://components.dev.design.mts-corp.ru/g2-react/
```

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

## CURRENT STATE

### What's working
- Frontend: Next.js 14.2.35 running on localhost:3000
- Design system: @mts-ds components render with МГТС blue (#008ae0)
- Fonts: MTSCompact, MTSWide, MTSSans loaded via @font-face
- Backend: FastAPI skeleton with GET /api/health
- Both personal laptop and corp machine are in sync via GitHub

### Project structure
```
legal-hub/
├── backend/
│   ├── app/
│   │   ├── main.py          ← FastAPI entry point
│   │   ├── api/health.py    ← GET /api/health
│   │   └── core/
│   │       ├── config.py    ← pydantic-settings
│   │       └── database.py  ← async SQLAlchemy
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       ← theme.css + globals.css, body has mtsds-vars mgts-corai-vars
│   │   ├── page.tsx         ← test page with Button + Tooltip
│   │   └── globals.css      ← @font-face + МГТС color overrides
│   ├── node_modules/        ← NOT in git, includes @mts-ds (39 packages)
│   ├── .npmrc               ← registry=https://registry.npmjs.org/ (personal laptop)
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
├── .env.example
└── CLAUDE.md
```

### Next steps
1. Set up Alembic (async SQLAlchemy migrations)
2. Module `core`: User model, JWT auth, get_current_user dependency, login page
3. Module `knowledge`: Category + Article models, CRUD, CMS UI, PostgreSQL FTS

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
- Dev on personal laptop (Windows 11)
- Repo: `https://github.com/gzkhurtsilava-mgts/legal-hub` (corp GitHub account)
- Deploy: GitLab CI in corp environment
- Branches: `main` (prod), `dev` (development), `feature/*` (features)
- node_modules is in .gitignore — never commit it

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
- Do NOT run `npm install` without `--prefer-offline` on personal laptop
- Do NOT try to install @mts-ds packages from registry — they are already in node_modules
- Do NOT import `@mts-ds/granat2-react-root/fonts.css` — use @font-face in globals.css instead
- Do NOT use pnpm on personal laptop — use npm