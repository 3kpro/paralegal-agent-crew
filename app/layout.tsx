import "./globals.css";
import type { Metadata, Viewport } from "next";
import "@/lib/env"; // Validate environment variables at startup
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "TrendPulse™ - AI Viral Content Prediction | 87% Accuracy Score",
  description:
    "Predict viral content BEFORE you create it. TrendPulse AI analyzes 1M+ viral posts to give you a Viral Score (0-100) with 87% accuracy. Stop wasting time on content that flops. Multi-platform content generation for Twitter, LinkedIn, Instagram, Reddit.",
  keywords:
    "viral content prediction, AI content analysis, viral score, content performance prediction, social media AI, trending topics, content marketing AI, viral marketing tool, engagement prediction, content analytics, Twitter viral, LinkedIn viral, Instagram growth, Reddit marketing, AI content generator, GPT-4 content, Gemini AI, content automation, social media automation",
  authors: [{ name: "3K Pro Services" }],
  openGraph: {
    title: "TrendPulse™ - Predict Viral Content with 87% Accuracy",
    description:
      "Stop guessing. Start knowing. TrendPulse AI predicts what content will go viral BEFORE you create it. Viral Score™ system trained on 1M+ viral posts. Save 15+ hours/week by eliminating content that flops.",
    url: "https://trendpulse.3kpro.services",
    siteName: "TrendPulse™",
    type: "website",
    images: [
      {
        url: "https://trendpulse.3kpro.services/og-image.png",
        width: 1200,
        height: 630,
        alt: "TrendPulse - AI viral content prediction with 87% accuracy. Predict performance before you publish.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendPulse™ - AI Predicts Viral Content (87% Accuracy)",
    description:
      "Know what will go viral BEFORE creating it. Viral Score™ system analyzes 1M+ posts. Save 15+ hours/week. Free tier available.",
    images: ["https://trendpulse.3kpro.services/og-image.png"],
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
