import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { z } from "zod";

// Request validation schema
const checkoutSchema = z.object({
  tier: z.enum(["pro", "premium"], {
    message: 'Tier must be either "pro" or "premium"',
  }),
  billingCycle: z.enum(["monthly", "yearly"], {
    message: 'Billing cycle must be either "monthly" or "yearly"',
  }),
});

export async function POST(request: Request) {
  try {
    console.log("Checkout API called");
    
    // 1. Validate Environment Variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing Stripe Key" }, { status: 500 });
    }
    
    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      console.error("CRITICAL: STRIPE_SECRET_KEY does not start with 'sk_'. Check for quotes or invalid key.");
      return NextResponse.json({ error: "Server configuration error: Invalid Stripe Key format" }, { status: 500 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User authenticated:", user.id);

    // Parse and validate request body
    const body = await request.json();
    console.log("Request body:", body);
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      console.log("Validation failed:", validation.error);
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    const { tier, billingCycle } = validation.data;
    console.log("Validated data:", { tier, billingCycle });

    // Get the correct price ID
    const priceKey =
      `${tier.toUpperCase()}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey];
    console.log("Price key:", priceKey, "Price ID:", priceId);

    if (!priceId) {
      console.log("No price ID found for:", priceKey);
      return NextResponse.json(
        {
          error: "Invalid tier or billing cycle (Price ID not configured)",
        },
        { status: 400 },
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Helper to create new customer
    const createNewCustomer = async () => {
      console.log("Creating new Stripe customer...");
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      // Save customer ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);
        
      return customer.id;
    };

    if (!customerId) {
      customerId = await createNewCustomer();
    }

    // Create checkout session
    console.log("Creating Stripe session with customer:", customerId);
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
        metadata: {
          supabase_user_id: user.id,
          tier: tier,
          billing_cycle: billingCycle,
        },
        allow_promotion_codes: true,
      });
      console.log("Session created:", session.id, "URL:", session.url);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
      
    } catch (stripeError: any) {
      console.error("Stripe session creation failed:", stripeError);
      
      // Handle "No such customer" error (e.g. switching from Test to Live mode)
      if (stripeError.code === 'resource_missing' && stripeError.param === 'customer') {
        console.log("Customer not found in Stripe (likely Test->Live mismatch). Creating new customer...");
        customerId = await createNewCustomer();
        
        // Retry session creation with new customer
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
          metadata: {
            supabase_user_id: user.id,
            tier: tier,
            billing_cycle: billingCycle,
          },
          allow_promotion_codes: true,
        });
        
        return NextResponse.json({
          success: true,
          sessionId: session.id,
          url: session.url,
        });
      }
      
      throw stripeError; // Re-throw if it's not a missing customer error
    }

  } catch (error: any) {
    console.error("Stripe checkout error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      {
        error: error.message || "An unknown error occurred",
        details: error.code || error.type,
      },
      { status: 500 },
    );
  }
}
