# Legal Hub — Портал БПО МГТС

## Стек

| Слой | Технология |
|------|-----------|
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2.0 + Alembic |
| Frontend | Next.js 14 + React 19 + TypeScript |
| UI | @mts-ds/granat2-react (МТС Гранат) + Tailwind CSS |
| БД | PostgreSQL 16 |
| Кэш/очереди | Redis + arq |
| Контейнеры | Docker + Docker Compose |

## Быстрый старт (локально)

### 1. Требования

- Docker Desktop 4.x+
- Git

### 2. Клонировать и настроить

```bash
git clone <repo-url> legal-hub
cd legal-hub
cp .env.example .env
# Откройте .env и при необходимости измените пароли
```

### 3. Запустить

```bash
docker compose up --build
```

После запуска:
- Фронтенд: http://localhost:3000
- API: http://localhost:8000
- Swagger-документация API: http://localhost:8000/docs

### 4. Остановить

```bash
docker compose down
```

Данные БД сохраняются в Docker volume `postgres_data`.

## Разработка без Docker (локально)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install uv
uv pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
# Если на корп. машине с доступом к Nexus:
npm install   # .npmrc подтянет @mts-ds через nexus.mgts.ru
npm run dev
```

## Структура проекта

```
legal-hub/
├── backend/
│   ├── app/
│   │   ├── api/         # Эндпоинты (роуты)
│   │   ├── core/        # Конфиг, БД, безопасность
│   │   ├── models/      # SQLAlchemy-модели
│   │   ├── schemas/     # Pydantic-схемы
│   │   └── services/    # Бизнес-логика
│   ├── alembic/         # Миграции БД (создадим позже)
│   └── pyproject.toml
│
├── frontend/
│   ├── app/             # Next.js App Router (страницы)
│   ├── components/      # React-компоненты
│   ├── hooks/           # Кастомные хуки
│   ├── lib/             # API-клиент, утилиты
│   └── types/           # TypeScript-типы
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Модули (план)

| Модуль | Статус | Описание |
|--------|--------|----------|
| core | 🔧 В разработке | Auth, навигация, главная |
| knowledge | 📋 В планах | База знаний с CMS |
| services | 📋 В планах | Каталог услуг БПО |
| processes | 📋 В планах | Process Hub |
| requests | 📋 В планах | Заявки от заказчиков |
| documents | 📋 В планах | Конструктор документов |
| dashboards | 📋 В планах | Метрики команды |
| integrations | 📋 В планах | Bitrix24, SSO, бот |
| assistant | 📋 Phase 2 | Чат-бот (после LLM) |
