import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptAPIKey } from "@/lib/encryption";

// Helper function to publish to social media platforms
async function publishToSocialMedia(
  accountId: string,
  platform: string,
  queueId: string,
  content: string,
  mediaUrls: string[],
  tiktokMetadata?: any,
) {
  const supabase = await createClient();

  try {
    console.log(`[Publishing] Starting publish for connection ${accountId} (${platform})`);

    // Get connection details and encrypted access token from user_social_connections
    const { data: connection, error: connectionError } = await supabase
      .from("user_social_connections")
      .select(`
        id,
        user_id,
        user_id,
        account_username,
        account_id,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        social_providers!inner(provider_key)
      `)
      .eq("id", accountId)
      .single();

    if (connectionError || !connection) {
      console.error(`[Publishing] Connection not found:`, connectionError);
      throw new Error(`Connection not found: ${connectionError?.message}`);
    }

    console.log(`[Publishing] Found connection for @${connection.account_username}`);

    // Decrypt access token
    if (!connection.access_token_encrypted) {
      throw new Error("No access token found for this connection");
    }

    const accessToken = await decryptAPIKey(connection.access_token_encrypted);
    console.log(`[Publishing] Decrypted access token (length: ${accessToken.length})`);

    let platformPostId: string | null = null;

    // Platform-specific posting
    if (platform === "twitter") {
      console.log(`[Publishing] Posting to Twitter API v2...`);
      console.log(`[Publishing] Content: "${content.substring(0, 50)}..."`);

      // Post to Twitter API v2
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          // TODO: Add media support when mediaUrls is not empty
        }),
      });

      console.log(`[Publishing] Twitter API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[Publishing] Twitter API error:`, errorData);
        throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      platformPostId = data.data?.id;

      console.log(
        `✅ Successfully posted to Twitter (${connection.account_username}):`,
        platformPostId,
      );
    } else if (platform === "facebook") {
      console.log(`[Publishing] Posting to Facebook Graph API...`);

      // Using account_id which serves as Page ID or User ID (for test users)
      const targetId = connection.account_id; 
      if (!targetId) throw new Error("No Facebook Account ID found for this connection");

      const fbUrl = `https://graph.facebook.com/v19.0/${targetId}/feed`;
      
      // Basic text post
      const response = await fetch(fbUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              message: content,
              access_token: accessToken
          })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[Publishing] Facebook API error:`, errorData);
        throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      platformPostId = data.id;
      
      console.log(`✅ Successfully posted to Facebook: ${platformPostId}`);

    } else if (platform === "tiktok") {
      console.log(`[Publishing] Posting to TikTok Content Posting API...`);

      // TikTok requires video URL from verified domain
      if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error("TikTok requires a video URL. Please provide media_urls.");
      }

      const videoUrl = mediaUrls[0];
      console.log(`[Publishing] Video URL: ${videoUrl}`);

      // Initialize video upload
      const initUrl = "https://open.tiktokapis.com/v2/post/publish/video/init/";

      const postInfo: any = {
        title: content,
        privacy_level: tiktokMetadata?.privacy_level || "PUBLIC_TO_EVERYONE",
        disable_comment: tiktokMetadata?.disable_comment || false,
        disable_duet: tiktokMetadata?.disable_duet || false,
        disable_stitch: tiktokMetadata?.disable_stitch || false,
        video_cover_timestamp_ms: 1000,
      };

      // Apply branded content settings if provided
      if (tiktokMetadata?.brand_content_toggle) {
        postInfo.brand_content_toggle = true;
        postInfo.brand_organic_toggle = tiktokMetadata.brand_organic_toggle || false;
      }

      console.log(`[Publishing] TikTok post info:`, JSON.stringify(postInfo, null, 2));

      const initResponse = await fetch(initUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: postInfo,
          source_info: {
            source: "FILE_URL",
            video_url: videoUrl,
          }
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        console.error(`[Publishing] TikTok API error:`, errorData);
        throw new Error(`TikTok API error: ${JSON.stringify(errorData)}`);
      }

      const initData = await initResponse.json();
      platformPostId = initData.data?.publish_id;

      console.log(
        `✅ Successfully initiated TikTok upload (${connection.account_username}):`,
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
      user_id: connection.user_id,
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
      p_user_id: connection.user_id,
      p_metric_type: "content_published",
      p_increment: 1,
    });

    // Update connection usage stats
    const { data: currentConnection } = await supabase
      .from("user_social_connections")
      .select("usage_count")
      .eq("id", accountId)
      .single();

    await supabase
      .from("user_social_connections")
      .update({
        usage_count: (currentConnection?.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", accountId);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to publish to ${platform}:`, message);

    // Update queue status to failed
    await supabase
      .from("social_publishing_queue")
      .update({
        status: "failed",
        error_message: message,
        retry_count: 1,
      })
      .eq("id", queueId);

    // Track failed publishing event
    // Get connection for user_id (connection might not be defined if error was early)
    const { data: errorConnection } = await supabase
      .from("user_social_connections")
      .select("user_id")
      .eq("id", accountId)
      .single();

    if (errorConnection) {
      await supabase.from("analytics_events").insert({
        user_id: errorConnection.user_id,
        event_type: "content_published",
        event_category: "content",
        event_data: {
          platform,
          success: false,
          error: message,
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
      tiktok_metadata,
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

    // Verify user owns all specified social connections
    const { data: connections, error: connectionsError } = await supabase
      .from("user_social_connections")
      .select(`
        id,
        is_active,
        social_providers!inner(provider_key)
      `)
      .eq("user_id", user.id)
      .in("id", social_account_ids);

    if (connectionsError) {
      console.error("Failed to verify social connections:", connectionsError);
      return NextResponse.json(
        { error: "Failed to verify social connections" },
        { status: 500 },
      );
    }

    if (connections.length !== social_account_ids.length) {
      return NextResponse.json(
        { error: "Some social connections not found or not owned by user" },
        { status: 403 },
      );
    }

    // Check if all connections are active
    const inactiveConnections = connections.filter((conn) => !conn.is_active);
    if (inactiveConnections.length > 0) {
      return NextResponse.json(
        {
          error: "Some social connections are inactive",
          inactive_connections: inactiveConnections,
        },
        { status: 400 },
      );
    }

    const publishingTasks = [];

    // Create publishing queue entries for each connection
    for (const connection of connections) {
      const isScheduled = scheduled_for && new Date(scheduled_for) > new Date();
      const platform = connection.social_providers.provider_key;

      console.log(`[API] Creating queue entry for connection ${connection.id} (${platform})`);

      const queueMetadata: any = {
        platform: platform,
        content_length: content.length,
        has_media: media_urls.length > 0,
      };

      // Include TikTok metadata if platform is TikTok
      if (platform === "tiktok" && tiktok_metadata) {
        queueMetadata.tiktok_metadata = tiktok_metadata;
      }

      const { data: queueEntry, error: queueError } = await supabase
        .from("social_publishing_queue")
        .insert({
          user_id: user.id,
          campaign_id: campaign_id || null, // Explicitly set null if undefined
          social_account_id: connection.id,
          content,
          media_urls,
          scheduled_for: scheduled_for || null,
          status: isScheduled ? "scheduled" : "publishing",
          metadata: queueMetadata,
        })
        .select()
        .single();

      if (queueError) {
        console.error("Failed to create queue entry:", queueError);
        continue;
      }

      publishingTasks.push({
        account_id: connection.id,
        platform: platform,
        queue_id: queueEntry.id,
        status: isScheduled ? "scheduled" : "publishing",
      });

      // If not scheduled, publish immediately
      if (!isScheduled) {
        console.log(`[API] Publishing immediately to ${platform}...`);
        // Publish asynchronously (don't block response)
        publishToSocialMedia(
          connection.id,
          platform,
          queueEntry.id,
          content,
          media_urls,
          tiktok_metadata, // Pass TikTok metadata
        ).catch((error) =>
          console.error(`Failed to publish to ${platform}:`, error),
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
