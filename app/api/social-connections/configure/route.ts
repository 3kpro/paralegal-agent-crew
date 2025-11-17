import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { encryptAPIKey } from "@/lib/encryption"

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
    const { provider_id, connection_name, client_id, client_secret } = body

    // Validate required fields
    if (!provider_id || !connection_name || !client_id || !client_secret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Encrypt credentials
    const clientIdEncrypted = encryptAPIKey(client_id)
    const clientSecretEncrypted = encryptAPIKey(client_secret)

    // Check if connection with same name already exists
    const { data: existing } = await supabase
      .from("user_social_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", provider_id)
      .eq("connection_name", connection_name)
      .single()

    if (existing) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from("user_social_connections")
        .update({
          client_id_encrypted: clientIdEncrypted,
          client_secret_encrypted: clientSecretEncrypted,
          is_active: true,
          test_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[Configure] Update error:", updateError)
        return NextResponse.json(
          { error: "Failed to update connection" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        connectionId: existing.id,
        message: "Connection updated successfully",
      })
    } else {
      // Create new connection
      const { data: newConnection, error: insertError } = await supabase
        .from("user_social_connections")
        .insert({
          user_id: user.id,
          provider_id,
          connection_name,
          client_id_encrypted: clientIdEncrypted,
          client_secret_encrypted: clientSecretEncrypted,
          is_active: true,
          test_status: "pending",
        })
        .select()
        .single()

      if (insertError) {
        console.error("[Configure] Insert error:", insertError)
        return NextResponse.json(
          { error: "Failed to create connection" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        connectionId: newConnection.id,
        message: "Connection created successfully",
      })
    }
  } catch (error: any) {
    console.error("[Configure] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
