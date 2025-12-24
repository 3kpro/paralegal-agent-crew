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
      const errorMessage = detailsParam || errorParam
      setError(errorMessage)

      // Log error to console for debugging
      console.error("OAuth Error:", { error: errorParam, details: detailsParam })

      // Notify parent window of error
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage({ type: "oauth-error", error: errorMessage }, "*")
        }
        window.close()
      }, 5000) // Give user more time to read error (5 seconds)
    } else {
      // Success - close popup and refresh parent window
      console.log("OAuth Success - preparing to close popup")
      if (window.opener) {
        // Notify parent window that OAuth succeeded
        window.opener.postMessage({ type: "oauth-success" }, "*")
        // Close popup after a brief delay to ensure message is received
        setTimeout(() => window.close(), 500)
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
          <p className="text-tron-text-muted text-sm mb-4">{error}</p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-400 font-semibold mb-1">Troubleshooting Tips:</p>
            <ul className="text-left text-xs text-red-300 space-y-1">
              <li>• Verify redirect URI matches in TikTok app settings</li>
              <li>• Check your app is in &quot;Live&quot; mode</li>
              <li>• Ensure Client Key and Secret are correct</li>
              <li>• Try connecting again in a few moments</li>
            </ul>
          </div>
          <p className="text-tron-text-muted text-xs mt-4">This window will close automatically in 5 seconds...</p>
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
