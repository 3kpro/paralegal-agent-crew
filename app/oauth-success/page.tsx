"use client"

import { useEffect } from "react"

export default function OAuthSuccessPage() {
  useEffect(() => {
    // Close the popup and refresh parent window
    if (window.opener) {
      // Notify parent window that OAuth succeeded
      window.opener.postMessage({ type: "oauth-success" }, "*")
      // Close the popup after a brief delay to ensure message is received
      setTimeout(() => window.close(), 100)
    } else {
      // If no opener (shouldn't happen), just close
      window.close()
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-tron-darker">
      <div className="text-center">
        <p className="text-tron-text">Authenticating...</p>
      </div>
    </div>
  )
}
