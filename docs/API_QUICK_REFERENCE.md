# AI Tools System - API Quick Reference

**For:** ZenCoder UI Development
**All endpoints ready to use!** 🚀

---

## 🔥 Copy-Paste Ready Examples

### **1. List All AI Tools**

```javascript
// GET /api/ai-tools/list
const response = await fetch('/api/ai-tools/list')
const data = await response.json()

// Response:
{
  "success": true,
  "providers": [
    {
      "id": "uuid-123",
      "name": "OpenAI (GPT)",
      "provider_key": "openai",
      "category": "text",
      "description": "GPT-4, GPT-3.5 for text generation",
      "setup_url": "https://platform.openai.com/api-keys",
      "setup_instructions": {
        "steps": ["Sign in to OpenAI Platform", "..."],
        "timeEstimate": "~3 minutes",
        "costInfo": "$5 free credit",
        "keyFormat": "sk-..."
      },
      "required_tier": "free",
      "isConfigured": false,  // ← User hasn't set this up yet
      "isLocked": false,      // ← User's tier allows this
      "testStatus": "pending",
      "hasApiKey": false
    },
    {
      "id": "uuid-456",
      "name": "LM Studio",
      "provider_key": "lmstudio",
      "category": "local",
      "isConfigured": true,   // ← Already configured!
      "isLocked": false,
      "testStatus": "success"
    }
    // ... 9 more providers
  ],
  "userLimits": {
    "current": 1,   // 1 tool configured (LM Studio)
    "max": 1,       // Free tier = max 1 tool
    "tier": "free"
  }
}
```

**Use this to:**
- Build tool selection cards
- Show "Configure" vs "✅ Ready" badges
- Display locked tools (requires upgrade)

---

### **2. Configure AI Tool**

```javascript
// POST /api/ai-tools/configure
const response = await fetch('/api/ai-tools/configure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    providerId: 'uuid-from-list-endpoint',
    apiKey: 'sk-proj-abc123...', // User's API key
    configuration: {
      model: 'gpt-4-turbo',      // Optional config
      temperature: 0.7,
      maxTokens: 2000
    }
  })
})

const data = await response.json()

// Success response:
{
  "success": true,
  "message": "AI tool configured successfully",
  "toolId": "user-tool-uuid",
  "requiresTest": true  // Should show "Test Connection" button
}

// Error response (tier limit):
{
  "error": "AI tools limit exceeded. Current: 1, Limit: 1. Upgrade your plan to add more tools.",
  "upgradeRequired": true
}

// Error response (tier locked):
{
  "error": "This tool requires pro tier or higher. Please upgrade your plan."
}
```

**Use this to:**
- Save API keys on blur
- Show success messages
- Handle upgrade prompts
- Enable "Test Connection" button

---

### **3. Test API Key**

```javascript
// POST /api/ai-tools/test
const response = await fetch('/api/ai-tools/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    toolId: 'user-tool-uuid-from-configure'
  })
})

const data = await response.json()

// Success response:
{
  "success": true,
  "message": "OpenAI API key is valid!",
  "details": "Connected successfully. 42 models available."
}

// Failure response:
{
  "success": false,
  "message": "Invalid API key",
  "details": "Please check your API key and try again"
}
```

**Use this to:**
- Validate API keys
- Show ✅/❌ status
- Display connection details

---

### **4. Delete AI Tool**

```javascript
// DELETE /api/ai-tools/configure?id={toolId}
const response = await fetch(`/api/ai-tools/configure?id=${toolId}`, {
  method: 'DELETE'
})

const data = await response.json()

// Response:
{
  "success": true,
  "message": "AI tool removed successfully"
}
```

**Use this to:**
- Remove tool configurations
- Free up tool slots

---

### **5. Get User Profile**

```javascript
// GET /api/profile
const response = await fetch('/api/profile')
const data = await response.json()

// Response:
{
  "success": true,
  "profile": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "company_name": "Acme Corp",
    "avatar_url": null,
    "company_logo_url": null,
    "bio": "Content creator...",
    "website": "https://example.com",
    "timezone": "America/New_York",
    "language": "en-US",
    "twitter_handle": "@johndoe",
    "linkedin_url": "linkedin.com/in/johndoe",
    "facebook_url": null,
    "instagram_handle": "@johndoe",
    "tiktok_handle": null,
    "reddit_handle": null,
    "subscription_tier": "free",
    "ai_tools_limit": 1,
    "created_at": "2025-10-04T...",
    "updated_at": "2025-10-04T..."
  }
}
```

**Use this to:**
- Load profile form fields
- Display user info in UI

---

### **6. Update User Profile**

```javascript
// PUT /api/profile
const response = await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'John Doe',
    company_name: 'Acme Corp',
    bio: 'Content creator and marketer',
    website: 'https://example.com',
    twitter_handle: '@johndoe',
    linkedin_url: 'linkedin.com/in/johndoe',
    instagram_handle: '@johndoe'
    // Add any fields you want to update
    // Protected fields (tier, email, etc.) are ignored
  })
})

const data = await response.json()

// Success response:
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { /* updated profile */ }
}

// Validation error:
{
  "error": "Invalid website URL format"
}

{
  "error": "Bio must be 500 characters or less"
}
```

**Use this to:**
- Save profile changes
- Validate input
- Show success messages

---

### **7. Get Usage Stats**

