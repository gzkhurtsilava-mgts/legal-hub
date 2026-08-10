# Перенос проекта в корп. контур (тестовый стенд + GitLab)

Инструкция для развёртывания с нуля на корп. машине: забрать финальный код с GitHub,
поднять стенд, создать новый репозиторий в корп. GitLab и продолжить разработку там.

Финальное состояние на GitHub: ветка `main` = ветка `POA-doveren`, коммит `b451634`.

---

## 1. Забрать финальный код с GitHub

Вариант А — **клон с историей** (рекомендуется: сохранятся все коммиты).

```powershell
cd C:\projects
git clone https://github.com/gzkhurtsilava-mgts/legal-hub.git
cd legal-hub
git log --oneline -1        # должно быть b451634
```

Вариант Б — **чистый архив без истории** (если в GitLab нужен «пустой» старт).

```powershell
cd C:\projects
git clone --depth 1 https://github.com/gzkhurtsilava-mgts/legal-hub.git legal-hub-tmp
cd legal-hub-tmp
git archive --format=zip --output=..\legal-hub-final.zip HEAD
```

Вариант В — **без git** (только браузер): на странице репозитория
`Code → Download ZIP` для ветки `main`.

> Если корп. прокси мешает git: `git config --global http.sslVerify false`.

**Проверка полноты выгрузки** — должно совпасть:

```powershell
(Get-ChildItem frontend\vendor\@mts-ds -Directory).Count      # 40
(Get-ChildItem backend\alembic\versions -Filter *.py).Count   # 18
```

Если `frontend\vendor\@mts-ds` пуст или пакетов меньше 40 — архив неполный, фронт не соберётся.

---

## 2. Создать репозиторий в корп. GitLab

```powershell
cd C:\projects\legal-hub

# Вариант А — сохранить историю: просто переключить remote
git remote set-url origin https://gitlab.mgts.ru/<группа>/legal-hub.git
git push -u origin main

# Вариант Б — старт с нуля, без истории GitHub
Remove-Item -Recurse -Force .git
git init -b main
git add -A
git commit -m "chore: импорт Legal Hub из GitHub (b451634)"
git remote add origin https://gitlab.mgts.ru/<группа>/legal-hub.git
git push -u origin main
```

Репозиторий в GitLab создавать **пустым** (без README/.gitignore), иначе первый push
упрётся в расхождение историй.

---

## 3. Переменные окружения

```powershell
Copy-Item .env.example .env
```

Открыть `.env` и заполнить обязательные:

| Переменная | Что поставить |
|---|---|
| `SECRET_KEY` | случайная строка ≥ 32 символов |
| `NEXTAUTH_SECRET` | случайная строка ≥ 32 символов (**своя**, не та же что `SECRET_KEY`) |
| `NEXTAUTH_URL` | `http://localhost:3000` (или адрес стенда) |
| `POSTGRES_PASSWORD` | пароль БД стенда |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` (или адрес стенда) |
| `CORS_ORIGINS` | `["http://localhost:3000"]` — вписать реальный адрес стенда |

Генерация секретов:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

`frontend/.env.local` нужен **только** если фронт запускается вне Docker
(`npm run dev`) — тогда `Copy-Item frontend\.env.local.example frontend\.env.local`.
В Docker переменные приходят из корневого `.env`.

---

## 4. Настроить npm на Nexus

```powershell
Copy-Item frontend\.npmrc.corp frontend\.npmrc
```

Пакеты `@mts-ds` в Nexus **не нужны** — все 40 лежат в `frontend/vendor/@mts-ds/`
и подключены через `file:` в `package.json`. Ставятся из репозитория, реестр не трогают.

---

## 5. Поднять стенд

Всегда с корп. оверрайдом — иначе Docker полезет в Docker Hub и запросит авторизацию прокси:

```powershell
docker compose -f docker-compose.yml -f docker-compose.corp.yml up -d --build
```

Образы из Harbor (уже прописаны в `docker-compose.corp.yml`):

- `harbor.mgts.ru/dockerhub/library/postgres:16.4`
- `harbor.mgts.ru/it/rnd/llm-eval/redis:7.2.13-alpine`
- `harbor.mgts.ru/dockerhub/eugenmayer/jodconverter:rest-0.2.0`

Сервисы: `postgres`, `redis`, `jodconverter`, `backend`, `worker` (arq), `frontend`.

---

## 6. Миграции и тестовые данные

```powershell
# 18 миграций Alembic
docker exec -it legal-hub-backend alembic upgrade head

# Пользователи + база знаний
docker exec -it legal-hub-backend python -m scripts.seed

# Каталог полномочий и доверенностей
docker exec -it legal-hub-backend python -m scripts.seed_poa
```

`seed_poa` наполняет оргструктуру и полномочия по документам «Полномочия СЕО-1 / СЕО-2».
ФИО сотрудников, номера и даты доверенностей в сидах — вымышленные.

---

## 7. Проверка

```powershell
curl http://localhost:8000/api/health     # backend
Start-Process http://localhost:3000       # frontend
```

Признаки, что всё встало правильно:

- на страницах фирменный синий МГТС `#008ae0`, не красный МТС;
- шрифты MTS Wide / MTS Compact подхватились (заголовки широкие);
- вход по тестовому пользователю работает.

Тестовые учётки из `scripts/seed.py` (пароль у всех `test123`) —
`admin@test.ru`, `lawyer@test.ru`, `manager@test.ru`, `employee@test.ru`.
Это данные для локального стенда; в прод такие сиды не заливать.

Если фронт собрался, но без стилей — проверить, что `frontend/vendor/@mts-ds/base/build`
и `.../core/build` не пустые (это содержимое корп-пакетов, а не артефакты сборки).

---

## 8. Дальнейшая разработка в корп. контуре

Перезапуск бэкенда без пересборки (код синкается bind-mount'ом):

```powershell
docker restart legal-hub-backend
```

Не запускать `docker compose up -d backend` без корп. оверрайда — потянет образы
с Docker Hub и упрётся в авторизацию прокси.

GitLab CI: раннер с тегом `[prod]`, деплой по тегу `release-X.X.X`.

---

## Что нового в этой версии (относительно прошлой синхронизации)

- Новых npm-пакетов нет — `package.json` не менялся.
- Новых Python-зависимостей нет — `pyproject.toml` не менялся.
- Новых миграций нет — те же 18.
- **Новые переменные окружения:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — раньше
  отсутствовали в `.env.example`, из-за чего свежий клон давал нерабочую авторизацию.
- В git добавлено `frontend/vendor/@mts-ds/{base,core}/build` (116 файлов) — раньше
  их срезало правило `build/` в `.gitignore`, и клон был неполным.
- Убран устаревший атрибут `version` из `docker-compose.yml`.
