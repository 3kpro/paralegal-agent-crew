import Stripe from 'stripe';

// Initialize Stripe only if API key is provided
// In dev mode with ?dev=true, Stripe is bypassed anyway
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2025-12-15.clover', // Commented out to avoid type conflicts if sdk updates
      typescript: true,
    })
  : null;
