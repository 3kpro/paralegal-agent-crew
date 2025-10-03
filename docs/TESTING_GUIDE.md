# Testing Guide - Phase 1 Setup

## 🎯 Goal
Test the complete flow: **Next.js App (localhost:3000) → n8n Workflow (localhost:5678)**

---

## 💰 **IMPORTANT: Test for FREE First!**

**Phase 1A (FREE - No API Costs):**
- ✅ Test with **MOCK responses** in n8n (no Claude API calls)
- ✅ Verify localhost:3000 → localhost:5678 flow works
- ✅ Confirm UI, webhooks, and response handling all work
- ✅ **Cost: $0.00**

**Phase 1B (Optional - Uses API Credits):**
- Only after Phase 1A succeeds, optionally add real Claude API
- Only needed to verify Claude response quality
- Uses ZenCoder trial credits

**This guide focuses on Phase 1A (FREE testing) first!**

---

## ✅ Prerequisites Checklist

Before you start testing, ensure:

- [ ] **n8n is installed** and running at `http://localhost:5678`
- [ ] **Node.js 18+** is installed
- [ ] **Dependencies installed**: Run `npm install` in project root
- [ ] **Environment configured**: `.env.local` file is set up correctly
- [ ] **n8n workflow created**: Use the **MOCK VERSION** from [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md)

---

## 🚀 Step-by-Step Testing Process (FREE VERSION)

### **Step 1: Start n8n**

```bash
# If using n8n Desktop
# Just open the app and ensure it's running

# If using n8n CLI
n8n start

# You should see:
# n8n ready on http://localhost:5678
```

**Verify n8n is running:**
```bash
curl http://localhost:5678/healthz
```

Expected response: `{"status":"ok"}`

---

### **Step 2: Create & Activate n8n Workflow**

1. Open n8n at `http://localhost:5678`
2. Create a new workflow
3. Follow the structure in [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md)
4. **Important**: Click "Activate" in the top-right corner
5. **Test the webhook** directly in n8n before proceeding

**Quick Test in n8n:**
- Click "Execute Workflow"
- Use test data from the workflow setup guide
- Verify you get a Twitter thread response

---

### **Step 3: Start Next.js Dev Server**

In a new terminal:

```bash
# Navigate to project directory
cd c:\DEV\3K-Pro-Services\landing-page

# Start dev server
npm run dev
```

Expected output:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

### **Step 4: Test Health Check Endpoint**

This verifies Next.js can communicate with n8n:

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "n8n": {
      "status": "connected",
      "responseTime": 45,
      "lastChecked": "2024-01-01T12:00:00.000Z"
    }
  },
  "uptime": 12345,
  "memory": {
    "used": 50.5,
    "total": 100.0,
    "percentage": 50
  }
}
```

✅ If `n8n.status` is `"connected"`, you're good to proceed!

❌ If `n8n.status` is `"disconnected"`:
- Verify n8n is running at localhost:5678
- Check `N8N_BASE_URL` in `.env.local`

---

### **Step 5: Test Twitter Thread API Directly**

Before testing the full UI, test the API endpoint:

```bash
curl -X POST http://localhost:3000/api/twitter-thread \
  -H "Content-Type: application/json" \
  -d '{
    "content": "AI is transforming content marketing. Businesses can now create, optimize, and distribute content across multiple platforms with unprecedented efficiency and personalization.",
    "contentType": "text",
    "style": "professional",
    "includeEmojis": true,
    "includeHashtags": true
  }'
```

**Expected Response (Step 1 - Request Accepted):**
```json
{
  "success": true,
  "message": "Twitter thread generation started",
  "trackingId": "twitter_1234567890_abc123",
  "estimatedTime": "30-60 seconds"
}
```

**Then check status** (use the trackingId from above):
```bash
curl "http://localhost:3000/api/twitter-thread?trackingId=twitter_1234567890_abc123"
```

**Expected Response (Step 2 - Completed):**
```json
{
  "status": "completed",
  "trackingId": "twitter_1234567890_abc123",
  "progress": 100,
  "thread": "🚀 Transform Your Content Marketing with AI\n\n🧵 1/6\n\n..."
}
```

---

### **Step 6: Test Full UI Flow**

1. **Open browser**: Navigate to `http://localhost:3000`
2. **Click "Try Twitter Demo"** button (or scroll to demo section)
3. **Enter test content**:
   ```
   AI-powered content marketing is revolutionizing how businesses engage with their audiences. From automated social media posts to personalized email campaigns, AI is making content creation faster, smarter, and more effective than ever before.
   ```
4. **Select options**:
   - Style: Professional
   - Include Emojis: Yes
   - Include Hashtags: Yes
5. **Click "Generate Thread"**
6. **Watch the progress**:
   - Progress bar should appear
   - Status should update
   - Thread should appear after 30-60 seconds

---

## 🐛 Common Issues & Solutions

### **Issue 1: "n8n webhook not found" (404)**

**Symptoms:**
- API returns 404 error
- n8n logs show no webhook call

