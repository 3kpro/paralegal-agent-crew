# CCAI Social Connections Architecture
**Version**: 1.0
**Date**: 2025-11-17
**Status**: Planning

---

## Executive Summary

Implement Make.com-style "Connections" system to enable multi-platform social publishing in CCAI/TrendPulse. Leverages existing encrypted key infrastructure (`user_ai_tools` pattern) and extends Settings UI with new "Connections" tab.

**Key Insight**: This is NOT a greenfield project. We already have 90% of the required infrastructure from AI Tools implementation.

---

## Core Architecture

### 1. Database Extension

**Extend existing `user_ai_tools` pattern to support social platforms:**

```sql
-- New table: social_providers (parallel to ai_providers)
CREATE TABLE social_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key TEXT UNIQUE NOT NULL, -- 'instagram', 'tiktok', 'youtube', etc.
  name TEXT NOT NULL,
  logo_url TEXT,
  auth_type TEXT NOT NULL, -- 'oauth' or 'custom_app'
  oauth_config JSONB, -- { authUrl, tokenUrl, scopes[] }
  required_tier TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend user_ai_tools to support social connections
-- OR create new table user_social_connections with same structure
CREATE TABLE user_social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES social_providers(id),

  -- OAuth tokens (encrypted like AI keys)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Custom app credentials (for Instagram/Facebook)
  client_id_encrypted TEXT,
  client_secret_encrypted TEXT,

  -- Metadata
  connection_name TEXT NOT NULL, -- "My Instagram", "James' TikTok"
  account_username TEXT, -- Platform username for display
  scopes TEXT[], -- Granted permissions

  -- Status
  is_active BOOLEAN DEFAULT true,
  test_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  last_tested_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider_id, connection_name)
);

-- RLS policies (same pattern as user_ai_tools)
ALTER TABLE user_social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON user_social_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON user_social_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON user_social_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON user_social_connections
  FOR DELETE USING (auth.uid() = user_id);
```

---

### 2. Capability Registry

**JSON files defining platform capabilities (reuse AI tools pattern):**

```
libs/
  capabilities/
    social/
      instagram.json
      tiktok.json
      youtube.json
      facebook.json
      linkedin.json
      twitter.json
```

**Example: `instagram.json`**
```json
{
  "platform": "instagram",
  "display_name": "Instagram",
  "auth_type": "custom_app",
  "docs_url": "https://developers.facebook.com/docs/instagram-api",
  "setup_instructions": [
    "Create a Facebook App",
    "Add Instagram Basic Display or Instagram Graph API",
    "Get App ID and App Secret",
    "Configure OAuth redirect URI"
  ],
  "oauth": {
    "auth_url": "https://api.instagram.com/oauth/authorize",
    "token_url": "https://api.instagram.com/oauth/access_token",
    "required_scopes": [
      "instagram_basic",
      "instagram_content_publish",
      "pages_read_engagement"
    ]
  },
  "actions": {
    "publish_photo": {
      "endpoint": "https://graph.facebook.com/v21.0/{ig-user-id}/media",
      "method": "POST",
      "description": "Publish a photo to Instagram feed",
      "fields": ["image_url", "caption", "location_id"]
    },
    "publish_reel": {
      "endpoint": "https://graph.facebook.com/v21.0/{ig-user-id}/media",
      "method": "POST",
      "description": "Publish a video reel to Instagram",
      "fields": ["video_url", "caption", "cover_url"]
    }
  }
}
```

---

### 3. Backend API Routes

**Extend `/api/social-connections/` (parallel to `/api/ai-tools/`):**

```
app/api/social-connections/
  list/route.ts           # GET - List user's connections
  configure/route.ts      # POST - Add new connection
  test/route.ts           # POST - Test connection validity
  delete/route.ts         # DELETE - Remove connection
  oauth/
    [platform]/
      start/route.ts      # GET - Initiate OAuth flow
      callback/route.ts   # GET - Handle OAuth callback
      refresh/route.ts    # POST - Refresh expired token
```

**Key Implementation Notes:**
- Reuse `encryptAPIKey()` / `decryptAPIKey()` from `lib/encryption.ts`
- Reuse Supabase RLS patterns from AI tools
- OAuth callbacks store tokens encrypted in `user_social_connections`
- Custom app setup (Instagram/Facebook) uses same UX as OpenAI key entry

---

### 4. Publishing Engine

**New service: `/api/publish/route.ts`**

```typescript
// Receives optimized content from TrendPulse
// Routes to appropriate platform publisher
// Handles retry + token refresh

POST /api/publish
{
  "connectionId": "uuid",
  "platform": "instagram",
  "content": {
    "type": "photo",
    "image_url": "...",
    "caption": "Generated by TrendPulse..."
  },
  "scheduled_at": "2025-11-20T10:00:00Z" // optional
}
```

**Platform Publishers:**
```
lib/publishers/
  instagram.publisher.ts
  tiktok.publisher.ts
  youtube.publisher.ts
  facebook.publisher.ts
  linkedin.publisher.ts
```

Each publisher:
1. Loads connection from DB
2. Decrypts access token
3. Loads capability definition
4. Adapts TrendPulse content → platform API format
5. Executes POST with retry logic
6. Auto-refreshes token if expired
7. Updates `last_published_at` timestamp

---

### 5. Frontend UI Extension

**Settings → Connections Tab** (new)

