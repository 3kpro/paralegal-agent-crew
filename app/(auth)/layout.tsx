import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BGPattern } from "@/components/ui/bg-pattern";

// Tell Google: crawl these pages but don't list them in search results
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

// Auth Layout - For login, signup pages (dark theme)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.05)"
        className="z-0 fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
