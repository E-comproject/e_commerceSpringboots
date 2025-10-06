/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  // Enable standalone output for Docker
  output: 'standalone',
}

module.exports = nextConfig
