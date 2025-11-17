/**
 * OAuth Token Manager
 * Handles automatic token refresh for social connections
 */

import { createClient } from "@/lib/supabase/server"
import { decryptAPIKey } from "@/lib/encryption"

interface TokenInfo {
  accessToken: string
  connectionId: string
  platform: string
  expiresAt: string | null
}

/**
 * Gets a valid access token for a connection, refreshing if necessary
 */
export async function getValidAccessToken(connectionId: string): Promise<TokenInfo> {
  const supabase = await createClient()

  // Load connection with provider info
  const { data: connection, error: fetchError } = await supabase
    .from("user_social_connections")
    .select(`
      *,
      social_providers (
        provider_key,
        name,
        auth_type
      )
    `)
    .eq("id", connectionId)
    .single()

  if (fetchError || !connection) {
    throw new Error("Connection not found")
  }

  const provider = connection.social_providers as any

  // Decrypt access token
  if (!connection.access_token_encrypted) {
    throw new Error("No access token available")
  }

  const accessToken = decryptAPIKey(connection.access_token_encrypted)

  // Check if token is expired or will expire soon (5 minutes buffer)
  const now = new Date()
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null
  const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds

  if (expiresAt && expiresAt.getTime() - now.getTime() < bufferTime) {
    // Token expired or expiring soon, refresh it
    if (connection.refresh_token_encrypted) {
      console.log(`[Token Manager] Refreshing token for connection ${connectionId}`)

      try {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/social-connections/oauth/${provider.provider_key}/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId }),
          }
        )

        if (!refreshResponse.ok) {
          throw new Error("Token refresh failed")
        }

        const refreshData = await refreshResponse.json()

        // Reload connection to get new token
        const { data: refreshedConnection } = await supabase
          .from("user_social_connections")
          .select("access_token_encrypted, token_expires_at")
          .eq("id", connectionId)
          .single()

        if (refreshedConnection && refreshedConnection.access_token_encrypted) {
          return {
            accessToken: decryptAPIKey(refreshedConnection.access_token_encrypted),
            connectionId,
            platform: provider.provider_key,
            expiresAt: refreshData.expiresAt,
          }
        }
      } catch (error) {
        console.error("[Token Manager] Token refresh failed:", error)
        throw new Error("Failed to refresh expired token")
      }
    } else {
      throw new Error("Token expired and no refresh token available")
    }
  }

  // Token is still valid
  return {
    accessToken,
    connectionId,
    platform: provider.provider_key,
    expiresAt: connection.token_expires_at,
  }
}

/**
 * Validates that a connection is active and ready for publishing
 */
export async function validateConnection(connectionId: string): Promise<void> {
  const supabase = await createClient()

  const { data: connection, error } = await supabase
    .from("user_social_connections")
    .select("is_active, test_status")
    .eq("id", connectionId)
    .single()

  if (error || !connection) {
    throw new Error("Connection not found")
  }

  if (!connection.is_active) {
    throw new Error("Connection is inactive")
  }

  if (connection.test_status === "failed") {
    throw new Error("Connection test failed - please reconnect")
  }
}

/**
 * Increments usage counter for a connection
 */
export async function incrementUsage(connectionId: string): Promise<void> {
  const supabase = await createClient()

  await supabase.rpc("increment_connection_usage", {
    p_connection_id: connectionId,
  })
}
