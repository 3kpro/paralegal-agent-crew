import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Predict Your Viral Post in 60 Seconds | XELORA",
  description:
    "Enter any topic and get an AI-powered viral prediction score with content generated for Twitter, LinkedIn, and more. Free, no signup required.",
  keywords:
    "predict viral post, viral score, content prediction, AI content generator, viral potential analyzer, social media AI tool",
  openGraph: {
    title: "Predict Your Viral Post in 60 Seconds",
    description:
      "AI-powered viral prediction + content generation. Free, no signup.",
    url: "https://getxelora.com/try",
    type: "website",
  },
};

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return <div className="dark">{children}</div>;
}
