# Google Search Console Setup Guide: XELORA

This guide outlines the steps to verify `xelora.app` on Google Search Console (GSC) and establish SEO visibility for the new brand.

## Prerequisites
*   **Google Account:** Ensure you are logged into the Google account you want to own the property.
*   **DNS Access:** You will likely need access to your domain's DNS settings (Vercel Dashboard or Domain Registrar).
*   **Deployed Site:** Ensure `https://xelora.app` is live and accessible.

---

## Step 1: Add Property
1.  Go to [Google Search Console](https://search.google.com/search-console).
2.  Click the property dropdown (top left) > **Add property**.
3.  Select **Domain** property type (Recommended).
    *   *Why?* It covers `http`, `https`, `www`, and non-www versions automatically.
4.  Enter domain: `xelora.app`
5.  Click **Continue**.

## Step 2: Verification (DNS Method - Recommended)
Google will provide a TXT record string (e.g., `google-site-verification=AbC123...`).

### If Hosting on Vercel:
1.  Copy the TXT string from Google.
2.  Go to your **Vercel Dashboard** > Select Project (`xelora` / `landing-page`).
3.  Go to **Settings** > **Domains**.
4.  Click **Edit** on `xelora.app` (or find the DNS records section).
5.  Add a new **TXT Record**:
    *   **Name:** `@` (or leave blank)
    *   **Value:** Paste the Google string.
    *   **TTL:** Default (e.g., 60 or 3600).
6.  Click **Add**.

### If Hosting via Registrar (GoDaddy/Namecheap) pointing to Vercel:
*   Add the TXT record in your Registrar's DNS management console instead.

**Finalize:**
7.  Go back to Google Search Console.
8.  Click **Verify**. (Note: DNS changes can take a few minutes to stick. If it fails, wait 5-10 minutes and try again).

---

## Alternative: HTML Tag Verification (Faster)
If DNS access is tricky, use the **URL Prefix** method (Step 1, option on the right) for `https://xelora.app`.
1.  Select **HTML Tag** verification method.
2.  Copy the meta tag: `<meta name="google-site-verification" content="..." />`.
3.  **Action:** Paste this tag to me (Antigravity), and I will add it to `app/layout.tsx` metadata.
4.  Once deployed, click **Verify**.

---

## Step 3: Submit Sitemap
Once verified:
1.  In GSC sidebar, click **Sitemaps**.
2.  Enter: `sitemap.xml`
    *   Full URL should be: `https://xelora.app/sitemap.xml`
3.  Click **Submit**.
4.  Status should change to "Success" (green). It might take a moment to fetch.

## Step 4: Validate Schema (Rich Results)
Your site sends structured data (JSON-LD) for better SEO.
1.  Inspect the homepage via GSC URL Inspection tool.
2.  Check for **Enhancements** (Logos, Sitelinks, etc.).
3.  Or use [Rich Results Test](https://search.google.com/test/rich-results) with `https://xelora.app`.

---

## Brand Change Note
Since `3kpro.services` (TrendPulse) was never fully verified, there is no need to use the "Change of Address" tool. Treating `xelora.app` as a fresh new property is cleaner and faster.
