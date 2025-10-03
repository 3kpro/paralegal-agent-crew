# 🚀 QUICK START - Phase 1 Setup

## ⚡ Fast Track (5 Minutes)

### **1. Verify Environment** ✅

Check your [.env.local](.env.local) has:
```env
USE_ANTHROPIC_DIRECT=false
N8N_WEBHOOK_URL=http://localhost:5678/webhook/twitter-demo
N8N_BASE_URL=http://localhost:5678
```

**Status:** ✅ Already configured!

---

### **2. Create n8n Workflow** ⏳

Open n8n at `http://localhost:5678` and create this workflow:

1. **Webhook Node** → Path: `/webhook/twitter-demo`
2. **Code Node** → Build Claude prompt (see below)
3. **HTTP Request** → Call Claude API with ZenCoder credentials
4. **Code Node** → Format response
5. **Respond to Webhook** → Return the thread

**Quick Code for Node 2 (Build Prompt):**
```javascript
const content = $input.item.json.content;
const style = $input.item.json.style || 'professional';

return {
  json: {
    prompt: `You are an expert Twitter content creator. Create a professional Twitter thread (5-7 tweets, under 280 chars each) from this content:\n\n${content}\n\nUse 🧵 numbering and make it engaging.`,
    trackingId: $input.item.json.trackingId
  }
};
```

**Quick Config for Node 3 (HTTP Request):**
- URL: Your ZenCoder endpoint (or `https://api.anthropic.com/v1/messages`)
- Method: POST
- Headers: Add your ZenCoder API key
- Body:
```json
{
  "model": "claude-opus-4-20250514",
  "max_tokens": 4096,
  "messages": [{"role": "user", "content": "={{ $json.prompt }}"}]
}
```

**Quick Code for Node 4 (Format Response):**
```javascript
const thread = $input.item.json.content[0].text;
return {
  json: {
    thread: thread,
    status: 'completed'
  }
};
```

**Click "Activate"** in top-right corner!

---

### **3. Start Services** ⏳

```bash
# Terminal 1: n8n (if not already running)
n8n start

# Terminal 2: Next.js
npm run dev
```

---

### **4. Test** ⏳

```bash
# Test 1: Health check
curl http://localhost:3000/api/health

# Test 2: Generate thread
curl -X POST http://localhost:3000/api/twitter-thread \
  -H "Content-Type: application/json" \
  -d '{"content":"AI is transforming content marketing.","style":"professional","includeEmojis":true,"includeHashtags":true}'

# Test 3: Check status (use trackingId from Test 2)
curl "http://localhost:3000/api/twitter-thread?trackingId=YOUR_TRACKING_ID"
```

---

### **5. Use the UI** 🎉

1. Open `http://localhost:3000`
2. Click "Try Twitter Demo"
3. Enter content and generate!

---

## 📚 Detailed Guides

Need more help? See:
- **[docs/N8N_WORKFLOW_SETUP.md](./docs/N8N_WORKFLOW_SETUP.md)** - Complete n8n workflow guide
- **[docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Step-by-step testing
- **[docs/PHASE1_SUMMARY.md](./docs/PHASE1_SUMMARY.md)** - What we fixed and why

---

## 🐛 Common Issues

**"n8n webhook not found"**
→ Make sure workflow is **activated** (toggle in n8n UI)

**"Claude Code credential error"**
→ You need to add ZenCoder credentials in n8n, not Next.js

**"n8n disconnected"**
→ Check n8n is running: `curl http://localhost:5678/healthz`

---

## ✅ Success Checklist

- [ ] n8n running at localhost:5678
- [ ] Workflow created and activated
- [ ] Next.js running at localhost:3000
- [ ] Health check shows n8n connected
- [ ] Can generate Twitter threads via UI

---

**You're ready to go! 🚀**
