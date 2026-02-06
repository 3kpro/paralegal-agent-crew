# xelora.app Domain Migration Guide

**Date:** 2026-02-05
**Issue:** Old domain (xelora.app) shows 404 error instead of redirecting to getxelora.com
**Status:** 🔴 Requires Action

---

## 🚨 Current Problem

```bash
# Current status:
✅ https://getxelora.com → Working (200 OK)
❌ https://xelora.app → 404 Not Found (Deployment not found)
```

**Impact:**
- Old links shared on social media, emails, etc. are broken
- SEO value from old domain is lost
- Poor user experience for anyone with bookmarks
- Google Search may still index old domain
- Confusing for users (the exact problem we're trying to fix!)

---

## 🎯 Goal

Set up proper 301 (permanent) redirects from xelora.app → getxelora.com

---

## 📋 Solution Options

### Option 1: Add xelora.app to Vercel Project (RECOMMENDED)

This option uses the existing redirect rules in [vercel.json](../vercel.json#L45-54).

#### Steps:

1. **Access Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Navigate to project: `content-cascade-ai-landing` (or getxelora project)

2. **Add Domain**
   - Go to: Settings → Domains
   - Click "Add Domain"
   - Enter: `xelora.app`
   - Verify ownership if needed

3. **Configure DNS** (at your domain registrar)

   **For Apex Domain (xelora.app):**
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   TTL: 3600
   ```

   **Alternative (if registrar supports ALIAS/ANAME):**
   ```
   Type: ALIAS or ANAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   **For www subdomain (www.xelora.app):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Verify Redirect Works**
   After DNS propagation (5-60 minutes), test:
   ```powershell
   curl -I https://xelora.app
   # Should show: 301 Moved Permanently
   # Location: https://getxelora.com/
   ```

**Pros:**
- Uses existing vercel.json configuration
- Automatic HTTPS
- Vercel handles everything
- Fast redirect (edge network)

**Cons:**
- Requires domain DNS change
- May take 5-60 minutes for DNS propagation
- Need to maintain domain registration

---

### Option 2: Redirect at Domain Registrar Level

If you don't want to connect the domain to Vercel, set up forwarding at your registrar.

#### Steps:

1. **Log into Domain Registrar** (wherever xelora.app is registered)
   - Common registrars: Namecheap, GoDaddy, Google Domains, Cloudflare

2. **Set up Domain Forwarding**
   - Look for "Domain Forwarding" or "URL Redirect"
   - Forward `xelora.app` → `https://getxelora.com`
   - Forward `www.xelora.app` → `https://getxelora.com`
   - Choose "301 (Permanent)" redirect
   - Enable "Forward path" to preserve URLs (xelora.app/about → getxelora.com/about)

**Pros:**
- No Vercel configuration needed
- Simple to set up
- Works even if Vercel project is deleted

**Cons:**
- Depends on registrar's redirect service
- May not preserve query parameters
- Could be slower than Vercel edge network

---

### Option 3: Let Domain Expire (NOT RECOMMENDED)

Simply let xelora.app expire and don't renew it.

**Pros:**
- No work required
- No cost to maintain domain

**Cons:**
- ❌ All old links will be permanently broken
- ❌ Someone else could buy the domain
- ❌ Potential phishing/brand confusion if someone else uses it
- ❌ Lost SEO value
- ❌ Poor user experience

**Recommendation:** Don't choose this option unless absolutely necessary.

---

## 🔍 Current Configuration Status

### Vercel Configuration (vercel.json)

✅ Redirect rules are already in place:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "xelora.app"}],
      "destination": "https://getxelora.com/:path*",
      "permanent": true
    },
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "www.xelora.app"}],
      "destination": "https://getxelora.com/:path*",
      "permanent": true
    }
  ]
}
```

**Status:** ✅ Configuration exists, but domain is not connected to Vercel

---

## 🛠️ Recommended Action Plan

**IMMEDIATE (Next 30 minutes):**

1. Check domain registrar for xelora.app
2. Decide if you want to keep the domain long-term
3. If yes → Use Option 1 (Add to Vercel)
4. If no → Use Option 2 (Registrar redirect) until renewal

**SHORT-TERM (This week):**

1. Set up redirect using chosen option
2. Test redirect works: `curl -I https://xelora.app`
3. Update Google Search Console:
   - Go to: https://search.google.com/search-console
   - Select xelora.app property (if exists)
   - Settings → Change of Address
   - Tell Google site moved to getxelora.com

**LONG-TERM (Next 6-12 months):**

1. Monitor analytics for traffic from old domain
2. After 12 months, if no traffic → consider letting domain expire
3. Keep redirect active during Google Business Profile fix period
4. Update any lingering references in old marketing materials

---

## 🧪 Testing & Verification

### Test Redirect (After Setup)

**PowerShell:**
```powershell
# Test apex domain
curl.exe -I https://xelora.app

# Test www subdomain
curl.exe -I https://www.xelora.app

# Expected output:
# HTTP/1.1 301 Moved Permanently
# Location: https://getxelora.com/
```

**Web Browser:**
1. Visit https://xelora.app
2. Should immediately redirect to https://getxelora.com
3. URL bar should show getxelora.com

### Verify DNS Propagation

```powershell
# Check if DNS has propagated
nslookup xelora.app

# Expected: Should show Vercel IP (76.76.19.19) or registrar nameservers
```

### Monitor Redirect Traffic (After 1 week)

1. Go to Vercel Analytics
2. Filter by "Referrer"
3. Look for traffic from xelora.app
4. Should see 301 redirects in logs

---

## 📊 Impact Timeline

| Time Period | Expected Result |
|-------------|----------------|
| Immediately | Domain configured in Vercel/Registrar |
| 5-60 minutes | DNS propagates, redirect works |
| 24-72 hours | Google starts discovering redirect |
| 1-2 weeks | Most search results updated |
| 4-6 weeks | Full cache refresh, all references updated |

---

## 🔗 Related Tasks

- [ ] Set up xelora.app redirect (this document)
- [ ] Update Google Business Profile to show getxelora.com (see GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md)
- [ ] Request Google Search Console address change
- [ ] Update any social media profiles still showing xelora.app
- [ ] Check email signatures for old domain
- [ ] Update business cards / marketing materials

---

## 💡 Pro Tips

1. **Keep the domain for at least 12 months** after migration to ensure all redirects work
2. **Monitor Google Analytics** for referrals from old domain
3. **Update all social media** profile URLs to use getxelora.com
4. **Check email signatures** and update any xelora.app references
5. **Inform partners/affiliates** about the domain change

---

## 📞 Need Help?

If you encounter issues:

1. **DNS not propagating:**
   - Wait 24 hours
   - Clear browser cache
   - Try incognito/private browsing
   - Use online DNS checker: https://dnschecker.org

2. **Vercel domain verification failing:**
   - Check DNS records are correct
   - Remove any conflicting DNS entries
   - Contact Vercel support

3. **Redirect not working:**
   - Check vercel.json syntax
   - Redeploy project
   - Verify domain is connected in Vercel dashboard

---

**STATUS:** ⏳ Awaiting user action to choose redirect option and implement

**PRIORITY:** 🔴 HIGH - Directly impacts Google Business Profile fix success
