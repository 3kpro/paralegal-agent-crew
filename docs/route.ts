import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/social-connections/list
 *
 * Fetches all social connections for the authenticated user.
 * This endpoint powers the "Connections" tab in the settings UI.
 *
 * It joins with the `social_providers` table to get metadata like
 * the provider's name and logo.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: connections, error: dbError } = await supabase
      .from("user_social_connections")
      .select(
        `
        id,
        connection_name,
        account_username,
        is_active,
        test_status,
        last_tested_at,
        created_at,
        social_providers (
          provider_key,
          name,
          logo_url
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[API/Connections/List] Database Error:", dbError.message);
      throw new Error(dbError.message);
    }

    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error("[API/Connections/List] General Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}