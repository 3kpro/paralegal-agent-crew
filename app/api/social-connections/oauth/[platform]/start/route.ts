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

    // Store state in cookie for validation on callback
    const cookieStore = await cookies()
    cookieStore.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

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

    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("response_type", "code")

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

    // Redirect to platform's OAuth page
    return NextResponse.redirect(authUrl.toString())
  } catch (error: any) {
    console.error("[OAuth Start] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
