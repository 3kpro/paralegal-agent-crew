import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <CampaignsClient campaigns={campaigns || []} />;
}