**Solutions:**
1. ✅ Verify workflow is **activated** in n8n (toggle in top-right)
2. ✅ Check webhook path is exactly `/webhook/twitter-demo`
3. ✅ Restart n8n and try again
4. ✅ Check n8n console for errors

**Debug in n8n:**
```bash
# Check n8n is running
curl http://localhost:5678/healthz

# Test webhook directly
curl -X POST http://localhost:5678/webhook/twitter-demo \
  -H "Content-Type: application/json" \
  -d '{"content":"test","style":"professional"}'
```

---

### **Issue 2: "Anthropic API Error" / "Claude Code credential error"**

**Symptoms:**
- Error: "This credential is only authorized for use with Claude Code"
- 400 Bad Request from Anthropic

**Solutions:**
1. ✅ Ensure `.env.local` has `USE_ANTHROPIC_DIRECT=false`
2. ✅ Remove or comment out the Claude Code API key
3. ✅ Configure Claude API credentials in **n8n** (not Next.js)
4. ✅ If using ZenCoder, use ZenCoder's proxy endpoint in n8n

**In n8n workflow:**
- Use ZenCoder's API endpoint (not Anthropic direct)
- Or use a real Anthropic API key (not Claude Code key)

---

### **Issue 3: "Response format error"**

**Symptoms:**
- Thread doesn't display
- Status shows "completed" but no content

**Solutions:**
1. ✅ Check n8n's "Format Response" node
2. ✅ Ensure response has `thread` and `status` fields
3. ✅ Test the workflow execution in n8n UI
4. ✅ Check n8n execution logs for the actual response

**Expected n8n response format:**
```json
{
  "thread": "The generated Twitter thread text...",
  "status": "completed"
}
```

---

### **Issue 4: "CORS errors in browser"**

**Symptoms:**
- Browser console shows CORS error
- Request blocked by browser

**Solutions:**
1. ✅ n8n webhooks should auto-handle CORS for localhost
2. ✅ If issues persist, add CORS headers in n8n's "Respond to Webhook" node:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

---

### **Issue 5: "Timeout error"**

**Symptoms:**
- Request hangs
- Times out after 30-60 seconds

**Solutions:**
1. ✅ Check n8n execution logs - is the workflow running?
2. ✅ Verify Claude API call is completing
3. ✅ Check Claude API credits/rate limits
4. ✅ Increase timeout in Next.js if needed

---

## 📊 Testing Checklist

Use this checklist to verify everything is working:

### **Environment Setup**
- [ ] n8n running at localhost:5678
- [ ] Next.js running at localhost:3000
- [ ] `.env.local` configured correctly
- [ ] `USE_ANTHROPIC_DIRECT=false`

### **n8n Workflow**
- [ ] Workflow created in n8n
- [ ] Workflow is **activated**
- [ ] Webhook path is `/webhook/twitter-demo`
- [ ] Claude API credentials configured
- [ ] Test execution works in n8n UI

### **API Tests**
- [ ] Health check shows n8n connected
- [ ] POST to `/api/twitter-thread` returns tracking ID
- [ ] GET with tracking ID returns completed thread
- [ ] Response format is correct

### **UI Tests**
- [ ] Demo modal opens
- [ ] Form submission works
- [ ] Progress bar displays
- [ ] Thread displays after completion
- [ ] No console errors

### **Error Handling**
- [ ] Invalid input shows error message
- [ ] n8n offline shows graceful error
- [ ] Timeout handled properly

---

## 🎯 Success Criteria

You'll know Phase 1 is complete when:

1. ✅ **Health check** shows n8n connected
2. ✅ **API endpoint** generates threads via n8n
3. ✅ **UI demo** works end-to-end
4. ✅ **Claude/Opus** generates quality Twitter threads
5. ✅ **No API key errors** (using n8n route, not direct)

---

## 📝 Next Steps After Phase 1

Once everything is working:

1. **Document any issues** you encountered
2. **Test with different content types** (long-form, URLs, etc.)
3. **Test different styles** (professional, casual, educational)
4. **Review generated threads** for quality
5. **Plan Phase 2** improvements and features

---

## 🆘 Getting Help

If you're stuck:

1. **Check n8n execution logs**: See what's happening in the workflow
2. **Check browser console**: Look for JavaScript errors
3. **Check terminal**: Next.js server logs
4. **Review this guide**: Common issues section
5. **Ask for help**: Provide specific error messages and what you've tried

---

## 🔧 Useful Commands

```bash
# Start n8n
n8n start

# Start Next.js dev server
npm run dev

# Test health check
curl http://localhost:3000/api/health

# Test n8n directly
curl http://localhost:5678/webhook/twitter-demo

# Test Twitter thread API
curl -X POST http://localhost:3000/api/twitter-thread \
  -H "Content-Type: application/json" \
  -d '{"content":"test content","style":"professional"}'

# View n8n logs (if using CLI)
# Logs appear in the terminal where n8n is running

# Rebuild Next.js if needed
npm run build
npm start
```

---

Good luck with testing! 🚀
