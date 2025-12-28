import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptAPIKey } from "@/lib/encryption";

/**
 * TikTok Creator Info API
 * Required by TikTok UX Guidelines Point 1
 * https://developers.tiktok.com/doc/content-sharing-guidelines
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connection_id");

    if (!connectionId) {
      return NextResponse.json(
        { error: "connection_id parameter required" },
        { status: 400 }
      );
    }

    // Get TikTok connection
    const { data: connection, error: connectionError } = await supabase
      .from("user_social_connections")
      .select(`
        id,
        account_username,
        account_id,
        access_token_encrypted,
        metadata,
        social_providers!inner(provider_key)
      `)
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: "TikTok connection not found" },
        { status: 404 }
      );
    }

    if (connection.social_providers.provider_key !== "tiktok") {
      return NextResponse.json(
        { error: "Connection is not a TikTok account" },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = await decryptAPIKey(connection.access_token_encrypted);

    // Call TikTok Creator Info API
    console.log("[TikTok Creator Info] Fetching creator info...");
    const creatorInfoUrl = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";

    const response = await fetch(creatorInfoUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[TikTok Creator Info] API error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch TikTok creator info",
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[TikTok Creator Info] Response:", JSON.stringify(data, null, 2));

    // Return creator info
    return NextResponse.json({
      success: true,
      creator_info: data.data,
      account_username: connection.account_username,
    });

  } catch (error) {
    console.error("[TikTok Creator Info] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
