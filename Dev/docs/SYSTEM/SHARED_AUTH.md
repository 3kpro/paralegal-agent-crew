# Shared Authentication Service Architecture

**Last Updated:** 2026-01-29
**Status:** Implementation Guide
**Scope:** Cross-product identity management

---

## 1. Overview

To support a seamless user experience across the 21-product portfolio, we utilize a **Single-Cluster Identity Model** powered by Supabase.

**Core Principles:**
- **One User Account:** A customer has one login (`email` + `password`) for all 3K Pro Services.
- **Unified Billing:** Access to products is determined by checking the central subscription status (Stripe).
- **Centralized Management:** User profile, security settings, and billing are managed in one place (`3kpro.services` portal).

---

## 2. Technical Architecture

### Infrastructure
- **Provider:** Supabase
- **Instance:** Shared Project (currently `3kpro-website` project)
- **Schema:**
  - `auth.users`: Global user registry.
  - `public.users`: Public profile data (synced via trigger).
  - `public.organizations`: Organization/Team boundaries (FairMerge etc.).
- **Access Control:** Row Level Security (RLS) policies based on `subscription_tier`.

### Integration Strategy

Every product (e.g., FairMerge, Cloud Ledger) is a **client** of the Shared Auth Service.

**Configuration:**
Each product repository must be configured with the **same** Supabase credentials.

```env
# .env.local (in every product repo)
NEXT_PUBLIC_SUPABASE_URL=https://hvcmidkylzrhmrwyigqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Shared Anon Key]
```

**Authentication Flow:**
1. **Frontend:** Uses `@supabase/ssr` (Next.js) or `@supabase/js` (React).
2. **Login:** Redirects to `auth` endpoint or handles login directly.
3. **Session:** JWT contains `sub` (User ID).
4. **Backend/API:** Verifies JWT.
5. **Authorization:** Checks `subscriptions` table (synced from Stripe) to permit access.

---

## 3. Implementation Checklist (FairMerge)

### Step 1: Environment Setup
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` from `3kpro-website/.env.local`.
- [ ] Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `3kpro-website/.env.local`.
- [ ] Create `.env` in `frontend/` (if separate) or root.

### Step 2: Auth Context (Frontend)
- [ ] Install `@supabase/supabase-js` (or `@supabase/ssr` if Next.js App Router).
- [ ] Create `SupabaseProvider` or `useAuth` hook.
- [ ] Implement `SignIn` / `SignOut` buttons.

### Step 3: Protected Routes (Backend/Frontend)
- [ ] Middleware to check session existence.
- [ ] Redirect to `/login` if no session.
- [ ] Check `subscription_status` for feature gating.

---

## 4. Multi-Tenancy & Data Isolation

To ensure data integrity between products:

- **Namespace Tables:** Prefix tables if in `public` schema (e.g., `rl_reviews`, `cl_ledgers`) OR use separate schemas (`reviewlens.*`, `cloudledger.*`).
- **Recommendation:** Use **Separate Schemas** for cleanliness, enabling RLS on a per-schema basis.

**Current Convention:**
- `public`: Shared tables (`users`, `subscriptions`).
- `reviewlens`: FairMerge specific tables (`repos`, `analyses`).
- `cloud_ledger`: Cloud Ledger specific tables.

---

## 5. Security

- **RLS is Mandatory:** Never expose tables without RLS.
- **Service Keys:** strictly for admin scripts; never in client code.
- **Redirect URLs:** Must be whitelisted in Supabase Dashboard (e.g., `http://localhost:3000`, `https://reviewlens.io`).

