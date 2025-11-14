# n8n Workflow Setup Guide

## 🎯 Overview

This guide explains how to set up the n8n workflow for the Twitter Thread Generator feature.

---

## 💰 **TWO VERSIONS: Pick Based on Your Needs**

### **Version A: MOCK Testing (FREE - Start Here!) 🆓**
- ✅ No API calls, no costs
- ✅ Returns hardcoded Twitter thread
- ✅ Perfect for testing the localhost flow
- ✅ **Use this first!**

### **Version B: Real Claude API (Uses Credits) 💳**
- Only use after Version A works
- Calls Claude Opus via ZenCoder
- Uses your ZenCoder trial credits
- For verifying Claude response quality

**This guide shows BOTH versions. Start with Version A!**

---

## ⚡ **QUICK START: Import Pre-Built Workflow (EASIEST!)**

### **Option 1: Import JSON File (Recommended - 2 minutes)**

**The workflow is already built for you!**

1. **Open n8n:** http://localhost:5678
2. **Click "Workflows"** in left sidebar → **"Import from File"**
3. **Browse to:** `C:\DEV\3K-Pro-Services\landing-page\n8n-workflows\twitter-thread-mock-workflow.json`
4. **Click "Open"** - Workflow loads automatically!
5. **Activate it:** Toggle the switch in top-right corner (should turn green/blue)
6. **Test it:** Click "Test workflow" or "Execute Workflow"

**Done! Skip to testing section below.** ✅

---

### **Option 2: Build Manually (If you prefer)**

If you want to understand each node, follow the manual setup below.

---

## 📋 Workflow Requirements

Your n8n workflow at `http://localhost:5678` needs to:
1. **Accept** POST requests at `/webhook/twitter-demo`
2. **Process** the incoming content (mock or real Claude)
3. **Return** the generated Twitter thread in the correct format

---

## 🔧 Workflow Structure - VERSION A (FREE MOCK)

**If you imported the JSON file above, you already have this! Skip to testing.**

**If building manually, create these 4 nodes:**

### **Node 1: Webhook Trigger**
- **Type**: Webhook
- **Path**: `/webhook/twitter-demo`
- **Method**: POST
- **Response Mode**: Return Last Node

### **Node 2: Parse Request Data**
- **Type**: Set (or Code node)
- **Purpose**: Extract the payload fields

**Expected Input Fields:**
```json
{
  "trackingId": "twitter_1234567890_abc123",
  "content": "Content to transform into a Twitter thread",
  "contentType": "text",
  "style": "professional",
  "includeEmojis": true,
  "includeHashtags": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "Content Cascade AI Demo"
}
```

### **Node 3: Return MOCK Twitter Thread (FREE VERSION)**
- **Type**: Code Node
- **Purpose**: Return a hardcoded Twitter thread (NO API CALL)

```javascript
// MOCK VERSION - No API costs!
const trackingId = $input.item.json.trackingId;
const content = $input.item.json.content;
const style = $input.item.json.style || 'professional';

// Mock Twitter thread based on style
const mockThreads = {
  professional: `🚀 Transform Your Content Marketing with AI

This is exactly what Content Cascade AI does for businesses every day.

🧵 1/6

🎯 The Problem:
Creating platform-specific content takes hours. Different formats, different audiences, different tone requirements.

Sound familiar?

🧵 2/6

💡 The Solution:
Content Cascade AI transforms your single piece of content into:
• Twitter threads
• LinkedIn posts
• Email campaigns
• Video scripts

All automatically optimized for each platform.

🧵 3/6

⚡ How It Works:
1. Upload your content (text, URL, video, audio)
2. AI analyzes your brand voice
3. Generates platform-optimized versions
4. Maintains consistency across channels

🧵 4/6

📈 Real Results:
• 10x faster content creation
• 95% time savings
• Consistent brand messaging
• Multi-platform reach

🧵 5/6

🎉 Ready to transform your content marketing?

✅ Test it locally (this is a mock response!)
✅ No API costs during testing
✅ Add real AI later

🧵 6/6

