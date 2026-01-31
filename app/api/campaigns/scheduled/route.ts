import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    // Fetch campaigns that have scheduled status or scheduled content
    // We join with campaign_content to get the scheduled items
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        campaign_content (
          id,
          platform,
          scheduled_at,
          status
        )
      `)
      .eq("user_id", user.id)
      .neq("status", "draft") // Get everything not draft, or specifically 'scheduled'
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching scheduled campaigns:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // Filter campaigns to only those that have scheduled content or are scheduled
    const scheduledCampaigns = campaigns?.filter(c => 
      c.status === 'scheduled' || 
      c.campaign_content?.some((content: any) => content.scheduled_at && content.status === 'scheduled')
    ) || [];

    return NextResponse.json({ success: true, campaigns: scheduledCampaigns });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
