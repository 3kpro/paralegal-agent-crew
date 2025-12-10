import "./globals.css";
import type { Metadata, Viewport } from "next";
import "@/lib/env"; // Validate environment variables at startup
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL('https://xelora.app'),
  title: "XELORA - Predictive Intelligence for Creators",
  description:
    "XELORA analyzes emerging signals to reveal what's about to rise. Predict momentum. Engineer virality. Real-time signal analysis, multi-platform optimization, 6+ platform integration.",
  keywords:
    "viral prediction, trend analysis, content optimization, signal intelligence, momentum prediction, multi-platform content, social media AI, AI content prediction, trend forecasting, viral intelligence, creator tools",
  authors: [{ name: "3K Pro Services" }],
  openGraph: {
    title: "XELORA - Predict Momentum. Engineer Virality.",
    description:
      "XELORA analyzes emerging signals across platforms to reveal what's about to rise. Before creators see it. Before the internet reacts to it.",
    url: "https://xelora.app",
    siteName: "XELORA",
    type: "website",
    images: [
      {
        url: "https://xelora.app/og-image.png",
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
    images: ["https://xelora.app/og-image.png"],
    creator: "@3kproservices",
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
    google: 'jBm4gu3jK_jeW_9YtU_BRQpCI3FGQhZJAzEdRkplz7s',
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body className="bg-tron-dark text-tron-text antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
