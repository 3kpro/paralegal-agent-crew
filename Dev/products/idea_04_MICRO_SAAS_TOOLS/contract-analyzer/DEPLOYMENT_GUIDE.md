# Production Deployment Guide - ContractGuard AI

To get the app online for your lawyer friend to test, follow these steps:

## 1. Environment Variables (Vercel)
Copy these into your Vercel Project Settings. You will need to get the real keys from your provider dashboards.

| Variable | Source | Value/Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) | `AIzaSy...` |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Settings](https://supabase.com/) | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings | `eyJhbGciOiJIUzI1Ni...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com/) | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk Dashboard | `sk_live_...` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe (Developers -> Webhooks) | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | `pk_live_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` | Stripe Dashboard (Products) | `price_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME` | Stripe Dashboard (Products) | `price_...` |
| `NEXT_PUBLIC_BASE_URL` | Your Domain | `https://contractguard-ai.vercel.app` |

## 2. Supabase Setup
Run the SQL scripts in `supabase/migrations/` in the Supabase SQL Editor to set up the tables and seed the initial templates.

## 3. Deployment Steps
1. Push this code to a **GitHub Repository**.
2. Connect the repository to **Vercel**.
3. Set the **Root Directory** to: `Dev/products/idea_04_MICRO_SAAS_TOOLS/contract-analyzer`
4. Add the Environment Variables above.
5. Deploy!
