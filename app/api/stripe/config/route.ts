import { NextResponse } from "next/server";
import { STRIPE_PRICES } from "@/lib/stripe";

export async function GET() {
  try {
    // Check if all required environment variables are present
    const config = {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      prices: {
        PRO_MONTHLY: {
          exists: !!process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
          configured: !!STRIPE_PRICES.PRO_MONTHLY,
        },
        PRO_YEARLY: {
          exists: !!process.env.STRIPE_PRO_YEARLY_PRICE_ID,
          configured: !!STRIPE_PRICES.PRO_YEARLY,
        },
        PREMIUM_MONTHLY: {
          exists: !!process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
          configured: !!STRIPE_PRICES.PREMIUM_MONTHLY,
        },
        PREMIUM_YEARLY: {
          exists: !!process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
          configured: !!STRIPE_PRICES.PREMIUM_YEARLY,
        },
      },
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    const allConfigured =
      config.hasStripeSecret &&
      config.hasAppUrl &&
      config.prices.PRO_MONTHLY.configured &&
      config.prices.PRO_YEARLY.configured &&
      config.prices.PREMIUM_MONTHLY.configured &&
      config.prices.PREMIUM_YEARLY.configured;

    return NextResponse.json({
      success: true,
      configured: allConfigured,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
