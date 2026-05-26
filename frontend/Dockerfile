FROM node:20.18.0-alpine

WORKDIR /app

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Копируем конфиги зависимостей
COPY package.json pnpm-lock.yaml* .npmrc ./

# Устанавливаем зависимости
# В dev-режиме — через Nexus согласно .npmrc
RUN pnpm install

# Копируем весь код
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
