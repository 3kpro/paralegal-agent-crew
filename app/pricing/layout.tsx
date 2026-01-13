import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | XELORA - Choose Your Plan",
  description:
    "XELORA pricing plans for creators and brands. Start with Free tier, upgrade to Pro or Premium for advanced features.",
  openGraph: {
    title: "Pricing | XELORA",
    description: "Choose the perfect plan for your content creation needs.",
    url: "https://xelora.app/pricing",
  },
  alternates: {
    canonical: "https://xelora.app/pricing",
  },
  robots: {
    index: false, // Requires authentication, so don't index
    follow: true,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
