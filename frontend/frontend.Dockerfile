# Используется ТОЛЬКО для корп-деплоя (CI/CD).
# Локальная разработка: npm run dev напрямую, без Docker.
#
# Требование к среде: .npmrc должен указывать на Nexus:
#   registry=https://nexus.mgts.ru/repository/npm-all/
#   strict-ssl=false
# На личном ноуте .npmrc указывает на публичный npm — этот Dockerfile там не работает.
# В корп CI .npmrc подкладывается как секрет или уже прописан на машине.

FROM node:20.18.0-alpine

WORKDIR /app

# Копируем lock-файл и конфиги до копирования кода — для кэширования слоёв
COPY package.json package-lock.json .npmrc ./

# Устанавливаем зависимости
# --legacy-peer-deps нужен из-за peer-dep конфликтов в @mts-ds
RUN npm ci --legacy-peer-deps

# Копируем весь код
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
