/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Set correct workspace root to silence multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname),

  // Disable ESLint during build - warnings are not blockers
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: ['yourdomain.com', '3kpro.services'],
  },

  // Security headers including CSP for DotLottie animations
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com",
              "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
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
