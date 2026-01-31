-- Database Indexing Strategy (Marketplace Portfolio)
-- Run these commands in the Supabase SQL Editor

--------------------------------------------------------------------------------
-- 1. CROSS-PRODUCT IDENTITY & BILLING (Public Schema)
--------------------------------------------------------------------------------

-- Index stripe_customer_id for fast lookup during webhooks
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users (stripe_customer_id);

-- Index subscription_id for subscription.updated/deleted events
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users (stripe_subscription_id);

-- Rapid access gating (Who can use what?)
-- Composite index for performance-critical gating checks
CREATE INDEX IF NOT EXISTS idx_users_access_gating ON public.users (id, subscription_tier, subscription_status);


--------------------------------------------------------------------------------
-- 2. REVIEWLENS (Idea 11 - FairMerge)
--------------------------------------------------------------------------------

-- Ensure ReviewLens specific tables are indexed on user_id/org_id
-- (Assuming table name is `rl_repos` based on SCALING_PLAN.md namespace recommendation)
CREATE INDEX IF NOT EXISTS idx_rl_repos_user_id ON reviewlens.repos (user_id);
CREATE INDEX IF NOT EXISTS idx_rl_analyses_repo_id ON reviewlens.analyses (repo_id);


--------------------------------------------------------------------------------
-- 3. CLOUD LEDGER
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_cl_ledgers_user_id ON cloud_ledger.ledgers (user_id);
CREATE INDEX IF NOT EXISTS idx_cl_transactions_ledger_id ON cloud_ledger.transactions (ledger_id);


--------------------------------------------------------------------------------
-- 4. ANALYTICS (Portfolio Wide)
--------------------------------------------------------------------------------

-- Index for the Marketplace Analytics Dashboard
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at);
