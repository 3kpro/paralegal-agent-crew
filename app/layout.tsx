import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '3K Pro Services - AI-Powered Content Marketing Platform',
  description: 'Transform any content into complete multi-channel campaigns with professional UGC videos. AI-powered content creation for modern businesses.',
  keywords: 'AI content marketing, UGC videos, content automation, social media content, video marketing',
  authors: [{ name: '3K Pro Services' }],
  openGraph: {
    title: '3K Pro Services - AI Content Marketing Platform',
    description: 'Transform any content into complete multi-channel campaigns with professional UGC videos.',
    url: 'https://3kpro.services',
    siteName: '3K Pro Services',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3K Pro Services - AI Content Marketing Platform',
    description: 'Transform any content into complete multi-channel campaigns with professional UGC videos.',
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
