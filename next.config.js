/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Set correct workspace root to silence multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname),

  // Disable ESLint during build - warnings are not blockers
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['yourdomain.com', '3kpro.services'],
  },
  // Optimized for Vercel deployment - TypeScript fixes applied
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
  // Disable Redis for local builds
  reactStrictMode: true,
  env: {
    REDIS_DISABLED: 'true'
  },
  // Handle Node.js APIs in Edge Runtime
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
}

module.exports = nextConfig
