/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-запросы проксируем на бэкенд в dev-режиме
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
