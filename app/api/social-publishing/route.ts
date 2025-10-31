import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper function to publish to social media platforms
async function publishToSocialMedia(
  accountId: string,
  platform: string,
  queueId: string,
  content: string,
  mediaUrls: string[],
) {
  const supabase = await createClient();

  try {
    // Get account details and access token
    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("access_token, platform_user_id, platform_username, user_id")
      .eq("id", accountId)
      .single();

    if (accountError || !account) {
      throw new Error(`Account not found: ${accountError?.message}`);
    }

    let platformPostId: string | null = null;

    // Platform-specific posting
    if (platform === "twitter") {
      // Post to Twitter API v2
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          // TODO: Add media support when mediaUrls is not empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      platformPostId = data.data?.id;

      console.log(
        `✅ Successfully posted to Twitter (${account.platform_username}):`,
        platformPostId,
      );
    } else {
      throw new Error(`Platform ${platform} not yet supported for publishing`);
    }

    // Update queue status to published
    await supabase
      .from("social_publishing_queue")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        platform_post_id: platformPostId,
      })
      .eq("id", queueId);

    // Track successful publishing event
    await supabase.from("analytics_events").insert({
      user_id: account.user_id,
      event_type: "content_published",
      event_category: "content",
      event_data: {
        platform,
        platform_post_id: platformPostId,
        success: true,
      },
    });

    // Increment daily usage metric
    await supabase.rpc("increment_usage_metric", {
      p_user_id: account.user_id,
      p_metric_type: "content_published",
      p_increment: 1,
    });
  } catch (error: any) {
    console.error(`❌ Failed to publish to ${platform}:`, error.message);

    // Update queue status to failed
    await supabase
      .from("social_publishing_queue")
      .update({
        status: "failed",
        error_message: error.message,
        retry_count: 1,
      })
      .eq("id", queueId);

    // Track failed publishing event
    if (account) {
      await supabase.from("analytics_events").insert({
        user_id: account.user_id,
        event_type: "content_published",
        event_category: "content",
        event_data: {
          platform,
          success: false,
          error: error.message,
        },
      });
    }
  }
}

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
    const {
      social_account_ids,
      content,
      media_urls = [],
      scheduled_for,
      campaign_id,
    } = body;

    if (
      !social_account_ids ||
      !Array.isArray(social_account_ids) ||
      social_account_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "No social accounts specified" },
        { status: 400 },
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 },
      );
    }

    // Verify user owns all specified social accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("id, platform, is_active")
      .eq("user_id", user.id)
      .in("id", social_account_ids);

    if (accountsError) {
      console.error("Failed to verify social accounts:", accountsError);
      return NextResponse.json(
        { error: "Failed to verify social accounts" },
        { status: 500 },
      );
    }

    if (accounts.length !== social_account_ids.length) {
      return NextResponse.json(
        { error: "Some social accounts not found or not owned by user" },
        { status: 403 },
      );
    }

    // Check if all accounts are active
    const inactiveAccounts = accounts.filter((acc) => !acc.is_active);
    if (inactiveAccounts.length > 0) {
      return NextResponse.json(
        {
          error: "Some social accounts are inactive",
          inactive_accounts: inactiveAccounts,
        },
        { status: 400 },
      );
    }

    const publishingTasks = [];

    // Create publishing queue entries for each account
    for (const account of accounts) {
      const isScheduled = scheduled_for && new Date(scheduled_for) > new Date();

      const { data: queueEntry, error: queueError } = await supabase
        .from("social_publishing_queue")
        .insert({
          user_id: user.id,
          campaign_id: campaign_id || null, // Explicitly set null if undefined
          social_account_id: account.id,
          content,
          media_urls,
          scheduled_for: scheduled_for || null,
          status: isScheduled ? "scheduled" : "publishing",
          metadata: {
            platform: account.platform,
            content_length: content.length,
            has_media: media_urls.length > 0,
          },
        })
        .select()
        .single();

      if (queueError) {
        console.error("Failed to create queue entry:", queueError);
        continue;
      }

      publishingTasks.push({
        account_id: account.id,
        platform: account.platform,
        queue_id: queueEntry.id,
        status: isScheduled ? "scheduled" : "publishing",
      });

      // If not scheduled, publish immediately
      if (!isScheduled) {
        // Publish asynchronously (don't block response)
        publishToSocialMedia(
          account.id,
          account.platform,
          queueEntry.id,
          content,
          media_urls,
        ).catch((error) =>
          console.error(`Failed to publish to ${account.platform}:`, error),
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Publishing to ${publishingTasks.length} social accounts`,
      tasks: publishingTasks,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get("campaign_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("social_publishing_queue")
      .select(
        `
        *,
        social_accounts (
          platform,
          account_name,
          account_handle
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (campaign_id) {
      query = query.eq("campaign_id", campaign_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: queue, error } = await query;

    if (error) {
      console.error("Failed to fetch publishing queue:", error);
      return NextResponse.json(
        { error: "Failed to fetch publishing queue" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, queue });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
