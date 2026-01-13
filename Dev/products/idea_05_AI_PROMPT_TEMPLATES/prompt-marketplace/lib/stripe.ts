import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2025-12-15.clover', // Commented out to avoid type conflicts if sdk updates
  typescript: true,
});
