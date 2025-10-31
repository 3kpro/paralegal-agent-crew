import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "No active subscription found",
        },
        { status: 400 },
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=membership`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
