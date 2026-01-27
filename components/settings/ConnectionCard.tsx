"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle as CheckCircle2,
  XCircle,
  Clock,
  Trash as Trash2,
  ArrowsClockwise as RotateCw,
  Flask as TestTube2,
  TwitterLogo,
  LinkedinLogo,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  TiktokLogo,
  RedditLogo,
  Globe,
} from "@phosphor-icons/react"
import { OrbitalLoader } from "@/components/ui/orbital-loader";

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

// Map provider_key to Phosphor brand icon
function getPlatformIcon(providerKey: string) {
  const iconMap: Record<string, React.ElementType> = {
    twitter: TwitterLogo,
    linkedin: LinkedinLogo,
    facebook: FacebookLogo,
    instagram: InstagramLogo,
    youtube: YoutubeLogo,
    tiktok: TiktokLogo,
    reddit: RedditLogo,
  }
  return iconMap[providerKey.toLowerCase()] || Globe
}

// Platform brand colors
function getPlatformColor(providerKey: string) {
  const colorMap: Record<string, string> = {
    twitter: "bg-[#1DA1F2]",
    linkedin: "bg-[#0A66C2]",
    facebook: "bg-[#1877F2]",
    instagram: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    youtube: "bg-[#FF0000]",
    tiktok: "bg-black",
    reddit: "bg-[#FF4500]",
  }
  return colorMap[providerKey.toLowerCase()] || "bg-slate-700"
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
  const PlatformIcon = getPlatformIcon(provider.provider_key)
  const platformColor = getPlatformColor(provider.provider_key)

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
          <Clock className="w-4 h-4" weight="duotone" />
          <span>Not Connected</span>
        </div>
      )
    }

    if (connection.test_status === "success") {
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="w-4 h-4" weight="duotone" />
          <span>Connected</span>
        </div>
      )
    }

    if (connection.test_status === "failed") {
      return (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <XCircle className="w-4 h-4" weight="duotone" />
          <span>Connection Failed</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-sm text-yellow-400">
        <Clock className="w-4 h-4" weight="duotone" />
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
          {/* Platform Brand Icon */}
          <div className={`w-12 h-12 rounded-lg ${platformColor} flex items-center justify-center`}>
            <PlatformIcon className="w-6 h-6 text-white" weight="fill" />
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
                  <OrbitalLoader className="w-5 h-5" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <TestTube2 className="w-4 h-4" weight="duotone" />
                  <span>Test</span>
                </>
              )}
            </button>

            <button
              onClick={onConnect}
              className="flex-1 px-3 py-2 rounded-lg bg-tron-magenta/10 hover:bg-tron-magenta/20 text-tron-magenta text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" weight="duotone" />
              <span>Reconnect</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove connection"
            >
              {deleting ? (
                <OrbitalLoader className="w-5 h-5" />
              ) : (
                <Trash2 className="w-4 h-4" weight="duotone" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
