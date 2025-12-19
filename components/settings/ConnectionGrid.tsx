"use client"

import ConnectionCard from "./ConnectionCard"

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

interface ConnectionGridProps {
  providers: SocialProvider[]
  connections: UserConnection[]
  onAddConnection: (provider: SocialProvider) => void
  onRefresh: () => Promise<void>
}

export default function ConnectionGrid({
  providers,
  connections,
  onAddConnection,
  onRefresh,
}: ConnectionGridProps) {
  // Helper function to find user's connection for a provider
  function getUserConnection(providerId: string) {
    return connections.find((conn) => conn.provider_id === providerId)
  }

  // Handle connection - OAuth platforms redirect directly, custom apps show modal
  function handleConnect(provider: SocialProvider) {
    if (provider.auth_type === 'oauth') {
      // Direct redirect to OAuth flow - no modal, no friction
      window.location.href = `/api/auth/connect/${provider.provider_key}`
    } else {
      // Custom app setup - show modal with instructions
      onAddConnection(provider)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map((provider) => {
        const userConnection = getUserConnection(provider.id)

        return (
          <ConnectionCard
            key={provider.id}
            provider={provider}
            connection={userConnection}
            onConnect={() => handleConnect(provider)}
            onRefresh={onRefresh}
          />
        )
      })}
    </div>
  )
}
