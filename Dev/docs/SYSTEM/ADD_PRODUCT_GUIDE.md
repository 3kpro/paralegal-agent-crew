# Portfolio Expansion: Adding a New Product

**Last Updated:** 2026-01-29
**Status:** Operational Guide
**Scope:** Procedures for integrating the 22nd+ product into the marketplace.

---

## 1. Marketplace Registry

All products must be registered in the central marketplace data file to appear on the website and within the sitemap.

**File:** `3kpro-website/lib/data/marketplace.ts`

**Action:** Add a new entry to the `marketplaceItems` array.
- **Slug:** Must be Kebab-case (e.g., `new-product-name`).
- **Category:** Choose from the defined union type (SaaS, Micro-SaaS, etc.).
- **Status:** Start with `In Development` or `Beta`.
- **Stripe Link:** Use the unified pattern: `/api/checkout?slug=[your-slug]`.

---

## 2. Stripe Infrastructure

We use a single Stripe account for all products. Consistency in metadata is critical for the **Unified Webhook Handler**.

### Step 2.1: Create Product
In the Stripe Dashboard:
- **Name:** `[Product Name] - [Tier]`
- **Metadata:** 
  - `product_code`: Must match the `slug` used in the marketplace data.
  - `tier`: `starter` | `team` | `pro`

### Step 2.2: Configure Tax
- **Tax Category:** Set to `Software as a Service (SaaS)`.
- **Price:** Ensure "Automatic Tax" is supported by setting the correct item type.

---

## 3. Shared Identity & Auth

New products must not create their own user tables. They must connect to the shared Supabase instance.

### Configuration
Update the `.env.local` of the new product with:
- `NEXT_PUBLIC_SUPABASE_URL` (Shared)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Shared)

### Database Schema
If the product needs specific tables:
1. Create a new schema in Postgres: `CREATE SCHEMA product_slug;`.
2. Map your tables there.
3. Enable RLS and use `auth.uid()` for isolation.

---

## 4. Notifications & Fulfillment

All transactional emails go through Resend.

1. **Service Registration:** Update `3kpro-website/lib/notifications.ts`.
2. Add your `product_code` to `resolveProductName()` and `resolveDashboardUrl()`.
3. If a special template is needed, create it in `components/emails/`.

---

## 5. SEO & Metadata Verification

1. **Verify Sitemap:** The dynamic sitemap automatically picks up the new entry from `marketplace.ts`.
2. **Metadata Audit:** Run a manual check on `https://3kpro.services/marketplace/[slug]` to ensure Title, Description, and OG images are rendering.
3. Update `METADATA_AUDIT.md` in the `Dev/docs/SYSTEM` folder.

---

## 6. Launch Checklist

- [ ] Product registered in `marketplace.ts`
- [ ] Stripe Test Product & Price created with `product_code` metadata
- [ ] Supabase RLS policies verified for user isolation
- [ ] Resend notification routing verified
- [ ] Lighthouse performance score > 90
- [ ] Production Stripe IDs verified and added to `.env`
