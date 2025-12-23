import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/auth/oauth";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") || "/onboarding";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Validate platform
    const validPlatforms = ["twitter", "tiktok", "linkedin", "facebook", "instagram", "youtube"];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: "Platform not supported" },
        { status: 400 },
      );
    }

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(`${origin}/login`);
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store state, code_verifier, and redirect path in cookies for callback (expires in 10 minutes)
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    cookieStore.set(`oauth_verifier_${platform}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    cookieStore.set(`oauth_redirect_${platform}`, redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Platform-specific OAuth URLs - NO query params in redirect_uri
    const callbackUrl = `${origin}/api/auth/callback/${platform}`;

    console.log(`[${platform}] OAuth Configuration:`);
    console.log(`  Origin: ${origin}`);
    console.log(`  Callback URL: ${callbackUrl}`);
    console.log(`  Client ID: ${platform === 'twitter' ? process.env.TWITTER_CLIENT_ID?.substring(0, 10) + '...' : 'N/A'}`);
    console.log(`  Code Challenge: ${codeChallenge.substring(0, 20)}...`);

    const oauthURLs: Record<string, string> = {
      tiktok:
        `https://www.tiktok.com/v1/oauth/authorize/?` +
        `client_key=${process.env.TIKTOK_CLIENT_KEY}` +
        `&scope=${encodeURIComponent("user.info.basic video.publish")}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}`,
      twitter:
        `https://twitter.com/i/oauth2/authorize?` +
        `client_id=${process.env.TWITTER_CLIENT_ID}` +
        `&scope=tweet.read%20tweet.write%20users.read%20offline.access` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`,
      linkedin:
        `https://www.linkedin.com/oauth/v2/authorization?` +
        `client_id=${process.env.LINKEDIN_CLIENT_ID}` +
        `&scope=openid%20profile%20email%20w_member_social` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}`,
      facebook:
        `https://www.facebook.com/v13.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
        `&scope=public_profile` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}`,
      instagram:
        `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
        `&scope=user_profile,user_media` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}`,
      youtube:
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.YOUTUBE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent("https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile")}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`,
    };

    // Check if OAuth URL exists for platform
    const oauthUrl = oauthURLs[platform];
    if (!oauthUrl) {
      return NextResponse.json(
        {
          error: `OAuth not configured for ${platform}`,
          message: `Please contact support to enable ${platform} integration.`
        },
        { status: 501 }, // Not Implemented
      );
    }

    // Check if required OAuth credentials are configured
    if (oauthUrl.includes('undefined')) {
      return NextResponse.json(
        {
          error: `${platform} OAuth credentials not configured`,
          message: `Please add ${platform.toUpperCase()}_CLIENT_ID to environment variables.`
        },
        { status: 500 },
      );
    }

    console.log(`[${platform}] Redirecting to OAuth URL (first 150 chars):`, oauthUrl.substring(0, 150));
    console.log(`[${platform}] Full OAuth URL:`, oauthUrl);

    // Redirect to platform's OAuth page
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/error?message=Authentication failed`,
    );
  }
}
