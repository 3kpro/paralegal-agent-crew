import './globals.css'
import type { Metadata } from 'next'
import '@/lib/env' // Validate environment variables at startup

export const metadata: Metadata = {
  title: 'TrendPulse™ Beta - AI-Powered Content Creation | Early Access Live',
  description: 'Join 2,500+ creators in TrendPulse™ Beta. Experience next-gen AI content creation with 6-platform publishing, real-time trend detection, and 50% lifetime pricing. Beta access available now.',
  keywords: 'TrendPulse Beta, AI content creation, beta access, content automation, social media automation, multi-platform publishing, trend detection, GPT-4 content, Claude AI, real-time analytics, beta pricing, early access',
  authors: [{ name: '3K Pro Services' }],
  openGraph: {
    title: 'TrendPulse™ Beta - Next-Generation AI Content Creation',
    description: 'Join 2,500+ beta creators using TrendPulse™ for 6-platform content publishing, real-time trend detection, and enterprise AI generation. 50% lifetime pricing for early adopters.',
    url: 'https://3kpro.services',
    siteName: 'TrendPulse™ Beta',
    type: 'website',
    images: [
      {
        url: 'https://3kpro.services/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrendPulse™ Beta - AI-powered content creation platform with multi-platform publishing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendPulse™ Beta - AI Content Creation Revolution',
    description: '🚀 Beta Live Now! Join 2,500+ creators using next-gen AI for content creation. Real-time trends, 6-platform publishing, 50% lifetime pricing.',
    images: ['https://3kpro.services/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-tron-dark text-tron-text antialiased">
        {children}
      </body>
    </html>
  )
}

