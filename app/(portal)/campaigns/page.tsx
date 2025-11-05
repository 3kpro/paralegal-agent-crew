import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's campaigns (all, including archived for filtering)
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
  }

  return <CampaignsClient campaigns={campaigns || []} />;
}
