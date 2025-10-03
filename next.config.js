/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['yourdomain.com', '3kpro.services'],
  },
  // Optimized for Vercel deployment - TypeScript fixes applied
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
}

module.exports = nextConfig
