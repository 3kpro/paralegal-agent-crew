import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { decryptAPIKey } from "@/lib/encryption";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated", authError }, { status: 401 });
    }

    // Check user tools
    const { data: userTools, error: toolsError } = await supabase
      .from("user_ai_tools")
      .select(`
        *,
        ai_providers (
          id,
          provider_key,
          name
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("test_status", "success");

    if (toolsError) {
      return NextResponse.json({ error: "Database error", details: toolsError }, { status: 500 });
    }

    if (!userTools || userTools.length === 0) {
      return NextResponse.json({
        error: "No AI tools configured",
        user_id: user.id,
        tools_found: 0
      }, { status: 400 });
    }

    const selectedTool = userTools[0];
    let decryptedKey = "ERROR";

    try {
      decryptedKey = selectedTool.api_key_encrypted
        ? decryptAPIKey(selected Tool.api_key_encrypted).substring(0, 20) + "..."
        : "NO KEY";
    } catch (err) {
      decryptedKey = "DECRYPTION FAILED: " + String(err);
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      tools_count: userTools.length,
      selected_tool: {
        provider: (selectedTool.ai_providers as any).provider_key,
        is_active: selectedTool.is_active,
        test_status: selectedTool.test_status,
        has_key: !!selectedTool.api_key_encrypted,
        key_preview: decryptedKey,
        usage_count: selectedTool.usage_count
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Server error",
      message: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
