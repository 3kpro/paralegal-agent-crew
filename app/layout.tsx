import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import "@/lib/env"; // Validate environment variables at startup
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "@/components/StructuredData";
import { DomainTransitionBanner } from "@/components/DomainTransitionBanner";

export const metadata: Metadata = {
  metadataBase: new URL('https://getxelora.com'),
  title: "XELORA - Predictive Intelligence for Creators",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  description:
    "XELORA analyzes emerging signals to reveal what's about to rise. Predict momentum. Engineer virality. Real-time signal analysis, multi-platform optimization, 6+ platform integration.",
  keywords:
    "viral prediction, trend analysis, content optimization, signal intelligence, momentum prediction, multi-platform content, social media AI, AI content prediction, trend forecasting, viral intelligence, creator tools",
  authors: [{ name: "XELORA" }],
  openGraph: {
    title: "XELORA - Predict Momentum. Engineer Virality.",
    description:
      "XELORA analyzes emerging signals across platforms to reveal what's about to rise. Before creators see it. Before the internet reacts to it.",
    url: "https://getxelora.com",
    siteName: "XELORA",
    type: "website",
    images: [
      {
        url: "https://getxelora.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "XELORA - Predictive intelligence platform for creators and brands.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XELORA - Predictive Intelligence",
    description:
      "Predict momentum. Engineer virality. XELORA analyzes signals before the internet reacts.",
    images: ["https://getxelora.com/og-image.png"],
    creator: "@XELORA_APP",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'IcYTc1Uhe9VoxubFMT9w-YxpcN6udMBRFJ5BDVmV-HI',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || 'ADD_YOUR_BING_CODE_HERE',
    },
  },
  alternates: {
    canonical: 'https://getxelora.com',
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <DomainTransitionBanner />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
