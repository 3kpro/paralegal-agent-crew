/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Set correct workspace root to silence multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname),

  // Explicitly disable Turbopack warnings by providing empty config
  // We are using custom webpack config below
  turbopack: {},

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { hostname: 'yourdomain.com' },
      { hostname: '3kpro.services' },
      { hostname: 'api.dicebear.com' },
    ],
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://vercel.live https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.linkedin.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.app https://*.linkedin.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://r2cdn.perplexity.ai https://*.linkedin.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://vercel.live wss://ws-us3.pusher.com https://*.vercel.app https://*.linkedin.com",
              "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://vercel.live https://www.linkedin.com https://*.linkedin.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
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

module.exports = nextConfig;
