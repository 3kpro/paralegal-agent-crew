import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo | XELORA - See Predictive Intelligence in Action",
  description:
    "Watch XELORA's AI-powered trend prediction and content generation in action. See how we analyze signals to predict viral momentum.",
  openGraph: {
    title: "Demo | XELORA - See Predictive Intelligence in Action",
    description:
      "Watch XELORA's AI-powered trend prediction and content generation in action.",
    url: "https://xelora.app/demo",
  },
  alternates: {
    canonical: "https://xelora.app/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
