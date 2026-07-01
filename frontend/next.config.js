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
      config.watchOptions = { poll: 800, aggregateTimeout: 300 };
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
