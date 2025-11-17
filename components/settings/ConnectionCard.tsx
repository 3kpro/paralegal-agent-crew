"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RotateCw,
  TestTube2,
  Loader2,
} from "lucide-react"

interface SocialProvider {
  id: string
  provider_key: string
  name: string
  description: string
  logo_url: string | null
  auth_type: string
  required_tier: string
}

interface UserConnection {
  id: string
  provider_id: string
  connection_name: string
  account_username: string | null
  is_active: boolean
  test_status: "pending" | "success" | "failed"
  usage_count: number
}

interface ConnectionCardProps {
  provider: SocialProvider
  connection?: UserConnection
  onConnect: () => void
  onRefresh: () => Promise<void>
}

export default function ConnectionCard({
  provider,
  connection,
  onConnect,
  onRefresh,
}: ConnectionCardProps) {
  const [testing, setTesting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()
  const isConnected = !!connection

  async function handleTest() {
    if (!connection) return

    setTesting(true)
    try {
      const response = await fetch("/api/social-connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connection.id }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✓ Connection test successful!\n\nAccount: ${connection.account_username || "Connected"}`)
      } else {
        alert(`✗ Connection test failed:\n\n${data.message || "Unknown error"}`)
      }

      await onRefresh()
    } catch (error) {
      console.error("Test error:", error)
      alert("Failed to test connection. Please try again.")
    } finally {
      setTesting(false)
    }
  }

  async function handleDelete() {
    if (!connection) return

    if (!confirm(`Remove connection "${connection.connection_name}"?\n\nThis cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from("user_social_connections")
        .delete()
        .eq("id", connection.id)

      if (error) throw error

      await onRefresh()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to remove connection. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  function getStatusBadge() {
    if (!connection) {
      return (
        <div className="flex items-center gap-2 text-sm text-tron-text-muted">
          <Clock className="w-4 h-4" />
          <span>Not Connected</span>
        </div>
      )
    }

    if (connection.test_status === "success") {
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Connected</span>
        </div>
      )
    }

    if (connection.test_status === "failed") {
      return (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <XCircle className="w-4 h-4" />
          <span>Connection Failed</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-sm text-yellow-400">
        <Clock className="w-4 h-4" />
        <span>Pending Test</span>
      </div>
    )
  }

  function getTierBadge() {
    if (provider.required_tier === "free") return null

    const tierColors = {
      pro: "bg-tron-cyan/20 text-tron-cyan border-tron-cyan/30",
      premium: "bg-tron-magenta/20 text-tron-magenta border-tron-magenta/30",
    }

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
          tierColors[provider.required_tier as keyof typeof tierColors]
        }`}
      >
        {provider.required_tier.toUpperCase()} ONLY
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-tron-cyan/20 bg-tron-darker/50 p-4 hover:border-tron-cyan/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Platform Icon Placeholder */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-tron-text">
              {provider.name.charAt(0)}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-tron-text">{provider.name}</h3>
            {getTierBadge()}
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="text-sm text-tron-text-muted mb-4 line-clamp-2">
        {provider.description}
      </p>

      {/* Connection Details */}
      {connection && (
        <div className="mb-4 space-y-1">
          <div className="text-sm">
            <span className="text-tron-text-muted">Name: </span>
            <span className="text-tron-text font-medium">{connection.connection_name}</span>
          </div>
          {connection.account_username && (
            <div className="text-sm">
              <span className="text-tron-text-muted">Account: </span>
              <span className="text-tron-text font-medium">@{connection.account_username}</span>
            </div>
          )}
          <div className="text-sm">
            <span className="text-tron-text-muted">Posts Published: </span>
            <span className="text-tron-cyan font-medium">{connection.usage_count}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="flex-1 px-4 py-2 rounded-lg bg-tron-cyan/20 hover:bg-tron-cyan/30 text-tron-cyan font-medium transition-colors"
          >
            Connect
          </button>
        ) : (
          <>
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 px-3 py-2 rounded-lg bg-tron-cyan/10 hover:bg-tron-cyan/20 text-tron-cyan text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <TestTube2 className="w-4 h-4" />
                  <span>Test</span>
                </>
              )}
            </button>

            <button
              onClick={onConnect}
              className="flex-1 px-3 py-2 rounded-lg bg-tron-magenta/10 hover:bg-tron-magenta/20 text-tron-magenta text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reconnect</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove connection"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
