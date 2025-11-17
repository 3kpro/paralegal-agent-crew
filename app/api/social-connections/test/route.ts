import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { decryptAPIKey } from "@/lib/encryption"

export async function POST(request: Request) {
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

    if (!connectionId) {
      return NextResponse.json(
        { error: "Missing connectionId" },
        { status: 400 }
      )
    }

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
      .eq("user_id", user.id)
      .single()

    if (fetchError || !connection) {
      console.error("[Test] Connection not found:", fetchError)
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      )
    }

    const provider = connection.social_providers as any

    // Load capability config to get test endpoint
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/${provider.provider_key}.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[Test] Failed to load capability:", error)
      return NextResponse.json(
        { error: "Platform configuration not found" },
        { status: 500 }
      )
    }

    // Get test configuration
    const testConfig = capability.testing
    if (!testConfig) {
      return NextResponse.json(
        { error: "Test configuration not available for this platform" },
        { status: 400 }
      )
    }

    // For custom app platforms (Instagram, Facebook), test using access token
    if (provider.auth_type === "custom_app") {
      // For custom app, we need an access token which is obtained via OAuth
      // For now, we'll verify that credentials are present
      if (!connection.client_id_encrypted || !connection.client_secret_encrypted) {
        await supabase
          .from("user_social_connections")
          .update({
            test_status: "failed",
            test_error: "Missing credentials",
            last_tested_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: false,
          message: "Missing credentials. Please reconfigure the connection.",
        })
      }

      // Decrypt credentials to verify they're valid
      try {
        const clientId = decryptAPIKey(connection.client_id_encrypted)
        const clientSecret = decryptAPIKey(connection.client_secret_encrypted)

        // Basic validation
        if (!clientId || !clientSecret) {
          throw new Error("Invalid credentials")
        }

        // For Instagram, we can't test without an access token
        // Mark as pending and provide instructions
        await supabase
          .from("user_social_connections")
          .update({
            test_status: "pending",
            test_error: null,
            last_tested_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: true,
          message: `Credentials saved. To complete setup, you need to obtain an access token using the Instagram OAuth flow.`,
        })
      } catch (decryptError) {
        console.error("[Test] Decryption failed:", decryptError)
        await supabase
          .from("user_social_connections")
          .update({
            test_status: "failed",
            test_error: "Invalid credentials",
            last_tested_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: false,
          message: "Failed to decrypt credentials. Please reconfigure the connection.",
        })
      }
    }

    // For OAuth platforms, test using access token
    if (provider.auth_type === "oauth") {
      if (!connection.access_token_encrypted) {
        await supabase
          .from("user_social_connections")
          .update({
            test_status: "failed",
            test_error: "No access token",
            last_tested_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: false,
          message: "No access token found. Please reconnect your account.",
        })
      }

      try {
        const accessToken = decryptAPIKey(connection.access_token_encrypted)

        // Build test request
        const testUrl = new URL(testConfig.test_endpoint)
        if (testConfig.test_params) {
          Object.entries(testConfig.test_params).forEach(([key, value]) => {
            testUrl.searchParams.append(key, String(value))
          })
        }

        const testResponse = await fetch(testUrl.toString(), {
          method: testConfig.test_method || "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (testResponse.ok) {
          const testData = await testResponse.json()

          // Update connection with success
          await supabase
            .from("user_social_connections")
            .update({
              test_status: "success",
              test_error: null,
              last_tested_at: new Date().toISOString(),
              account_username: testData.username || testData.name || connection.account_username,
              account_id: testData.id || connection.account_id,
            })
            .eq("id", connectionId)

          return NextResponse.json({
            success: true,
            message: `Connected successfully as ${testData.username || testData.name || "user"}`,
          })
        } else {
          const errorText = await testResponse.text()
          console.error("[Test] API test failed:", testResponse.status, errorText)

          await supabase
            .from("user_social_connections")
            .update({
              test_status: "failed",
              test_error: `API error: ${testResponse.status}`,
              last_tested_at: new Date().toISOString(),
            })
            .eq("id", connectionId)

          return NextResponse.json({
            success: false,
            message: `Connection test failed: ${testResponse.status} ${testResponse.statusText}`,
          })
        }
      } catch (error: any) {
        console.error("[Test] OAuth test error:", error)
        await supabase
          .from("user_social_connections")
          .update({
            test_status: "failed",
            test_error: error.message,
            last_tested_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: false,
          message: `Test failed: ${error.message}`,
        })
      }
    }

    return NextResponse.json(
      { error: "Unknown auth type" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("[Test] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
