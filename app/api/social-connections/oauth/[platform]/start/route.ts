import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { platform } = params

    // Load platform configuration
    const { data: provider, error: providerError } = await supabase
      .from("social_providers")
      .select("*")
      .eq("provider_key", platform)
      .eq("is_active", true)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      )
    }

    // Verify platform supports OAuth
    if (provider.auth_type !== "oauth" && provider.auth_type !== "hybrid") {
      return NextResponse.json(
        { error: "This platform does not support OAuth flow" },
        { status: 400 }
      )
    }

    // Load capability config to get OAuth URLs
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/${platform}.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[OAuth Start] Failed to load capability:", error)
      return NextResponse.json(
        { error: "Platform configuration not found" },
        { status: 500 }
      )
    }

    const oauthConfig = capability.oauth
    if (!oauthConfig || !oauthConfig.auth_url) {
      return NextResponse.json(
        { error: "OAuth configuration not available" },
        { status: 500 }
      )
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID()

    // Generate PKCE parameters for Twitter (required for OAuth 2.0)
    let codeVerifier: string | null = null
    let codeChallenge: string | null = null

    if (platform === "twitter") {
      // Generate code verifier (random string)
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      codeVerifier = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

      // Generate code challenge (SHA-256 hash of verifier, base64url encoded)
      const encoder = new TextEncoder()
      const data = encoder.encode(codeVerifier)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      codeChallenge = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      console.log('[OAuth Start] PKCE generated for Twitter')
    }

    // Store state in cookie for validation on callback
    const cookieStore = await cookies()
    cookieStore.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

    // Store code verifier for Twitter PKCE
    if (codeVerifier) {
      cookieStore.set(`oauth_verifier_${platform}`, codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      })
      console.log('[OAuth Start] Code verifier stored in cookie')
    }

    // Build OAuth authorization URL
    const authUrl = new URL(oauthConfig.auth_url)

    // Get redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social-connections/oauth/${platform}/callback`

    // Get client ID and trim whitespace
    const clientId = (process.env[`${platform.toUpperCase()}_CLIENT_ID`] || "").trim()

    if (!clientId) {
      console.error(`[OAuth Start] Missing ${platform.toUpperCase()}_CLIENT_ID environment variable`)
      return NextResponse.json(
        { error: `OAuth not configured for ${platform}` },
        { status: 500 }
      )
    }

    // Log OAuth configuration for debugging
    console.log(`[OAuth Start] Platform: ${platform}`)
    console.log(`[OAuth Start] Client ID length: ${clientId.length}`)
    console.log(`[OAuth Start] Client ID first 10 chars: ${clientId.substring(0, 10)}...`)
    console.log(`[OAuth Start] Redirect URI: ${redirectUri}`)
    console.log(`[OAuth Start] Auth URL: ${oauthConfig.auth_url}`)

    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("response_type", "code")

    // Add PKCE challenge for Twitter
    if (codeChallenge) {
      authUrl.searchParams.append("code_challenge", codeChallenge)
      authUrl.searchParams.append("code_challenge_method", "S256")
      console.log('[OAuth Start] Added PKCE challenge to auth URL')
    }

    // Add scopes
    if (oauthConfig.required_scopes && oauthConfig.required_scopes.length > 0) {
      authUrl.searchParams.append("scope", oauthConfig.required_scopes.join(" "))
    }

    // Platform-specific parameters
    if (platform === "instagram" || platform === "facebook") {
      // Facebook/Instagram uses 'scope' parameter
      // Already added above
    } else if (platform === "tiktok") {
      // TikTok may need additional params
      authUrl.searchParams.append("response_type", "code")
    } else if (platform === "youtube") {
      // YouTube (Google OAuth)
      authUrl.searchParams.append("access_type", "offline")
      authUrl.searchParams.append("prompt", "consent")
    }

    // Log final OAuth URL
    const finalOAuthUrl = authUrl.toString()
    console.log(`[OAuth Start] Final OAuth URL: ${finalOAuthUrl}`)
    console.log(`[OAuth Start] OAuth URL length: ${finalOAuthUrl.length}`)

    // Redirect to platform's OAuth page
    return NextResponse.redirect(finalOAuthUrl)
  } catch (error: any) {
    console.error("[OAuth Start] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
