FROM node:20.18.0-alpine

WORKDIR /app

# vendor/@mts-ds нужен до npm ci — package.json ссылается на них через file:
COPY vendor/ vendor/

# Копируем lock-файл и конфиги до копирования кода — для кэширования слоёв
COPY package.json package-lock.json .npmrc ./

# --ignore-scripts: пропускаем backup/restore (@mts-ds приходят из vendor/, не из npm)
# --legacy-peer-deps нужен из-за peer-dep конфликтов в @mts-ds
RUN npm ci --legacy-peer-deps --ignore-scripts

# Копируем весь код (node_modules и .next исключены через .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
