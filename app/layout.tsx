import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Content Cascade AI - Turn Trending Topics Into Published Content',
  description: 'TrendPulse™ discovers what\'s hot, AI Cascade™ generates professional content, and OmniFormat™ publishes across Twitter, LinkedIn, and email—automatically.',
  keywords: 'AI content creation, trend discovery, Twitter threads, LinkedIn posts, email marketing, content automation, social media automation, TrendPulse, AI Cascade, OmniFormat',
  authors: [{ name: '3K Pro Services' }],
  openGraph: {
    title: 'Content Cascade AI - Turn Trending Topics Into Published Content',
    description: 'TrendPulse™ discovers what\'s hot, AI Cascade™ generates professional content, and OmniFormat™ publishes everywhere—automatically.',
    url: 'https://3kpro.services',
    siteName: 'Content Cascade AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Cascade AI - Turn Trending Topics Into Published Content',
    description: 'TrendPulse™ discovers what\'s hot, AI Cascade™ generates professional content, and OmniFormat™ publishes everywhere—automatically.',
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
