/** @type {import('next').NextConfig} */
// Rewrites выполняются на стороне сервера Next.js (внутри Docker-контейнера).
// Поэтому цель прокси должна указывать на бэкенд по имени сервиса Docker
// (backend:8000), а НЕ на localhost:8000 — внутри контейнера localhost это сам
// фронтенд, и запрос падает с Connection refused → Next.js отдаёт 500.
// BACKEND_INTERNAL_URL задаётся в docker-compose; NEXT_PUBLIC_API_URL — фолбэк
// для запуска без Docker.
const API =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Проект лежит на bind-mount из OneDrive — inotify там не работает, нужен polling.
      // ВАЖНО: не перезаписывать watchOptions целиком — Next.js кладёт туда ignored,
      // без которого watcher опрашивает node_modules и vendor/@mts-ds (12 500 файлов)
      // каждый интервал. Обход этого дерева занимает ~100 с → dev-сервер стоит колом.
      config.watchOptions = {
        ...config.watchOptions,
        poll: 2000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/vendor/**",
          "**/.next/**",
          "**/.git/**",
        ],
      };
    }
    return config;
  },
  async rewrites() {
    return [
      // Браузерные запросы к файлам (/api/files/...) проксируем на бэкенд.
      // Работает в dev (нет Nginx). В проде Nginx перехватывает /api/* раньше Next.js.
      // /api/auth/* обрабатывает NextAuth — не трогаем.
      {
        source: "/api/files/:path*",
        destination: `${API}/api/files/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
