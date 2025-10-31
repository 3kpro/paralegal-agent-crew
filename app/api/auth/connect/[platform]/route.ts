import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/auth/oauth";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") || "/onboarding";
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Validate platform
    const validPlatforms = ["twitter", "tiktok", "linkedin", "facebook", "instagram"];
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

    // Store code_verifier AND redirect path in cookies for callback (expires in 10 minutes)
    const cookieStore = await cookies();
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

    const oauthURLs: Record<string, string> = {
      tiktok:
        `https://open-api.tiktok.com/platform/oauth/connect?` +
        `client_key=${process.env.TIKTOK_CLIENT_KEY}` +
        `&scope=user.info.basic,video.list,video.upload` +
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
        `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
        `&scope=pages_manage_posts,pages_read_engagement,public_profile` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&state=${state}`,
      instagram:
        `https://api.instagram.com/oauth/authorize?` +
        `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
        `&scope=user_profile,user_media` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
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

    // Redirect to platform's OAuth page
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/error?message=Authentication failed`,
    );
  }
}
