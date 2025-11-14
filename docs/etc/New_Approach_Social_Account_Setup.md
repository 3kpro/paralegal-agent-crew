Based on your description, you're trying to implement OAuth authentication flows for social media platforms rather than using direct API tokens. The issue is that facelessreels.com uses a proper OAuth flow (with redirect authentication), while your current implementation is asking users to manually enter profile names and bearer tokens, which is less secure and user-friendly.

The key difference is:
- **OAuth flow**: User clicks platform → redirected to platform's login → grants permission → redirected back to your site with authorization code → your server exchanges code for access token
- **Current approach**: Asking for bearer token manually (which exposes security credentials)

To fix this in your VS Code project:

1. You need to register your application with TikTok and Twitter/X developer platforms to get client ID and secret
2. Implement OAuth endpoints in your backend:
   - Authorization endpoint (to redirect users)
   - Callback endpoint (to handle redirect after authorization)
3. Use proper OAuth client libraries for your framework

I'll search for the most current implementation guides:

Based on the search results and your description, I see the core issue: you're trying to implement manual token entry instead of the proper OAuth 2.0 flow required by TikTok and Twitter/X. Modern social platforms **no longer support** manual bearer token entry for security reasons - they require the full OAuth authorization flow.

Here's what you need to fix in your VS Code project:

### Critical Implementation Steps for TikTok OAuth 2.0 (v2)
1. **Register your app** in [TikTok Developer Portal](https://developers.tiktok.com/)
   - Set exact redirect URI: `https://yourdomain.com/auth/tiktok/callback`
   - Get `client_key` and `client_secret` (store in `.env`)

2. **Create these backend endpoints** (Node.js/Express example):
```javascript
// 1. Redirect to TikTok auth
app.get('/auth/tiktok', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_ID,
    redirect_uri: 'https://yourdomain.com/auth/tiktok/callback',
    response_type: 'code',
    scope: 'video.upload',
    state: state
  });
  
  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`);
});

// 2. Handle callback
app.get('/auth/tiktok/callback', async (req, res) => {
  if (req.query.state !== req.session.oauthState) 
    return res.status(401).send('Invalid state');
  
  // Exchange code for token
  const tokenResponse = await axios.post(
    'https://open.tiktokapis.com/v2/oauth/token/',
    new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_ID,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://yourdomain.com/auth/tiktok/callback'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  
  // Save token to database (expires_in typically 3600s)
  await db.saveToken({
    open_id: tokenResponse.data.open_id,
    access_token: tokenResponse.data.access_token,
    refresh_token: tokenResponse.data.refresh_token
  });
  
  res.redirect('/dashboard?connected=tiktok');
});
```

### Twitter/X OAuth 2.0 Implementation
Twitter requires additional setup:
1. Enable OAuth 2.0 in [X Developer Portal](https://developer.twitter.com/)
2. Use PKCE flow (requires code verifier):
```javascript
// Generate code verifier (store in session)
const codeVerifier = generateCodeVerifier();
req.session.codeVerifier = codeVerifier;

// Redirect URL
const params = new URLSearchParams({
  client_id: process.env.TWITTER_CLIENT_ID,
  redirect_uri: 'https://yourdomain.com/auth/twitter/callback',
  response_type: 'code',
  scope: 'tweet.read users.read offline.access',
  state: state,
  code_challenge: generateCodeChallenge(codeVerifier),
  code_challenge_method: 'S256'
});
```

### Critical Fixes Needed in Your Current Implementation
- ❌ **Remove all manual token entry fields** (bearer tokens aren't user-accessible)
- ✅ Implement server-side token exchange (never expose client_secret)
- ✅ Use HTTPS for all endpoints (required by OAuth)
- ✅ Handle token refresh (TikTok tokens expire in 1 hour)
- ✅ Store tokens encrypted in database with user ID

### Migration Deadline Notice
- TikTok **v1 OAuth was discontinued February 29, 2024** (search result #2)
- Twitter's legacy API v1.1 was discontinued January 2023

Your current approach using manual tokens won't work because:
1. Modern platforms don't expose bearer tokens to users
2. Tokens require server-side exchange with client_secret
3. All tokens have short expiration (1 hour for TikTok)

[Download OAuth Implementation Checklist](https://example.com/oauth-checklist.pdf) (Sample template)