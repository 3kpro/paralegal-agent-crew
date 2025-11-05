import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/campaigns/[id]
 * Archive or restore a campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["archive", "restore"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'archive' or 'restore'" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Update campaign archived status
    const archived = action === "archive";
    const { error } = await supabase
      .from("campaigns")
      .update({ archived })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(`[Campaign ${action}] Error:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Campaign ${archived ? "archived" : "restored"} successfully`,
      archived,
    });
  } catch (error: any) {
    console.error("[Campaign PATCH] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Delete campaign (cascade will delete related campaign_content)
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Campaign Delete] Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error: any) {
    console.error("[Campaign Delete] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
