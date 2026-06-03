/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig = {
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
