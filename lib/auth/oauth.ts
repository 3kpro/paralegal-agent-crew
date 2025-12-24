import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

export function generateState() {
  return nanoid(32);
}

export function verifyState(state: string | null) {
  // State verification should be handled via secure cookies
  return state !== null && state.length >= 16;
}

// PKCE helper functions for Twitter OAuth 2.0
export function generateCodeVerifier(): string {
  // Generate a random 43-128 character string (Twitter requires min 43)
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const length = 128; // Use max length for security
  const values = new Uint8Array(length);
  
  // Use browser crypto API
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(values);
  } else {
    // Node.js environment fallback
     
    const crypto = require('crypto');
    crypto.randomFillSync(values);
  }
  
  return Array.from(values)
    .map((v) => possible[v % possible.length])
    .join("");
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  // Twitter requires S256 method (SHA-256 hash)
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } else {
    // Node.js environment
     
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(verifier).digest('base64');
    return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface PlatformProfile {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  followers_count?: number;
}

export async function exchangeCodeForTokens(
  platform: string,
  code: string,
): Promise<TokenResponse> {
  const clientId =
    platform === "tiktok"
      ? process.env.TIKTOK_CLIENT_KEY
      : process.env.TWITTER_CLIENT_ID;

  const clientSecret =
    platform === "tiktok"
      ? process.env.TIKTOK_CLIENT_SECRET
      : process.env.TWITTER_CLIENT_SECRET;

  const tokenUrl =
    platform === "tiktok"
      ? "https://open.tiktokapis.com/v2/oauth/token/"
      : "https://api.twitter.com/2/oauth2/token";

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${platform}`;

  const body = new URLSearchParams({
    code,
    client_id: clientId!,
    client_secret: clientSecret!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  platform: string,
  refreshToken: string
): Promise<TokenResponse> {
  const platformConfig: Record<string, { clientId: string; clientSecret: string; tokenUrl: string }> = {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      tokenUrl: 'https://graph.facebook.com/v13.0/oauth/access_token',
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID!,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
      tokenUrl: 'https://oauth2.googleapis.com/token',
    },
  };

  const config = platformConfig[platform];
  if (!config) {
    throw new Error(`Token refresh not supported for ${platform}`);
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken, // Use token directly - no encryption
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  return response.json();
}

export async function storeTokens(
  userId: string,
  platform: string,
  tokens: TokenResponse,
  profile: PlatformProfile
) {
  const supabase = createClient();

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  // Store tokens directly - Supabase RLS handles security
  const { error } = await supabase.from("social_accounts").upsert(
    {
      user_id: userId,
      platform,
      platform_user_id: profile.id,
      platform_username: profile.username,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: expiresAt,
      is_active: true,
      metadata: {
        name: profile.name,
        followers_count: profile.followers_count || 0,
        profile_image_url: profile.profile_image_url || '',
        last_token_refresh: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,platform,platform_user_id',
    }
  );

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

export async function getValidToken(
  userId: string,
  platform: string
): Promise<string> {
  // Use server client for API routes
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();

  // Query user_social_connections with provider join
  const { data: connection, error } = await supabase
    .from('user_social_connections')
    .select(`
      id,
      access_token_encrypted,
      refresh_token_encrypted,
      token_expires_at,
      is_active,
      social_providers!inner(provider_key)
    `)
    .eq('user_id', userId)
    .eq('social_providers.provider_key', platform)
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    throw new Error('Social account not found');
  }

  // Import decrypt function
  const { decryptAPIKey } = await import('@/lib/encryption');

  // Decrypt the access token
  let accessToken = decryptAPIKey(connection.access_token_encrypted);

  // Check if token is expired
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (now.getTime() >= expiresAt.getTime() - bufferTime) {
      // Token is expired or about to expire, refresh it
      if (connection.refresh_token_encrypted) {
        try {
          const refreshToken = decryptAPIKey(connection.refresh_token_encrypted);
          const newTokens = await refreshAccessToken(platform, refreshToken);

          // Import encrypt function
          const { encryptAPIKey } = await import('@/lib/encryption');

          // Update with new tokens - encrypted
          const newExpiresAt = newTokens.expires_in
            ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
            : null;

          await supabase
            .from('user_social_connections')
            .update({
              access_token_encrypted: encryptAPIKey(newTokens.access_token),
              refresh_token_encrypted: newTokens.refresh_token ? encryptAPIKey(newTokens.refresh_token) : null,
              token_expires_at: newExpiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', connection.id);

          accessToken = newTokens.access_token;
        } catch (refreshError) {
          // Refresh failed, mark account as inactive
          await supabase
            .from('user_social_connections')
            .update({ is_active: false })
            .eq('id', connection.id);

          throw new Error('Token expired and refresh failed. Please reconnect your account.');
        }
      } else {
        // No refresh token available
        await supabase
          .from('user_social_connections')
          .update({ is_active: false })
          .eq('id', connection.id);

        throw new Error('Token expired. Please reconnect your account.');
      }
    }
  }

  return accessToken;
}
