import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { encryptAPIKey } from "@/lib/encryption"

export async function GET(
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
      return NextResponse.redirect(new URL("/login?error=auth_required", request.url))
    }

    const { platform } = params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get("error_description") || error
      console.error("[OAuth Callback] Platform error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings?tab=connections&error=${encodeURIComponent(errorDescription)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=missing_code_or_state", request.url)
      )
    }

    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value

    if (!storedState || storedState !== state) {
      console.error("[OAuth Callback] State mismatch:", { storedState, receivedState: state })
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=invalid_state", request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete(`oauth_state_${platform}`)

    // Get code verifier for Twitter PKCE
    const codeVerifier = cookieStore.get(`oauth_verifier_${platform}`)?.value
    if (platform === "twitter" && !codeVerifier) {
      console.error("[OAuth Callback] Missing code verifier for Twitter PKCE")
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=missing_code_verifier", request.url)
      )
    }

    // Clear verifier cookie
    if (codeVerifier) {
      cookieStore.delete(`oauth_verifier_${platform}`)
    }

    // Load platform configuration
    const { data: provider, error: providerError } = await supabase
      .from("social_providers")
      .select("*")
      .eq("provider_key", platform)
      .eq("is_active", true)
      .single()

    if (providerError || !provider) {
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=platform_not_found", request.url)
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
      console.error("[OAuth Callback] Failed to load capability:", error)
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=config_not_found", request.url)
      )
    }

    const oauthConfig = capability.oauth
    if (!oauthConfig || !oauthConfig.token_url) {
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=oauth_config_missing", request.url)
      )
    }

    // Exchange authorization code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social-connections/oauth/${platform}/callback`
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`]
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`]

    if (!clientId || !clientSecret) {
      console.error("[OAuth Callback] Missing client credentials for", platform)
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=missing_credentials", request.url)
      )
    }

    // Build token request - use PKCE for Twitter, client_secret for others
    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
    })

    // Twitter uses PKCE (code_verifier), other platforms use client_secret
    if (platform === "twitter" && codeVerifier) {
      tokenRequestBody.append("code_verifier", codeVerifier)
      console.log("[OAuth Callback] Using PKCE for Twitter token exchange")
    } else {
      tokenRequestBody.append("client_secret", clientSecret)
    }

    const tokenResponse = await fetch(oauthConfig.token_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody.toString(),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[OAuth Callback] Token exchange failed:", tokenResponse.status, errorText)
      return NextResponse.redirect(
        new URL(`/settings?tab=connections&error=token_exchange_failed`, request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    // Get user info from platform
    let accountUsername = null
    let accountId = null

    if (oauthConfig.user_info_url) {
      try {
        const userInfoResponse = await fetch(oauthConfig.user_info_url, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json()
          accountUsername = userInfo.username || userInfo.name || userInfo.login
          accountId = userInfo.id || userInfo.sub
        }
      } catch (error) {
        console.error("[OAuth Callback] Failed to fetch user info:", error)
        // Continue anyway, we have the token
      }
    }

    // Encrypt tokens
    const accessTokenEncrypted = encryptAPIKey(tokenData.access_token)
    const refreshTokenEncrypted = tokenData.refresh_token
      ? encryptAPIKey(tokenData.refresh_token)
      : null

    // Calculate token expiration
    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    // Save connection to database
    const connectionName = accountUsername ? `${accountUsername}'s ${provider.name}` : `My ${provider.name}`

    const { data: newConnection, error: insertError } = await supabase
      .from("user_social_connections")
      .insert({
        user_id: user.id,
        provider_id: provider.id,
        connection_name: connectionName,
        account_username: accountUsername,
        account_id: accountId,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expires_at: tokenExpiresAt,
        scopes: tokenData.scope ? tokenData.scope.split(" ") : oauthConfig.required_scopes,
        is_active: true,
        test_status: "success",
        last_tested_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("[OAuth Callback] Failed to save connection:", insertError)
      return NextResponse.redirect(
        new URL("/settings?tab=connections&error=save_failed", request.url)
      )
    }

    // Success - redirect to settings with success message
    return NextResponse.redirect(
      new URL(`/settings?tab=connections&success=connected&platform=${platform}`, request.url)
    )
  } catch (error: any) {
    console.error("[OAuth Callback] Error:", error)
    return NextResponse.redirect(
      new URL(`/settings?tab=connections&error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
