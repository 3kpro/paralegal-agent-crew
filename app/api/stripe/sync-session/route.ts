import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  console.log("=".repeat(60));
  console.log("[sync-session] API CALLED - Starting sync...");
  console.log("[sync-session] Stripe key prefix:", process.env.STRIPE_SECRET_KEY?.substring(0, 10) + "...");
  console.log("=".repeat(60));

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log("[sync-session] Auth error:", authError.message);
    }

    if (!user) {
      console.log("[sync-session] No authenticated user");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    console.log("[sync-session] User authenticated:", user.id, user.email);

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.log("[sync-session] Failed to parse request body:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { sessionId } = body;
    console.log("[sync-session] Session ID from request:", sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });
      console.log("[sync-session] Stripe session retrieved:", session.id, "metadata:", session.metadata);
    } catch (stripeError: any) {
      console.error("[sync-session] Stripe retrieve error:", stripeError.message);
      return NextResponse.json(
        { success: false, error: `Stripe error: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Verify the session belongs to this user
    console.log("[sync-session] Comparing user IDs - session:", session.metadata?.supabase_user_id, "auth:", user.id);
    if (session.metadata?.supabase_user_id !== user.id) {
      console.log("[sync-session] User ID mismatch!");
      return NextResponse.json(
        { success: false, error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    // Extract subscription details
    const tier = session.metadata.tier as "pro" | "premium";
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    // Update user profile in Supabase
    // NOTE: Only include columns that exist in the profiles table
    const updatePayload: Record<string, any> = {
      subscription_tier: tier,
      subscription_status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      ai_tools_limit: tier === "pro" ? 3 : 999,
    };
    console.log("[sync-session] Updating profile for user:", user.id);
    console.log("[sync-session] Update payload:", JSON.stringify(updatePayload, null, 2));

    // First, check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, subscription_tier, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("[sync-session] Error fetching existing profile:", fetchError);
    } else {
      console.log("[sync-session] Existing profile:", existingProfile);
    }

    const { error: updateError, data: updateData } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select();

    if (updateError) {
      console.error("[sync-session] Profile update error:", updateError);
      console.error("[sync-session] Error details:", JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { success: false, error: `Profile update failed: ${updateError.message}`, details: updateError },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      console.error("[sync-session] Profile update returned no data - possible RLS issue");
      return NextResponse.json(
        { success: false, error: "Profile update returned no data. Check RLS policies." },
        { status: 500 }
      );
    }

    console.log("[sync-session] SUCCESS! Profile updated:", updateData);
    return NextResponse.json({
      success: true,
      tier,
      message: "Subscription synced successfully",
      profile: updateData[0],
    });

  } catch (error) {
    console.error("Error syncing Stripe session:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
