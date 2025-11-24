import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    console.log(`[social-accounts] Fetching connections for user ${user.id}`);

    // Get user's social connections from the new user_social_connections table
    const { data: connections, error } = await supabase
      .from("user_social_connections")
      .select(`
        id,
        connection_name,
        account_username,
        account_id,
        is_active,
        test_status,
        created_at,
        social_providers!inner(
          provider_key,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch social connections:", error);
      return NextResponse.json(
        { error: "Failed to fetch social connections" },
        { status: 500 },
      );
    }

    console.log(`[social-accounts] Found ${connections?.length || 0} connections`);

    // Transform to match the expected SocialAccount interface
    const accounts = connections?.map((conn) => ({
      id: conn.id,
      platform: conn.social_providers.provider_key,
      account_name: conn.connection_name,
      account_handle: conn.account_username,
      is_active: conn.is_active,
      is_verified: conn.test_status === "success",
      created_at: conn.created_at,
    })) || [];

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      platform,
      account_name,
      account_handle,
      account_id,
      access_token,
      refresh_token,
      token_expires_at,
      account_metadata,
    } = body;

    if (!platform || !account_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("account_id", account_id || account_handle)
      .single();

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account already connected" },
        { status: 409 },
      );
    }

    // Create new social account
    const { data: newAccount, error } = await supabase
      .from("social_accounts")
      .insert({
        user_id: user.id,
        platform,
        account_name,
        account_handle,
        account_id: account_id || account_handle,
        access_token,
        refresh_token,
        token_expires_at,
        account_metadata: account_metadata || {},
        is_active: true,
        is_verified: true, // Set to true for demo, implement actual verification
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create social account:", error);
      return NextResponse.json(
        { error: "Failed to create social account" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { account_id, updates } = body;

    if (!account_id || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update social account
    const { data: updatedAccount, error } = await supabase
      .from("social_accounts")
      .update(updates)
      .eq("id", account_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update social account:", error);
      return NextResponse.json(
        { error: "Failed to update social account" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, account: updatedAccount });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const account_id = searchParams.get("account_id");

    if (!account_id) {
      return NextResponse.json(
        { error: "Missing account_id parameter" },
        { status: 400 },
      );
    }

    // Delete social account
    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("id", account_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete social account:", error);
      return NextResponse.json(
        { error: "Failed to delete social account" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
