"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, ArrowSquareOut as ExternalLink, CheckCircle as CheckCircle2 } from "@phosphor-icons/react"
import { BouncingDots } from "@/components/ui/bouncing-dots"
import { SocialProvider } from "./ConnectionGrid"

interface AddConnectionModalProps {
  provider: SocialProvider
  onClose: () => void
  onSuccess: () => void
}

interface CapabilityConfig {
  platform: string
  display_name: string
  auth_type: string
  docs_url?: string
  setup_instructions?: string[]
  oauth?: {
    auth_url: string
    token_url: string
    required_scopes: string[]
  }
  requirements?: {
    account_type?: string
    facebook_page?: string
    permissions?: string[]
  }
}

export default function AddConnectionModal({
  provider,
  onClose,
  onSuccess,
}: AddConnectionModalProps) {
  const [step, setStep] = useState<"instructions" | "form" | "oauth">("instructions")
  const [loading, setLoading] = useState(false)
  const [capability, setCapability] = useState<CapabilityConfig | null>(null)

  // Form fields for custom app setup
  const [connectionName, setConnectionName] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadCapability()
  }, [provider.provider_key])

  async function loadCapability() {
    try {
      const response = await fetch(`/libs/capabilities/social/${provider.provider_key}.json`)
      if (response.ok) {
        const data = await response.json()
        setCapability(data)
      }
    } catch (error) {
      console.error("Failed to load capability config:", error)
    }
  }

  async function handleCustomAppSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!connectionName || !clientId || !clientSecret) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/social-connections/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: provider.id,
          connection_name: connectionName,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("✓ Connection saved successfully!\n\nYou can now test the connection.")
        onSuccess()
        onClose()
      } else {
        alert(`✗ Failed to save connection:\n\n${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Configure error:", error)
      alert("Failed to save connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuthStart() {
    setLoading(true)
    try {
      // Redirect to OAuth connect endpoint
      window.location.href = `/api/auth/connect/${provider.provider_key}`
    } catch (error) {
      console.error("OAuth start error:", error)
      setLoading(false)
    }
  }

  function renderInstructions() {
    const instructions = capability?.setup_instructions || []
    const requirements = capability?.requirements

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-tron-cyan/10 border border-tron-cyan/20">
          <div className="mt-0.5">
            <ExternalLink className="w-5 h-5 text-tron-cyan" weight="duotone" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-tron-text">Setup Instructions</h4>
            {instructions.length > 0 ? (
              <ol className="text-sm text-tron-text-muted space-y-2 list-decimal list-inside">
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-tron-text-muted">
                Follow the platform's documentation to set up your app credentials.
              </p>
            )}
          </div>
        </div>

        {requirements && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-400 mb-2">Requirements</h4>
            <ul className="text-sm text-tron-text-muted space-y-1">
              {requirements.account_type && (
                <li>• {requirements.account_type}</li>
              )}
              {requirements.facebook_page && (
                <li>• {requirements.facebook_page}</li>
              )}
              {requirements.permissions && (
                <li>• Permissions: {requirements.permissions.join(", ")}</li>
              )}
            </ul>
          </div>
        )}

        {capability?.docs_url && (
          <a
            href={capability.docs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-tron-cyan hover:underline"
          >
            <ExternalLink className="w-4 h-4" weight="duotone" />
            View Official Documentation
          </a>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text hover:bg-tron-darker/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep(provider.auth_type === "oauth" ? "oauth" : "form")}
            className="px-4 py-2 rounded-lg bg-tron-cyan/20 hover:bg-tron-cyan/30 text-tron-cyan font-medium transition-colors"
          >
            Continue to Setup
          </button>
        </div>
      </div>
    )
  }

  function renderCustomAppForm() {
    return (
      <form onSubmit={handleCustomAppSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-tron-text mb-2">
            Connection Name
          </label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder={`My ${provider.name}`}
            className="w-full px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text placeholder:text-tron-text-muted/50 focus:outline-none focus:border-tron-cyan/40"
            required
          />
          <p className="text-xs text-tron-text-muted mt-1">
            A friendly name to identify this connection
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-tron-text mb-2">
            Client ID (App ID)
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your app's Client ID"
            className="w-full px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text placeholder:text-tron-text-muted/50 focus:outline-none focus:border-tron-cyan/40 font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tron-text mb-2">
            Client Secret (App Secret)
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter your app's Client Secret"
            className="w-full px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text placeholder:text-tron-text-muted/50 focus:outline-none focus:border-tron-cyan/40 font-mono text-sm"
            required
          />
          <p className="text-xs text-tron-text-muted mt-1">
            Your credentials are encrypted before storage
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep("instructions")}
            className="px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text hover:bg-tron-darker/80 transition-colors"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-tron-cyan/20 hover:bg-tron-cyan/30 text-tron-cyan font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <BouncingDots className="bg-current w-1.5 h-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" weight="duotone" />
                <span>Save Connection</span>
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  function renderOAuthFlow() {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-tron-cyan/10 border border-tron-cyan/20">
          <h4 className="font-semibold text-tron-text mb-2">OAuth Authentication</h4>
          <p className="text-sm text-tron-text-muted mb-4">
            You'll be redirected to {provider.name} to authorize XELORA to post on your behalf.
            After authorization, you'll be redirected back to complete the setup.
          </p>
          {capability?.oauth?.required_scopes && (
            <div>
              <p className="text-xs text-tron-text-muted mb-1">Required permissions:</p>
              <ul className="text-xs text-tron-text-muted space-y-0.5">
                {capability.oauth.required_scopes.map((scope) => (
                  <li key={scope}>• {scope}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setStep("instructions")}
            className="px-4 py-2 rounded-lg bg-tron-darker border border-tron-cyan/20 text-tron-text hover:bg-tron-darker/80 transition-colors"
            disabled={loading}
          >
            Back
          </button>
          <button
            onClick={handleOAuthStart}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-tron-cyan/20 hover:bg-tron-cyan/30 text-tron-cyan font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <BouncingDots className="bg-current w-1.5 h-1.5" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" weight="duotone" />
                <span>Continue to {provider.name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tron-dark border border-tron-cyan/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-tron-dark border-b border-tron-cyan/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 flex items-center justify-center">
              <span className="text-xl font-bold text-tron-text">
                {provider.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-tron-text">
                Connect {provider.name}
              </h2>
              <p className="text-sm text-tron-text-muted">
                {provider.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-tron-text-muted hover:text-tron-text transition-colors"
          >
            <X className="w-5 h-5" weight="duotone" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "instructions" && renderInstructions()}
          {step === "form" && renderCustomAppForm()}
          {step === "oauth" && renderOAuthFlow()}
        </div>
      </div>
    </div>
  )
}
