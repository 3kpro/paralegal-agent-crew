# Stripe Payment Setup Guide

To start accepting payments with TrendPulse, you need to configure your Stripe account and add the API keys to Vercel.

## 1. Get Your Stripe API Keys

1.  Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Make sure you are in **Test Mode** (toggle in the top right) for initial testing.
3.  Go to **Developers > API keys**.
4.  Copy the **Publishable key** (starts with `pk_test_...` or `pk_live_...`).
5.  Copy the **Secret key** (starts with `sk_test_...` or `sk_live_...`).

## 2. Create Products & Prices

You need to create the products in Stripe that match your application's tiers.

1.  Go to **Products > Add Product**.
2.  **Pro Plan**:
    *   Name: `TrendPulse Pro`
    *   Price: `$29.00` / month
    *   Copy the **Price ID** (starts with `price_...`).
3.  **Premium Plan**:
    *   Name: `TrendPulse Premium`
    *   Price: `$79.00` / month
    *   Copy the **Price ID** (starts with `price_...`).
4.  (Optional) Create Yearly prices if you plan to offer them.

## 3. Configure Environment Variables

Add these variables to your `.env.local` file (for local development) and Vercel project settings (for production).

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (See Step 4)

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=https://your-domain.com (or http://localhost:3000 for local)
```

## 4. Set Up Webhooks

Webhooks allow Stripe to notify your app when a payment is successful.

### For Local Development:
1.  Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Login: `stripe login`
3.  Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4.  Copy the **Webhook Signing Secret** (`whsec_...`) from the CLI output to your `.env.local`.

### For Production (Vercel):
1.  Go to **Developers > Webhooks** in Stripe Dashboard.
2.  Click **Add endpoint**.
3.  Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4.  Select events to listen for:
    *   `checkout.session.completed`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
    *   `invoice.payment_failed`
5.  Click **Add endpoint**.
6.  Reveal the **Signing secret** and add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`.

## 5. Enable Checkout in Code

The code is currently set to "Waitlist Mode". To enable payments:

1.  Open `app/(portal)/settings/page.tsx`.
2.  Locate the `handleUpgrade` function.
3.  Uncomment the Stripe checkout logic and remove the "Coming Soon" modal trigger.

## 6. Verify Database Schema

Ensure your Supabase `profiles` table has the following columns:
*   `stripe_customer_id` (text)
*   `stripe_subscription_id` (text)
*   `subscription_tier` (text) - default 'free'
*   `subscription_status` (text) - default 'active'
*   `subscription_started_at` (timestamp)
*   `subscription_ended_at` (timestamp)