```javascript
// GET /api/usage
const response = await fetch('/api/usage')
const data = await response.json()

// Response:
{
  "success": true,
  "usage": {
    // Campaigns
    "campaignsUsed": 2,
    "campaignsLimit": 5,
    "campaignsPercentage": 40,

    // AI Tools
    "aiToolsUsed": 1,
    "aiToolsLimit": 1,
    "aiToolsPercentage": 100,

    // Social Platforms
    "platformsConnected": 0,
    "platformsLimit": 3,

    // Storage
    "storageUsedMB": 0,
    "storageLimitMB": 100,
    "storagePercentage": 0,

    // API Usage
    "apiCallsThisMonth": 5,
    "tokensUsed": 2500,
    "estimatedCost": 0.05,
    "estimatedCostSaved": 0.11, // By using LM Studio

    // Plan Info
    "currentTier": "free",
    "billingCycle": "monthly",
    "nextBillingDate": null
  },
  "limits": {
    "campaigns": 5,
    "aiTools": 1,
    "platforms": 3,
    "storageMB": 100
  }
}
```

**Use this to:**
- Build usage meters
- Show progress bars
- Display cost savings
- Warn when approaching limits

---

## 🎨 UI Component Examples

### **Provider Card with Status Badge**

```tsx
function ProviderCard({ provider }: { provider: any }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">{provider.name}</h3>
        {provider.isLocked && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            🔒 {provider.required_tier}
          </span>
        )}
        {provider.isConfigured && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            ✅ Ready
          </span>
        )}
        {!provider.isConfigured && !provider.isLocked && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
            🔑 Setup Required
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{provider.description}</p>
    </div>
  )
}
```

### **API Key Input with Test Button**

```tsx
function ApiKeyInput({ provider }: { provider: any }) {
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  async function handleSave() {
    const response = await fetch('/api/ai-tools/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider.id,
        apiKey,
        configuration: {}
      })
    })
    const data = await response.json()
    if (data.success) {
      alert('Saved! Now test the connection.')
    }
  }

  async function handleTest() {
    setTesting(true)
    // First get the tool ID
    const listRes = await fetch('/api/ai-tools/list')
    const listData = await listRes.json()
    const tool = listData.providers.find((p: any) => p.provider_key === provider.provider_key && p.hasApiKey)

    const response = await fetch('/api/ai-tools/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: tool.id })
    })
    const data = await response.json()
    setTestResult(data)
    setTesting(false)
  }

  return (
    <div className="space-y-2">
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        onBlur={handleSave}
        placeholder={provider.setup_instructions.keyFormat}
        className="w-full px-4 py-2 border rounded"
      />
      {apiKey && (
        <button
          onClick={handleTest}
          disabled={testing}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      )}
      {testResult && (
        <div className={testResult.success ? 'text-green-600' : 'text-red-600'}>
          {testResult.success ? '✅' : '❌'} {testResult.message}
        </div>
      )}
    </div>
  )
}
```

### **Usage Progress Bar**

```tsx
function UsageBar({ label, current, limit }: any) {
  const percentage = (current / limit) * 100
  const color = percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{current} / {limit}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
```

---

## 🐛 Common Errors & Solutions

### **Error: "Unauthorized" (401)**
```javascript
// Solution: User not logged in
// Redirect to /login
router.push('/login')
```

### **Error: "AI tools limit exceeded" (403)**
```javascript
// Solution: User hit tier limit
// Show upgrade modal
<UpgradeModal tier="pro" />
```

### **Error: "This tool requires pro tier" (403)**
```javascript
// Solution: Tool is locked for user's tier
// Show locked badge and upgrade CTA
{provider.isLocked && (
  <button onClick={showUpgradeModal}>
    Unlock with Pro →
  </button>
)}
```

### **Error: "Invalid API key"**
```javascript
// Solution: API key format wrong or key invalid
// Show error message, let user re-enter
setErrorMessage('Invalid API key. Please check and try again.')
```

---

## 💡 Pro Tips

1. **Always show loading states:**
   ```tsx
   {loading ? 'Loading...' : 'Content'}
   ```

2. **Handle errors gracefully:**
   ```tsx
   try {
     const response = await fetch(...)
     const data = await response.json()
     if (!data.success) {
       setError(data.error)
     }
   } catch (error) {
     setError('Network error. Please try again.')
   }
   ```

3. **Refresh data after mutations:**
   ```tsx
   async function saveTool() {
     await fetch('/api/ai-tools/configure', ...)
     // Refresh the list
     await loadTools()
   }
   ```

4. **Use optimistic updates for better UX:**
   ```tsx
   setTools(prev => prev.map(t =>
     t.id === toolId ? { ...t, isConfigured: true } : t
   ))
   await fetch('/api/ai-tools/configure', ...)
   ```

---

## 🎯 Testing Checklist

Before shipping, test these scenarios:

- [ ] Load tools when user has 0 configured
- [ ] Load tools when user has 1 configured (LM Studio)
- [ ] Configure a new tool successfully
- [ ] Test connection success
- [ ] Test connection failure (wrong key)
- [ ] Hit tier limit (try to add 2nd tool on free tier)
- [ ] Update profile with all fields
- [ ] Update profile with validation error (bad URL)
- [ ] Load usage stats
- [ ] Display usage at 0%, 50%, 80%, 100%

---

**All APIs are live and working! Start building! 🚀**
