import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { decryptAPIKey, encryptAPIKey } from "@/lib/encryption"

export async function POST(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { connectionId } = body
    const { platform } = params

    if (!connectionId) {
      return NextResponse.json(
        { error: "Missing connectionId" },
        { status: 400 }
      )
    }

    // Load connection
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
      .eq("user_id", user.id)
      .single()

    if (fetchError || !connection) {
      console.error("[OAuth Refresh] Connection not found:", fetchError)
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      )
    }

    // Verify platform matches
    const connProvider = connection.social_providers as any
    if (connProvider.provider_key !== platform) {
      return NextResponse.json(
        { error: "Platform mismatch" },
        { status: 400 }
      )
    }

    // Verify platform supports token refresh
    if (connProvider.auth_type !== "oauth" && connProvider.auth_type !== "hybrid") {
      return NextResponse.json(
        { error: "This platform does not support OAuth" },
        { status: 400 }
      )
    }

    if (!connection.refresh_token_encrypted) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 400 }
      )
    }

    // Load capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/${platform}.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[OAuth Refresh] Failed to load capability:", error)
      return NextResponse.json(
        { error: "Platform configuration not found" },
        { status: 500 }
      )
    }

    const oauthConfig = capability.oauth
    if (!oauthConfig || !oauthConfig.token_url) {
      return NextResponse.json(
        { error: "OAuth configuration not available" },
        { status: 500 }
      )
    }

    // Decrypt refresh token
    const refreshToken = decryptAPIKey(connection.refresh_token_encrypted)

    // Get client credentials
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`]
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`]

    if (!clientId || !clientSecret) {
      console.error("[OAuth Refresh] Missing client credentials for", platform)
      return NextResponse.json(
        { error: "Missing platform credentials" },
        { status: 500 }
      )
    }

    // Request new access token
    const tokenRequestBody = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const tokenResponse = await fetch(oauthConfig.token_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody.toString(),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[OAuth Refresh] Token refresh failed:", tokenResponse.status, errorText)

      // Mark connection as failed if refresh fails
      await supabase
        .from("user_social_connections")
        .update({
          test_status: "failed",
          test_error: "Token refresh failed - please reconnect",
        })
        .eq("id", connectionId)

      return NextResponse.json(
        { error: "Token refresh failed", requiresReconnect: true },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    // Encrypt new tokens
    const accessTokenEncrypted = encryptAPIKey(tokenData.access_token)
    const newRefreshTokenEncrypted = tokenData.refresh_token
      ? encryptAPIKey(tokenData.refresh_token)
      : connection.refresh_token_encrypted // Keep old refresh token if new one not provided

    // Calculate new expiration
    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    // Update connection with new tokens
    const { error: updateError } = await supabase
      .from("user_social_connections")
      .update({
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: newRefreshTokenEncrypted,
        token_expires_at: tokenExpiresAt,
        test_status: "success",
        test_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId)

    if (updateError) {
      console.error("[OAuth Refresh] Failed to update connection:", updateError)
      return NextResponse.json(
        { error: "Failed to save refreshed token" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Access token refreshed successfully",
      expiresAt: tokenExpiresAt,
    })
  } catch (error: any) {
    console.error("[OAuth Refresh] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
