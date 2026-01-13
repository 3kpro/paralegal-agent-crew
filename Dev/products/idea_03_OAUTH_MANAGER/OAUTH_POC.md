# Auth Proof of Concept - OAuth Token Manager

## Overview
This document outlines the OAuth 2.0 discovery details for the primary platforms targeted by the OAuth Token Manager.

## 1. LinkedIn
LinkedIn uses a standard OAuth 2.0 flow. Access tokens typically expire in **60 days**.

- **Authorization URL**: `https://www.linkedin.com/oauth/v2/authorization`
- **Token URL**: `https://www.linkedin.com/oauth/v2/accessToken`
- **Discovery Endpoint**: `https://www.linkedin.com/oauth/.well-known/openid-configuration`
- **Suggested Scopes**:
  - `openid`: Basic authentication.
  - `profile`: Access to name and photo.
  - `email`: Access to primary email.
  - `w_member_social`: Permission to post updates (vital for monitoring health).
- **Refresh Behavior**: LinkedIn provides a `refresh_token` if the `offline_access` scope is requested (depending on the product version, check developer console).

## 2. TikTok
TikTok's API (V2) is specialized for creators.

- **Authorization URL**: `https://www.tiktok.com/v2/auth/authorize/`
- **Token URL**: `https://open.tiktokapis.com/v2/oauth/token/`
- **Discovery Endpoint**: N/A (Manual configuration required).
- **Suggested Scopes**:
  - `user.info.basic`: Basic profile info.
  - `video.list`: List user's videos (to verify account health).
  - `video.upload`: Only if management features are added later (Anti-scope for now).
- **Refresh Behavior**: TikTok returns a `refresh_token` which lasts for 1 year, while the `access_token` lasts for 24 hours.

## 3. Instagram (via Meta for Developers)
Instagram Graph API is used for Professional accounts.

- **Authorization URL**: `https://www.facebook.com/v18.0/dialog/oauth`
- **Token URL**: `https://graph.facebook.com/v18.0/oauth/access_token`
- **Suggested Scopes**:
  - `instagram_basic`: Read profile.
  - `instagram_content_publish`: (Anti-scope for now, but good for verification).
  - `pages_show_list`: To find the linked Instagram account.
- **Refresh Behavior**: Short-lived tokens (1-2 hours) can be exchanged for Long-lived tokens (60 days). Long-lived tokens can be refreshed.

---

## Technical Implementation Plan
1. **Redirect URI**: `https://<PROJECT_ID>.supabase.co/functions/v1/oauth-callback`
2. **State Management**: Use a signed JWT in the `state` parameter to prevent CSRF and store `user_id`.
3. **Storage**:
   - Store `client_id` and `client_secret` in Supabase Secrets (Environment Variables).
   - Store User tokens in `vault.secrets` (via the strategy defined in `STRATEGY.md`).
