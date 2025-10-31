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

    // Get redirect path from cookie
    const cookieStore = await cookies();
    const redirect =
      cookieStore.get(`oauth_redirect_${platform}`)?.value || "/onboarding";

    console.log(`[${platform}] Code received:`, code ? "Yes" : "No");
    console.log(`[${platform}] Error param:`, error || "None");
    console.log(`[${platform}] Redirect path:`, redirect);

    if (error || !code) {
      console.error("OAuth error:", error);
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
    cookieStore.delete(`oauth_verifier_${platform}`);
    cookieStore.delete(`oauth_redirect_${platform}`);

    // Fetch user profile from platform
    console.log(`[${platform}] Fetching user profile...`);
    const profile = await fetchUserProfile(platform, tokens.access_token);
    console.log(`[${platform}] Profile fetched:`, profile.username);

    // Store account in Supabase - tokens stored directly (Supabase handles security)
    console.log(`[${platform}] Saving to database...`);
    const accountData = {
      user_id: user.id,
      platform: platform,
      platform_user_id: profile.id,
      platform_username: profile.username,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      is_active: true,
      metadata: {
        name: profile.name,
        followers: profile.followers_count,
        profile_image: profile.profile_image_url,
        setup_date: new Date().toISOString(),
      },
    };
    console.log(
      `[${platform}] Account data:`,
      JSON.stringify({ ...accountData, access_token: '[HIDDEN]', refresh_token: accountData.refresh_token ? '[HIDDEN]' : null }, null, 2),
    );

    const { error: insertError } = await supabase
      .from("social_accounts")
      .upsert(accountData, {
        onConflict: 'user_id,platform,platform_user_id',
      });

    if (insertError) {
      console.error(`[${platform}] Failed to save account:`, insertError);
      return NextResponse.redirect(
        `${origin}${redirect}?error=save_failed&details=${encodeURIComponent(insertError.message)}`,
      );
    }

    console.log(`[${platform}] ✅ Account saved successfully with encrypted tokens!`);

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

    // Redirect back with success
    return NextResponse.redirect(`${origin}${redirect}?connected=${platform}`);
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
      tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
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
      tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    },
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      tokenUrl: "https://api.instagram.com/oauth/access_token",
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
  } else if (platform === "linkedin" || platform === "facebook" || platform === "instagram") {
    // LinkedIn, Facebook, Instagram use client_id and client_secret in body
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

  return response.json();
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
      "https://open-api.tiktok.com/oauth/userinfo/",
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
      `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`,
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
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Instagram profile");
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.username,
      username: data.username,
      profile_image_url: '',
      followers_count: 0, // Basic Display API doesn't include follower count
    };
  }

  throw new Error(`Platform ${platform} not supported`);
}
