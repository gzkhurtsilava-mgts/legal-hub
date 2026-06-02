FROM harbor.mgts.ru/dockerhub/node:20.18.0-alpine

WORKDIR /app

# .npmrc.corp должен быть скопирован в frontend/ перед сборкой:
#   cp .npmrc.corp .npmrc
# Он указывает на Nexus: registry=https://nexus.mgts.ru/repository/npm-all/
# @mts-ds берётся из vendor/ (file: refs) — Nexus для них не нужен

COPY package.json package-lock.json .npmrc ./
COPY vendor/ ./vendor/
COPY scripts/ ./scripts/

RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
