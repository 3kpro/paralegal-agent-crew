"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function OAuthSuccessContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for errors in URL params
    const errorParam = searchParams.get("error")
    const detailsParam = searchParams.get("details")

    if (errorParam) {
      // Show error to user
      setError(detailsParam || errorParam)
      // Auto-close after 3 seconds
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage({ type: "oauth-error", error: errorParam }, "*")
        }
        window.close()
      }, 3000)
    } else {
      // Success - close the popup and refresh parent window
      if (window.opener) {
        // Notify parent window that OAuth succeeded
        window.opener.postMessage({ type: "oauth-success" }, "*")
        // Close the popup after a brief delay to ensure message is received
        setTimeout(() => window.close(), 100)
      } else {
        // If no opener (shouldn't happen), just close
        window.close()
      }
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tron-darker p-8">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-tron-text mb-2">Connection Failed</h1>
          <p className="text-tron-text-muted text-sm">{error}</p>
          <p className="text-tron-text-muted text-xs mt-4">This window will close automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-tron-darker">
      <div className="text-center">
        <p className="text-tron-text">Authenticating...</p>
      </div>
    </div>
  )
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-tron-darker">
        <div className="text-center">
          <p className="text-tron-text">Loading...</p>
        </div>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  )
}
