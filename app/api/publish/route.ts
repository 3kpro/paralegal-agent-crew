import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Publish a scheduled post immediately
 * POST /api/publish
 * Body: { post_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 },
      );
    }

    // Get the scheduled post
    const { data: post, error: postError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", post_id)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found or access denied" },
        { status: 404 },
      );
    }

    // Check if post can be published
    if (post.status === "published") {
      return NextResponse.json(
        { error: "Post already published" },
        { status: 400 },
      );
    }

    // Update status to publishing
    await supabase
      .from("scheduled_posts")
      .update({ status: "publishing" })
      .eq("id", post_id);

    // Get social account for this platform
    let socialAccount;
    if (post.social_account_id) {
      // Use specific account if provided
      const { data: account } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("id", post.social_account_id)
        .eq("user_id", user.id)
        .single();
      socialAccount = account;
    } else {
      // Find any active account for this platform
      const { data: account } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", post.platform)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();
      socialAccount = account;
    }

    if (!socialAccount) {
      await supabase
        .from("scheduled_posts")
        .update({
          status: "failed",
          failed_reason: `No active ${post.platform} account found`,
        })
        .eq("id", post_id);

      return NextResponse.json(
        { error: `No active ${post.platform} account found. Please connect a ${post.platform} account first.` },
        { status: 400 },
      );
    }

    // Publish to platform
    try {
      const result = await publishToPlatform(
        post.platform,
        post.content,
        socialAccount.access_token,
      );

      // Update post with success status
      await supabase
        .from("scheduled_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          platform_post_id: result.post_id,
          platform_url: result.url,
        })
        .eq("id", post_id);

      return NextResponse.json({
        success: true,
        message: "Post published successfully",
        platform_post_id: result.post_id,
        platform_url: result.url,
      });
    } catch (error: any) {
      // Update post with failure status
      await supabase
        .from("scheduled_posts")
        .update({
          status: "failed",
          failed_reason: error.message,
        })
        .eq("id", post_id);

      return NextResponse.json(
        { error: `Failed to publish: ${error.message}` },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Platform-specific publishing logic
 */
async function publishToPlatform(
  platform: string,
  content: string,
  accessToken: string,
): Promise<{ post_id: string; url: string }> {
  if (platform === "twitter") {
    return await publishToTwitter(content, accessToken);
  } else if (platform === "linkedin") {
    return await publishToLinkedIn(content, accessToken);
  } else {
    throw new Error(`Platform "${platform}" is not yet supported for publishing`);
  }
}

/**
 * Publish to Twitter (X) API v2
 */
async function publishToTwitter(
  content: string,
  accessToken: string,
): Promise<{ post_id: string; url: string }> {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Twitter API error: ${errorData.detail || errorData.title || JSON.stringify(errorData)}`,
    );
  }

  const data = await response.json();
  const postId = data.data?.id;

  if (!postId) {
    throw new Error("Twitter API did not return a post ID");
  }

  return {
    post_id: postId,
    url: `https://twitter.com/i/web/status/${postId}`,
  };
}

/**
 * Publish to LinkedIn API
 */
async function publishToLinkedIn(
  content: string,
  accessToken: string,
): Promise<{ post_id: string; url: string }> {
  // First, get the user's LinkedIn ID
  const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to get LinkedIn profile");
  }

  const profile = await profileResponse.json();
  const authorUrn = `urn:li:person:${profile.id}`;

  // Create the post
  const response = await fetch(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `LinkedIn API error: ${errorData.message || JSON.stringify(errorData)}`,
    );
  }

  const data = await response.json();
  const postId = data.id;

  return {
    post_id: postId,
    url: `https://www.linkedin.com/feed/update/${postId}`,
  };
}
