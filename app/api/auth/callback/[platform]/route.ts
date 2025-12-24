import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    console.log(`[${platform}] OAuth callback started`);

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    // Get redirect path and validate state from cookies
    const cookieStore = await cookies();
    const redirect =
      cookieStore.get(`oauth_redirect_${platform}`)?.value || "/onboarding";
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;

    console.log(`[${platform}] Code received:`, code ? "Yes" : "No");
    console.log(`[${platform}] Error param:`, error || "None");
    console.log(`[${platform}] State validation:`, state === storedState ? "✓ Valid" : "✗ Invalid");
    console.log(`[${platform}] Redirect path:`, redirect);

    // Validate state parameter (CSRF protection)
    if (state !== storedState) {
      console.error(`[${platform}] State mismatch! Expected: ${storedState}, Got: ${state}`);
      cookieStore.delete(`oauth_state_${platform}`);
      cookieStore.delete(`oauth_redirect_${platform}`);
      cookieStore.delete(`oauth_verifier_${platform}`);
      return NextResponse.redirect(`${origin}${redirect}?error=state_mismatch`);
    }

    if (error || !code) {
      console.error("OAuth error:", error);
      cookieStore.delete(`oauth_state_${platform}`);
      cookieStore.delete(`oauth_redirect_${platform}`);
      cookieStore.delete(`oauth_verifier_${platform}`);
      return NextResponse.redirect(`${origin}${redirect}?error=auth_failed`);
    }

    // Get current user
    console.log(`[${platform}] Getting user from Supabase...`);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(`[${platform}] Auth error:`, authError);
      return NextResponse.redirect(`${origin}/login`);
    }
    console.log(`[${platform}] User authenticated:`, user.email);

    // Get code_verifier from cookie (required for PKCE)
    const codeVerifier = cookieStore.get(`oauth_verifier_${platform}`)?.value;
    console.log(
      `[${platform}] Code verifier found:`,
      codeVerifier ? "Yes" : "No",
    );

    // Exchange code for tokens
    console.log(`[${platform}] Exchanging code for tokens...`);
    const tokens = await exchangeToken(platform, code, origin, codeVerifier);
    console.log(
      `[${platform}] Tokens received:`,
      tokens.access_token ? "Yes" : "No",
    );

    // Clear the cookies
    cookieStore.delete(`oauth_state_${platform}`);
    cookieStore.delete(`oauth_verifier_${platform}`);
    cookieStore.delete(`oauth_redirect_${platform}`);

    // Fetch user profile from platform
    console.log(`[${platform}] Fetching user profile...`);
    const profile = await fetchUserProfile(platform, tokens.access_token);
    console.log(`[${platform}] Profile fetched:`, profile.username);

    // Get provider_id from social_providers table
    console.log(`[${platform}] Getting provider ID...`);
    const { data: provider, error: providerError } = await supabase
      .from("social_providers")
      .select("id")
      .eq("provider_key", platform)
      .single();

    if (providerError || !provider) {
      console.error(`[${platform}] Provider not found:`, providerError);
      return NextResponse.redirect(
        `${origin}${redirect}?error=provider_not_found`,
      );
    }

    // Encrypt tokens
    console.log(`[${platform}] Encrypting tokens...`);
    const { encryptAPIKey } = await import('@/lib/encryption');
    const encryptedAccessToken = encryptAPIKey(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encryptAPIKey(tokens.refresh_token) : null;

    // Store in user_social_connections with encrypted tokens
    console.log(`[${platform}] Saving to user_social_connections...`);
    const connectionData = {
      user_id: user.id,
      provider_id: provider.id,
      connection_name: `${profile.name} (@${profile.username})`,
      account_username: profile.username,
      account_id: profile.id,
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      is_active: true,
      test_status: 'pending',
      metadata: {
        name: profile.name,
        followers_count: profile.followers_count,
        profile_image_url: profile.profile_image_url,
        connected_at: new Date().toISOString(),
      },
    };

    const { error: insertError } = await supabase
      .from("user_social_connections")
      .upsert(connectionData, {
        onConflict: 'user_id,provider_id,connection_name',
      });

    if (insertError) {
      console.error(`[${platform}] Failed to save connection:`, insertError);
      return NextResponse.redirect(
        `${origin}${redirect}?error=save_failed&details=${encodeURIComponent(insertError.message)}`,
      );
    }

    console.log(`[${platform}] ✅ Connection saved successfully with encrypted tokens!`);

    // Track platform connection event
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: "platform_connected",
      event_category: "social",
      event_data: {
        platform,
        platform_username: profile.username,
        success: true,
      },
    });

    // Redirect back with success - always go to Settings > Connections tab
    return NextResponse.redirect(`${origin}/settings?tab=connections&connected=${platform}`);
  } catch (error: any) {
    console.error("========================================");
    console.error("OAuth callback error:", error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("========================================");
    return NextResponse.redirect(
      `${origin}/onboarding?error=connection_failed&details=${encodeURIComponent(error?.message || "Unknown error")}`,
    );
  }
}