#ContentMarketing #AI #Testing`,

  casual: `Hey! 👋 Just tested something cool...

This is a MOCK Twitter thread to show you the flow works!

🧵 1/5

Okay so picture this...

You write ONE piece of content.

Then BOOM! 💥

Get it optimized for:
- Twitter
- LinkedIn
- Email
- Video

All automatically. All on-brand.

🧵 2/5

This is totally working right now!

You're seeing this mock response which means:
✅ Next.js → n8n connection works
✅ Webhook is receiving data
✅ Response is formatting correctly

🧵 3/5

The crazy part?

This costs $0.00 to test!

No API calls. No credits used.

Just proving the flow works. 🎉

🧵 4/5

Next step? Add the real Claude AI when you're ready.

But for now, celebrate that localhost testing works!

Drop a 🔥 if you're excited!

🧵 5/5`,

  educational: `📚 DEMO: How Localhost Testing Works

Let's break down what just happened when you generated this thread.

🧵 THREAD 1/6

📖 Step 1: Request Initiated

Your Next.js app (localhost:3000) sent a POST request to /api/twitter-thread with your content and preferences.

🧵 2/6

🔬 Step 2: Webhook Called

The API route forwarded your request to n8n webhook at localhost:5678/webhook/twitter-demo.

No external APIs called yet!

🧵 3/6

⚙️ Step 3: Mock Processing

n8n received your request and returned this hardcoded thread instead of calling Claude API.

This saves you money during testing!

🧵 4/6

📊 Step 4: Response Formatted

The thread you're reading was formatted with:
• trackingId: ${trackingId}
• status: completed
• Cost: $0.00

🧵 5/6

🎯 Step 5: UI Display

Next.js received the mock thread and displayed it in your browser.

The entire flow works WITHOUT any paid APIs!

🧵 6/6

📝 What You Learned:

Localhost testing proves your infrastructure works before spending on API calls.

Next: Add real Claude AI only when ready!

#Development #Testing #LocalFirst`
};

// Return mock thread based on style
return {
  json: {
    thread: mockThreads[style] || mockThreads.professional,
    status: 'completed',
    trackingId: trackingId,
    timestamp: new Date().toISOString(),
    mock: true  // Flag to indicate this is mock data
  }
};
```

**That's it! This is the complete FREE workflow.**
- Only 3 nodes needed
- No API costs
- Tests the entire localhost flow

---

## 🔧 Workflow Structure - VERSION B (REAL CLAUDE API)

**Only use this after Version A works!**

Add these nodes AFTER the Parse Request node:

### **Node 3: Build Claude AI Prompt**
- **Type**: Code Node
- **Purpose**: Create the prompt for Claude

```javascript
// REAL API VERSION
const style = $input.item.json.style || 'professional';
const content = $input.item.json.content;
const includeEmojis = $input.item.json.includeEmojis;
const includeHashtags = $input.item.json.includeHashtags;

const styleInstructions = {
  professional: 'Create a professional, business-focused Twitter thread with clear value propositions and actionable insights.',
  casual: 'Create a friendly, conversational Twitter thread that feels authentic and relatable.',
  educational: 'Create an educational, informative Twitter thread that teaches concepts step-by-step with data and examples.'
};

const prompt = `You are an expert Twitter content creator. ${styleInstructions[style]}

Content to transform into a Twitter thread:
${content}

Requirements:
- Create an engaging Twitter thread (5-7 tweets)
- Each tweet should be under 280 characters
- Use thread numbering (🧵 1/X format)
- ${includeEmojis ? 'Include relevant emojis' : 'No emojis'}
- ${includeHashtags ? 'Include relevant hashtags at the end' : 'No hashtags'}
- Make it engaging and shareable
- Maintain ${style} tone throughout

Format each tweet on a new line, separated by blank lines.`;

return {
  json: {
    trackingId: $input.item.json.trackingId,
    prompt: prompt
  }
};
```

### **Node 4: Call Claude AI (ZenCoder Proxy or Anthropic Direct)**

#### **Option A: Using ZenCoder Proxy**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://api.zencoder.ai/v1/messages` (or whatever ZenCoder's endpoint is)
- **Authentication**: Bearer Token (your ZenCoder trial API key)
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01"
  }
  ```
- **Body**:
  ```json
  {
    "model": "claude-opus-4-20250514",
    "max_tokens": 4096,
    "messages": [
      {
        "role": "user",
        "content": "{{ $json.prompt }}"
      }
    ]
  }
  ```

#### **Option B: Using Direct Anthropic API**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://api.anthropic.com/v1/messages`
- **Authentication**: Add `x-api-key` header with your Anthropic API key
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "x-api-key": "sk-ant-your-real-key-here",
    "anthropic-version": "2023-06-01"
  }
  ```
- **Body**: Same as Option A

### **Node 5: Format Response**
- **Type**: Code Node
- **Purpose**: Extract the thread text and format the response

```javascript
// Extract the generated thread from Claude's response
const claudeResponse = $input.item.json;
const thread = claudeResponse.content[0].text;
const trackingId = $('Parse Request Data').item.json.trackingId;

