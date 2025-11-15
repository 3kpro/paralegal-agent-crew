import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

// Product price IDs from Stripe
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
};

// Tier limits configuration - TrendPulse Launch (Social platforms coming soon)
export const TIER_LIMITS = {
  free: {
    campaignsPerMonth: 5,
    aiTools: 1, // Gemini for Viral Score™
    trendSearches: 10, // TrendPulse searches per day
    storageGB: 0.1, // 100MB
  },
  pro: {
    campaignsPerMonth: 999999,
    aiTools: 3,
    trendSearches: 999, // Unlimited
    storageGB: 10,
  },
  premium: {
    campaignsPerMonth: 999999,
    aiTools: 999,
    trendSearches: 999, // Unlimited
    storageGB: 100,
  },
};