async function exchangeToken(
  platform: string,
  code: string,
  origin: string,
  codeVerifier?: string,
) {
  const platformConfig = {
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      tokenUrl: "https://graph.facebook.com/v13.0/oauth/access_token",
    },
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      tokenUrl: "https://oauth2.googleapis.com/token",
    },
  };

  const config = platformConfig[platform as keyof typeof platformConfig];
  if (!config) {
    throw new Error(`Token exchange not implemented for ${platform}`);
  }

  const { clientId, clientSecret, tokenUrl } = config;
  const redirectUri = `${origin}/api/auth/callback/${platform}`;

  const params: Record<string, string> = {
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  // Platform-specific authentication
  if (platform === "tiktok") {
    params.client_id = clientId!;
    params.client_secret = clientSecret!;
  } else if (platform === "twitter") {
    // Twitter requires Basic Authentication header (NOT in body)
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );
    headers["Authorization"] = `Basic ${basicAuth}`;

    // Add PKCE code_verifier
    if (codeVerifier) {
      params.code_verifier = codeVerifier;
    }
  } else if (platform === "linkedin" || platform === "facebook" || platform === "instagram" || platform === "youtube") {
    // LinkedIn, Facebook, Instagram, YouTube use client_id and client_secret in body
    params.client_id = clientId!;
    params.client_secret = clientSecret!;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const data = await response.json();

  // For Facebook and Instagram, exchange short-lived token for long-lived token
  if (platform === "facebook" || platform === "instagram") {
    console.log(`[${platform}] Exchanging short-lived token for long-lived token...`);
    try {
      const longLivedUrl = `https://graph.facebook.com/v13.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${clientId}&` +
        `client_secret=${clientSecret}&` +
        `fb_exchange_token=${data.access_token}`;

      const llResponse = await fetch(longLivedUrl);
      if (llResponse.ok) {
        const llData = await llResponse.json();
        console.log(`[${platform}] Long-lived token received! Expiry: ${llData.expires_in}s`);
        return {
          ...data,
          access_token: llData.access_token,
          expires_in: llData.expires_in || 5184000, // Default 60 days
        };
      } else {
        console.error(`[${platform}] Long-lived token exchange failed:`, await llResponse.text());
        // Fallback to short-lived token
      }
    } catch (llError) {
      console.error(`[${platform}] Error exchanging long-lived token:`, llError);
      // Fallback to short-lived token
    }
  }

  return data;
}

async function fetchUserProfile(platform: string, accessToken: string) {
  if (platform === "twitter") {
    const response = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name,public_metrics",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Twitter profile");
    }

    const data = await response.json();
    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      profile_image_url: data.data.profile_image_url,
      followers_count: data.data.public_metrics?.followers_count || 0,
    };
  } else if (platform === "tiktok") {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,avatar_url,follower_count",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch TikTok profile");
    }

    const data = await response.json();
    return {
      id: data.data.open_id,
      name: data.data.display_name,
      username: data.data.username,
      profile_image_url: data.data.avatar_url,
      followers_count: data.data.follower_count || 0,
    };
  } else if (platform === "linkedin") {
    const response = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch LinkedIn profile");
    }

    const data = await response.json();
    return {
      id: data.sub,
      name: data.name,
      username: data.email?.split('@')[0] || data.given_name || 'user',
      profile_image_url: data.picture || '',
      followers_count: 0, // LinkedIn userinfo doesn't include follower count
    };
  } else if (platform === "facebook") {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/me?fields=id,name,picture&access_token=${accessToken}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Facebook profile");
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      username: data.name.toLowerCase().replace(/\s+/g, ''),
      profile_image_url: data.picture?.data?.url || '',
      followers_count: 0, // Basic profile doesn't include follower count
    };
  } else if (platform === "instagram") {
    // Instagram uses Facebook OAuth, so we need to get Facebook Pages first
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
    );

    if (!pagesResponse.ok) {
      throw new Error("Failed to fetch Facebook pages");
    }

    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook pages found. Instagram Business accounts must be linked to a Facebook Page.");
    }

    // Try to find Instagram Business Account from the first page
    const pageId = pagesData.data[0].id;
    const pageAccessToken = pagesData.data[0].access_token;

    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`,
    );

    const igData = await igResponse.json();
    const igAccountId = igData.instagram_business_account?.id;

    if (!igAccountId) {
      // No Instagram account linked, but we can still save the Facebook connection
      // Use Facebook Page info as fallback
      return {
        id: pageId,
        name: pagesData.data[0].name,
        username: pagesData.data[0].name.toLowerCase().replace(/\s+/g, '_'),
        profile_image_url: '',
        followers_count: 0,
      };
    }

    // Fetch Instagram Business Account details
    const igProfileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name&access_token=${pageAccessToken}`,
    );

    if (!igProfileResponse.ok) {
      throw new Error("Failed to fetch Instagram Business Account profile");
    }

    const igProfile = await igProfileResponse.json();
    return {
      id: igProfile.id,
      name: igProfile.name || igProfile.username,
      username: igProfile.username,
      profile_image_url: '',
      followers_count: 0,
    };
  } else if (platform === "youtube") {
    // Fetch YouTube channel info
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch YouTube profile");
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("No YouTube channel found for this account");
    }

    const channel = data.items[0];
    return {
      id: channel.id,
      name: channel.snippet.title,
      username: channel.snippet.customUrl?.replace('@', '') || channel.snippet.title.toLowerCase().replace(/\s+/g, '_'),
      profile_image_url: channel.snippet.thumbnails?.default?.url || '',
      followers_count: parseInt(channel.statistics?.subscriberCount || "0", 10),
    };
  }

  throw new Error(`Platform ${platform} not supported`);
}
