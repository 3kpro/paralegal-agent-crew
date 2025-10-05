# Vercel Environment Variable Setup

## Set API_GATEWAY_URL for Production

Your production site at https://3kpro.services needs to access your local PowerShell microservice and LM Studio via the ngrok tunnel.

### Current Ngrok URL
```
https://nonreproducible-ryan-hazier.ngrok-free.dev
```

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `content-cascade-ai-landing`

2. **Navigate to Settings**
   - Click "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

3. **Add New Environment Variable**
   - Click "Add New" button
   - **Name:** `API_GATEWAY_URL`
   - **Value:** `https://nonreproducible-ryan-hazier.ngrok-free.dev`
   - **Environments:** Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." menu on the latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes for deployment

5. **Test Production Site**
   - Visit: https://3kpro.services/trend-gen
   - Click "Daily Trends" → Should show PowerShell-generated topics (not mock data)
   - Select a topic → Click "Generate Content"
   - Should see LM Studio-generated content (takes 5-15 seconds)

### Important Notes

#### ngrok Free Tier Limitations
- ⚠️ **URL changes on every restart** - Free ngrok URLs expire when you close the tunnel
- ⚠️ **Update Vercel env var** each time you restart ngrok
- 💡 **Solution:** Get ngrok paid plan ($8/month) for permanent URL

#### Keeping Services Running
You need these 3 services running 24/7 for production to work:

1. **PowerShell Trends Microservice**
   ```powershell
   cd C:\DEV\PowerShell-Playground
   .\trends-microservice-v2.3.ps1 -Port 5003
   ```

2. **API Gateway**
   ```bash
   cd C:\DEV\PowerShell-Playground
   node api-gateway.js
   ```

3. **ngrok Tunnel**
   ```bash
   ngrok http 8080
   ```

4. **LM Studio** (already running on 10.10.10.105:1234)

### Upgrading to ngrok Paid Plan

**Benefits:**
- ✅ Permanent URL (never changes)
- ✅ No need to update Vercel env var
- ✅ Custom domain support
- ✅ Faster connection (no interstitial page)

**Cost:** $8/month

**To Upgrade:**
1. Go to https://dashboard.ngrok.com
2. Click "Upgrade" button
3. Choose "Personal" plan ($8/month)
4. Set up permanent domain (e.g., `api-3kpro.ngrok.app`)
5. Update Vercel env var ONE TIME with permanent URL

### Alternative: Cloud Deployment

Instead of ngrok, deploy the API Gateway to a cloud server:

**DigitalOcean Droplet ($4/month):**
1. Create Ubuntu droplet
2. Install Node.js
3. Upload `api-gateway.js` and `trends-microservice-v2.3.ps1`
4. Install PowerShell on Linux
5. Run services with PM2 (keeps running 24/7)
6. Point Vercel to droplet IP

**Pros:**
- Cheaper than ngrok paid ($4 vs $8)
- Full control over server
- Can run other services too

**Cons:**
- LM Studio still on local network (need to expose separately OR use cloud AI)
- More setup complexity

### Recommended Path

**For MVP/Launch (Now):**
- ✅ Use free ngrok (restart daily, update Vercel env var)
- ✅ Get first customers ($500-1k revenue)
- ✅ Launch Gumroad products

**After First Revenue ($500+):**
- Upgrade to ngrok paid ($8/month) for permanent URL
- Keep everything else as-is

**After $2k MRR:**
- Deploy to DigitalOcean ($4/month)
- Add cloud AI providers (Gemini, Claude)
- Scale infrastructure as needed

---

## Current Services Status

### ✅ Running Now
- PowerShell microservice (port 5003)
- API Gateway (port 8080)
- ngrok tunnel (https://nonreproducible-ryan-hazier.ngrok-free.dev)
- LM Studio (10.10.10.105:1234)

### 📋 Next Steps
1. Set `API_GATEWAY_URL` in Vercel (see instructions above)
2. Redeploy production
3. Test https://3kpro.services/trend-gen
4. Launch marketing tomorrow 8am-11am

---

## Troubleshooting

### Production shows mock data
- Check: Is `API_GATEWAY_URL` set in Vercel?
- Check: Are all 3 local services running?
- Check: Is ngrok URL still valid? (test with curl)
- Solution: Restart services and update Vercel env var

### "Failed to generate content" error
- Check: Is LM Studio running and loaded model?
- Check: Can API gateway reach LM Studio? (test health endpoint)
- Check: ngrok tunnel allows POST requests?

### ngrok URL changed
- Restart ngrok → Get new URL
- Update `.env.local` locally
- Update `API_GATEWAY_URL` in Vercel
- Redeploy

---

**Last Updated:** 2025-10-03
**Ngrok URL:** https://nonreproducible-ryan-hazier.ngrok-free.dev
**Services:** PowerShell (5003) + API Gateway (8080) + ngrok → LM Studio (10.10.10.105:1234)
