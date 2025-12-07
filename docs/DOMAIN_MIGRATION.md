# TrendPulse Domain Migration Guide

**Goal:** Migrate from `trendpulse.3kpro.services` to dedicated domain (e.g., `trendpulse.ai`)

---

## Step 1: Purchase Domain (Namecheap)

1. Go to Namecheap.com
2. Search for your chosen domain
3. Purchase for 1-2 years ($10-15/year typically)
4. **Recommended domains (in order):**
   - `trendpulse.ai` (best - emphasizes AI)
   - `trendpulse.app` (good for SaaS)
   - `gettrendpulse.com` (classic, easy to type)

---

## Step 2: Add Domain to Vercel

### **Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your `landing-page` project
3. Go to **Settings → Domains**
4. Click **Add Domain**
5. Enter your new domain (e.g., `trendpulse.ai`)
6. Click **Add**

### **DNS Records:**

Vercel will show you DNS records to add. Copy them.

---

## Step 3: Configure DNS in Namecheap

### **Namecheap Dashboard:**
1. Go to Namecheap dashboard
2. Click **Manage** next to your domain
3. Go to **Advanced DNS** tab

### **Add These Records:**

**For Root Domain (trendpulse.ai):**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**For WWW Subdomain:**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

**Optional: Email Setup (if you want james@trendpulse.ai):**
```
Type: MX Record
Host: @
Value: (Resend or Google Workspace MX records)
Priority: 10
TTL: Automatic
```

---

## Step 4: Verify Domain in Vercel

1. Wait 5-10 minutes for DNS propagation
2. Go back to Vercel → Settings → Domains
3. Click **Refresh** next to your domain
4. When verified, you'll see a green checkmark ✓

---

## Step 5: Set as Primary Domain

1. In Vercel → Settings → Domains
2. Click the three dots (...) next to your new domain
3. Select **Set as Primary Domain**
4. This ensures `trendpulse.3kpro.services` redirects to `trendpulse.ai`

---

## Step 6: Update Google Search Console

### **Add New Property:**
1. Go to https://search.google.com/search-console
2. Click **Add Property**
3. Select **Domain** (not URL prefix)
4. Enter `trendpulse.ai`
5. Follow verification steps (DNS TXT record)

### **DNS Verification:**
Google will give you a TXT record like:
```
Type: TXT Record
Host: @
Value: google-site-verification=abc123xyz...
TTL: Automatic
```

Add this to Namecheap DNS (same Advanced DNS tab).

---

## Step 7: Redirect Old Subdomain

### **In Vercel:**
1. Keep `trendpulse.3kpro.services` in your domains list
2. Vercel will automatically redirect it to your primary domain
3. This preserves SEO (301 redirect)

### **Verify Redirect:**
```bash
curl -I https://trendpulse.3kpro.services
```

Should show:
```
HTTP/1.1 301 Moved Permanently
Location: https://trendpulse.ai
```

---

## Step 8: Update Environment Variables (if needed)

If you have any hardcoded URLs in your code:

### **Check These Files:**
```bash
# Search for old domain references
grep -r "trendpulse.3kpro.services" .
```

### **Update to New Domain:**
- Sitemap URLs
- Canonical URLs
- Open Graph tags
- Email templates
- API callbacks (Stripe, OAuth, etc.)

---

## Step 9: Update Marketing Materials

### **Update These:**
- [ ] Launchpad posts (change URL to `trendpulse.ai`)
- [ ] Business cards (if printed)
- [ ] Email signatures
- [ ] Social media profiles
- [ ] Product Hunt listing (when you launch)

---

## Step 10: Monitor Migration

### **Check These After 24-48 Hours:**

**SSL Certificate:**
```bash
curl https://trendpulse.ai
```
Should show `200 OK` with HTTPS (🔒)

**DNS Propagation:**
```bash
nslookup trendpulse.ai
```
Should show Vercel's IP

**Google Indexing:**
- Search `site:trendpulse.ai` on Google
- Should show your pages (may take 1-2 weeks)

**Old Domain Redirect:**
- Visit `trendpulse.3kpro.services`
- Should redirect to `trendpulse.ai`

---

## Troubleshooting

### **Domain not verifying in Vercel:**
- Wait 30 minutes (DNS propagation takes time)
- Check DNS records are correct (no typos)
- Clear browser cache
- Try incognito mode

### **SSL certificate not working:**
- Wait 24 hours (Vercel auto-generates SSL)
- Check domain is verified
- Contact Vercel support if still failing

### **Old domain not redirecting:**
- Make sure new domain is set as "Primary" in Vercel
- Check both domains are in Vercel domains list
- Wait 10 minutes for config to update

---

## Estimated Timeline

- **Purchase domain:** 5 minutes
- **Add to Vercel:** 2 minutes
- **Configure DNS:** 10 minutes
- **DNS propagation:** 5-30 minutes
- **SSL certificate:** 1-24 hours
- **Google indexing:** 1-2 weeks

**Total active work:** ~20 minutes
**Total wait time:** 1-2 days for everything to fully propagate

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Domain registration | $10-15 | Annual |
| SSL certificate | $0 | Free (Vercel) |
| DNS hosting | $0 | Free (Namecheap) |
| Domain privacy | $0-5 | Annual (optional) |

**Total:** $10-20/year

---

## Post-Migration Checklist

- [ ] New domain resolves correctly
- [ ] HTTPS works (green padlock)
- [ ] Old subdomain redirects to new domain
- [ ] All pages load correctly
- [ ] Forms still work
- [ ] Authentication still works
- [ ] Stripe/payments still work (if applicable)
- [ ] Analytics tracking still works
- [ ] Google Search Console verified
- [ ] Sitemap submitted to GSC
- [ ] Social media links updated
- [ ] Email signatures updated
- [ ] Launchpad posts updated

---

**Ready to launch with a professional domain! 🚀**
