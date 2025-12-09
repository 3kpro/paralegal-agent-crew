"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import ConnectionGrid from "./ConnectionGrid"
import AddConnectionModal from "./AddConnectionModal"

interface SocialProvider {
  id: string
  provider_key: string
  name: string
  description: string
  logo_url: string | null
  auth_type: string
  required_tier: string
  is_active: boolean
}

interface UserConnection {
  id: string
  provider_id: string
  connection_name: string
  account_username: string | null
  is_active: boolean
  test_status: "pending" | "success" | "failed"
  usage_count: number
  created_at: string
}

export default function ConnectionsTab() {
  const [providers, setProviders] = useState<SocialProvider[]>([])
  const [connections, setConnections] = useState<UserConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<SocialProvider | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Load available providers
      const { data: providersData, error: providersError } = await supabase
        .from("social_providers")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (providersError) throw providersError

      // Load user's connections
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: connectionsData, error: connectionsError } = await supabase
        .from("user_social_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (connectionsError) throw connectionsError

      setProviders(providersData || [])
      setConnections(connectionsData || [])
    } catch (err: any) {
      console.error("Error loading connections data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddConnection(provider: SocialProvider) {
    setSelectedProvider(provider)
    setShowAddModal(true)
  }

  function handleCloseModal() {
    setShowAddModal(false)
    setSelectedProvider(null)
  }

  async function handleConnectionAdded() {
    setShowAddModal(false)
    setSelectedProvider(null)
    await loadData() // Refresh connections list
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-tron-cyan" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-500">Error Loading Connections</h3>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-tron-text">Social Connections</h2>
        <p className="text-tron-text-muted mt-2">
          Connect your social media accounts to publish content directly from XELORA.
        </p>
      </div>

      {/* Active Connections Summary */}
      {connections.length > 0 && (
        <div className="rounded-lg border border-tron-cyan/20 bg-tron-darker/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tron-text-muted">Active Connections</p>
              <p className="text-2xl font-bold text-tron-cyan">{connections.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tron-text-muted">Total Posts Published</p>
              <p className="text-2xl font-bold text-tron-magenta">
                {connections.reduce((sum, conn) => sum + conn.usage_count, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Grid */}
      <ConnectionGrid
        providers={providers}
        connections={connections}
        onAddConnection={handleAddConnection}
        onRefresh={loadData}
      />

      {/* Add Connection Modal */}
      {showAddModal && selectedProvider && (
        <AddConnectionModal
          provider={selectedProvider}
          onClose={handleCloseModal}
          onSuccess={handleConnectionAdded}
        />
      )}

      {/* Help Text */}
      <div className="rounded-lg border border-tron-cyan/10 bg-tron-darker/30 p-4">
        <h3 className="font-semibold text-tron-text mb-2">Getting Started</h3>
        <ul className="space-y-2 text-sm text-tron-text-muted">
          <li className="flex items-start gap-2">
            <span className="text-tron-cyan mt-0.5">•</span>
            <span>Click "Connect" on a platform to begin the setup process</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tron-cyan mt-0.5">•</span>
            <span>Some platforms require creating a custom app (Instagram, Facebook)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tron-cyan mt-0.5">•</span>
            <span>Test your connection after setup to verify it works</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tron-cyan mt-0.5">•</span>
            <span>You can connect multiple accounts for the same platform</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
