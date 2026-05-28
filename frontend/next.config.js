/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-запросы проксируем на бэкенд в dev-режиме
  async rewrites() {
    return [
      {
        // /api/auth/* — обрабатывает NextAuth, не трогаем
        source: "/api/((?!auth/).*)",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
