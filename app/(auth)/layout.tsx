import ErrorBoundary from "@/components/ErrorBoundary";

// Auth Layout - For login, signup pages (no auth required)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