```tsx
app/(portal)/settings/page.tsx
  - Add "Connections" tab (alongside Profile, API Keys, Membership)

components/settings/
  ConnectionsTab.tsx          # Main connections manager
  ConnectionGrid.tsx          # Grid of available platforms
  ConnectionCard.tsx          # Individual platform tile
  AddConnectionModal.tsx      # OAuth flow or custom app setup
  TestConnectionButton.tsx    # Verify connection works
  ConnectionStatus.tsx        # Connected/Disconnected badge
```

**UX Flow:**
1. User clicks "Connections" tab
2. Sees grid of platforms (Instagram, TikTok, YouTube, etc.)
3. Each tile shows:
   - Platform logo
   - Connection status (Connected / Not Connected)
   - "Connect" or "Reconnect" button
   - "Test" and "Remove" buttons (if connected)
4. Click "Connect" → Modal opens:
   - **OAuth platforms**: Redirect to platform auth
   - **Custom app platforms**: Form for Client ID/Secret (like OpenAI key entry)
5. After connecting → Show "Test Connection" to verify
6. Connected platforms appear in Campaign publishing flow

---

### 6. Campaign Integration

**Update Campaign Creation Flow:**

```tsx
app/(portal)/campaigns/new/page.tsx

// After content generation (Card 7)
// Add new Card 8: "Publish"

<PublishCard
  platforms={connectedPlatforms}  // From user_social_connections
  content={generatedContent}       // From TrendPulse
  onPublish={handlePublish}
/>
```

**Publish Options:**
- **Publish Now**: Immediate POST to selected platforms
- **Schedule**: Store in `scheduled_posts` table, cron job handles publishing
- **Save as Draft**: Store in `campaigns` table without publishing

---

## Migration Path

### Phase 1: Database & Capability Registry ✅ COMPLETE
- ✅ Create `social_providers` and `user_social_connections` tables
- ✅ Seed `social_providers` with 6 platforms (Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter)
- ✅ Create JSON capability files (instagram.json complete with 4 content types)
- ✅ Write migration script (20251117100400_social_connections_system.sql applied)

### Phase 2: Backend API 🔄 IN PROGRESS (50% complete)
- ⏳ `/api/social-connections/list` - TODO
- ✅ `/api/social-connections/configure` (custom app setup) - DONE
- ✅ `/api/social-connections/test` - DONE
- ⏳ `/api/social-connections/delete` - TODO (already handled by ConnectionCard directly)

### Phase 3: OAuth Implementation ⏳ PENDING
- Instagram OAuth flow
- Test with one platform end-to-end
- Add remaining platforms incrementally

### Phase 4: Publishing Engine ⏳ PENDING
- `/api/publish` route
- Instagram publisher (first)
- Retry + token refresh logic
- Expand to other platforms

### Phase 5: Frontend UI ✅ COMPLETE
- ✅ Settings → Connections tab (integrated into Settings page)
- ✅ Connection grid + modals (ConnectionGrid, AddConnectionModal)
- ✅ Test connection functionality (ConnectionCard with Test button)
- ⏳ Campaign publishing integration - TODO

---

## Reusable Components

**Already Built (from AI Tools):**
- ✅ Encrypted key storage (AES-256-GCM)
- ✅ Supabase RLS patterns
- ✅ Settings UI tab structure
- ✅ Test/configure/delete workflows
- ✅ InstructionCard component
- ✅ Tier-based access control

**New Components Built (Social Connections):**
- ✅ Connection grid UI (ConnectionGrid.tsx)
- ✅ Connection card with actions (ConnectionCard.tsx)
- ✅ Add connection modal (AddConnectionModal.tsx)
- ✅ Connections tab manager (ConnectionsTab.tsx)
- ✅ Configure API route (encrypts Client ID/Secret)
- ✅ Test connection API route (validates credentials)

**Still to Build:**
- OAuth broker routes (/oauth/[platform]/start, /callback, /refresh)
- Platform-specific publishers (lib/publishers/*.publisher.ts)
- Publishing scheduler (cron job for scheduled_posts)

---

## Security Considerations

1. **Token Encryption**: Reuse existing `encryptAPIKey()` for access/refresh tokens
2. **Callback Validation**: Verify state parameter in OAuth callbacks
3. **Scope Minimization**: Only request necessary permissions
4. **Token Refresh**: Auto-refresh before expiration, not on failure
5. **Rate Limiting**: Implement per-platform rate limits
6. **Audit Logging**: Track all publishing events

---

## Success Metrics

- User can connect Instagram via custom app setup
- User can publish generated content to Instagram
- Token refresh works automatically
- Connection test shows success/failure accurately
- Publishing errors show helpful messages

---

## Open Questions

1. **Do we support multi-account per platform?** (e.g., 2 Instagram accounts)
   - **Answer**: Yes, via `connection_name` uniqueness constraint

2. **How do we handle platform API changes?**
   - **Answer**: Capability JSON files are versioned, easy to update

3. **What happens if user revokes access on platform side?**
   - **Answer**: Test connection returns error, prompts reconnect

4. **Do we support team/organization-level connections?**
   - **Answer**: Phase 2 feature, not MVP

---

## References

- Make.com OAuth Flow: https://www.make.com/en/help/app/oauth
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- TikTok Content Posting: https://developers.tiktok.com/doc/content-posting-api-get-started
- YouTube Data API: https://developers.google.com/youtube/v3

---

**END OF ARCHITECTURE DOCUMENT**
