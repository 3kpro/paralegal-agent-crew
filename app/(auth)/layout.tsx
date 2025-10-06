import ErrorBoundary from '@/components/ErrorBoundary'

// Auth Layout - For login, signup pages (no auth required)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Auth Layout Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
