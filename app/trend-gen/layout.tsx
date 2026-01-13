import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trend Discovery | XELORA - Find Rising Trends",
  description:
    "Discover emerging trends before they go viral. XELORA's signal intelligence analyzes real-time data to reveal what's about to rise.",
  openGraph: {
    title: "Trend Discovery | XELORA - Find Rising Trends",
    description:
      "Discover emerging trends before they go viral with XELORA's AI-powered signal intelligence.",
    url: "https://xelora.app/trend-gen",
  },
  alternates: {
    canonical: "https://xelora.app/trend-gen",
  },
};

export default function TrendGenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