return {
  json: {
    thread: thread,
    status: 'completed',
    trackingId: trackingId,
    timestamp: new Date().toISOString()
  }
};
```

### **Node 6: Return Response**
- **Type**: Respond to Webhook
- **Response Body**: Use the formatted output from Node 5

**Expected Response Format:**
```json
{
  "thread": "🚀 Transform Your Content Marketing...\n\n🧵 1/6\n\n...",
  "status": "completed",
  "trackingId": "twitter_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:05.000Z"
}
```

---

## 🔑 Environment Variables in n8n

If using ZenCoder or Anthropic directly, store your API key in n8n's credentials:

1. Go to **Settings → Credentials** in n8n
2. Add new credential:
   - **Type**: Header Auth or API Key
   - **Name**: "ZenCoder API" or "Anthropic API"
   - **Value**: Your API key

---

## 🧪 Testing the Workflow

### **Test 1: From n8n UI**
1. Click the "Execute Workflow" button
2. Use this test payload:
```json
{
  "trackingId": "test_123",
  "content": "AI is revolutionizing content marketing. Businesses can now create, distribute, and optimize content across multiple platforms with unprecedented efficiency.",
  "contentType": "text",
  "style": "professional",
  "includeEmojis": true,
  "includeHashtags": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "Manual Test"
}
```

### **Test 2: From Terminal (cURL)**
```bash
curl -X POST http://localhost:5678/webhook/twitter-demo \
  -H "Content-Type: application/json" \
  -d '{
    "trackingId": "test_123",
    "content": "AI is transforming how we create content.",
    "contentType": "text",
    "style": "professional",
    "includeEmojis": true,
    "includeHashtags": true
  }'
```

### **Test 3: From Next.js App (localhost:3000)**
1. Start n8n: `n8n start` (or open n8n Desktop)
2. Start Next.js: `npm run dev`
3. Open browser: `http://localhost:3000`
4. Click "Try Twitter Demo" button
5. Enter test content and submit

---

## 🚨 Troubleshooting

### **Issue: "n8n webhook not found"**
- ✅ Ensure webhook path is exactly `/webhook/twitter-demo`
- ✅ Ensure workflow is activated in n8n
- ✅ Check n8n is running on port 5678

### **Issue: "Anthropic API error"**
- ✅ Verify you're using a REAL Anthropic API key (not Claude Code key)
- ✅ Or verify ZenCoder proxy URL and credentials
- ✅ Check API key has sufficient credits

### **Issue: "Response format error"**
- ✅ Ensure response includes `thread` and `status` fields
- ✅ Check Format Response node is correctly extracting the thread text

### **Issue: "CORS errors"**
- ✅ n8n's webhook should automatically handle CORS for localhost
- ✅ If issues persist, add CORS headers in Respond to Webhook node

---

## 📊 Workflow Diagram

```
┌─────────────────┐
│ Next.js App     │
│ localhost:3000  │
└────────┬────────┘
         │ POST /webhook/twitter-demo
         ▼
┌─────────────────────────────────────────────────────┐
│ n8n Workflow (localhost:5678)                       │
│                                                      │
│  1. Webhook Trigger                                  │
│       ↓                                              │
│  2. Parse Request Data                               │
│       ↓                                              │
│  3. Build Claude Prompt                              │
│       ↓                                              │
│  4. Call Claude API (ZenCoder/Anthropic)            │
│       ↓                                              │
│  5. Format Response                                  │
│       ↓                                              │
│  6. Return Response                                  │
└────────┬────────────────────────────────────────────┘
         │ { thread: "...", status: "completed" }
         ▼
┌─────────────────┐
│ Next.js App     │
│ Displays Thread │
└─────────────────┘
```

---

## 🎯 Next Steps

1. **Create the workflow** in n8n using the structure above
2. **Configure Claude API** credentials (ZenCoder or Anthropic)
3. **Activate the workflow** in n8n
4. **Test** using the methods above
5. **Debug** any issues using n8n's execution logs

---

## 📝 Notes

- **Development**: Use localhost:5678 for testing
- **Production**: You can deploy n8n to cloud and update `N8N_WEBHOOK_URL` in `.env.local`
- **API Keys**: Never commit real API keys to version control
- **ZenCoder Trial**: During your trial, you should be able to use Opus through ZenCoder's proxy without your own Anthropic credits

---

## ✅ Checklist

Before testing the full flow:
- [ ] n8n is running at localhost:5678
- [ ] Workflow is created and activated
- [ ] Webhook path is `/webhook/twitter-demo`
- [ ] Claude API credentials are configured
- [ ] Response format includes `thread` and `status` fields
- [ ] Next.js app is using `.env.local` with `USE_ANTHROPIC_DIRECT=false`
- [ ] Next.js app is running at localhost:3000
