/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['yourdomain.com', 'content-cascade-ai:3000'],
  },
  // Enable standalone output for Docker optimization
  output: 'standalone',
}

module.exports = nextConfig
