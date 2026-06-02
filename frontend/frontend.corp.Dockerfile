FROM harbor.mgts.ru/dockerhub/node:20.18.0-alpine

WORKDIR /app

# vendor/ нужен до npm install — file: refs разрешаются из него
COPY package.json package-lock.json .npmrc ./
COPY vendor/ ./vendor/
COPY scripts/ ./scripts/

# --ignore-scripts: пропускаем backup/restore скрипты (они для Windows-ноута, не для Docker)
# Без --install-links: npm создаёт симлинки на /app/vendor/ — корректные Linux-пути
# COPY . . убран: source files приходят через bind-mount ./frontend:/app в docker-compose.
# node_modules сохраняется в anonymous volume и не перетирается bind-mount-ом.
RUN npm install --legacy-peer-deps --ignore-scripts

EXPOSE 3000

CMD ["npm", "run", "dev"]
