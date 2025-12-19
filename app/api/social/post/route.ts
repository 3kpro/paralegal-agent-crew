import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidToken } from '@/lib/auth/oauth';

interface PostRequest {
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledFor?: string;
  campaignId?: string; // Optional: Enable performance tracking for ML training
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: PostRequest = await request.json();
    const { platform, content, mediaUrls = [], campaignId } = body;

    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: platform and content' },
        { status: 400 }
      );
    }

    // Get valid access token (automatically refreshes if needed)
    const accessToken = await getValidToken(user.id, platform);

    // Post to platform
    const result = await postToPlatform(platform, accessToken, content, mediaUrls);

    // Record the post in database
    await supabase.from('social_posts').insert({
      user_id: user.id,
      platform,
      platform_post_id: result.postId,
      content,
      media_urls: mediaUrls,
      status: 'published',
      posted_at: new Date().toISOString(),
    });

    // Track analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'content_published',
      event_category: 'social',
      event_data: {
        platform,
        content_length: content.length,
        has_media: mediaUrls.length > 0,
        media_count: mediaUrls.length,
      },
    });

    // Track performance for ML training (Phase 2) - Optional
    // Only track if campaignId is provided
    if (campaignId) {
      try {
        // Fetch campaign to get trend with viral score predictions
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('source_data')
          .eq('id', campaignId)
          .single();

        if (campaign?.source_data?.trend) {
          const trend = campaign.source_data.trend;

          // Only track if viral score is available
          if (trend.viralScore !== undefined) {
            await supabase.from('content_performance').insert({
              user_id: user.id,
              campaign_id: campaignId,
              post_id: null, // No scheduled post for direct publishing
              trend_title: trend.title,
              trend_source: trend.sources?.[0] || 'mixed',
              viral_score_predicted: trend.viralScore,
              viral_potential_predicted: trend.viralPotential || 'medium',
              predicted_factors: trend.viralFactors || {},
              content_text: content,
              content_type: platform,
              platforms: [platform],
              published_at: new Date().toISOString(),
            });

            console.log(
              `[Feedback Tracking] ✓ Performance tracking enabled for direct post: ${trend.title} (Score: ${trend.viralScore})`,
            );
          }
        }
      } catch (trackingError) {
        // Log error but don't fail the publish
        console.error('[Feedback Tracking] Failed to record performance:', trackingError);
      }
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      url: result.url,
    });

  } catch (error: any) {
    console.error('Post creation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create post',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function postToPlatform(
  platform: string,
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  switch (platform) {
    case 'twitter':
      return postToTwitter(accessToken, content, mediaUrls);
    case 'linkedin':
      return postToLinkedIn(accessToken, content, mediaUrls);
    case 'facebook':
      return postToFacebook(accessToken, content, mediaUrls);
    case 'instagram':
      return postToInstagram(accessToken, content, mediaUrls);
    case 'tiktok':
      return postToTikTok(accessToken, content, mediaUrls);
    case 'youtube':
      return postToYouTube(accessToken, content, mediaUrls);
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
}

async function postToYouTube(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  if (mediaUrls.length === 0) {
    throw new Error('YouTube posts require a video');
  }

  // We reuse the existing YouTube publisher logic but bypass the connection-id lookups
  // Since we already have the accessToken here.
  // Note: For simplicity and following the pattern in this file,
  // we could implement it directly here or call the publisher.
  // The publisher expects YouTubeVideoContent which includes a videoUrl.

  const { publishToYouTube } = await import('@/lib/publishers/youtube.publisher');
  
  // We need a dummy connectionId because publishToYouTube calls getValidAccessToken
  // Wait, that's not ideal if we already have the accessToken.
  // Let's check publishToYouTube signature again.
  // export async function publishToYouTube(connectionId: string, content: YouTubeVideoContent)
  
  // Ah, the publisher is coupled with connectionId. 
  // Maybe I should refactor the publisher to accept EITHER connectionId OR accessToken.
  
  // For now, I'll implement the upload logic directly here or use a modified version.
  // Actually, I'll just copy the core upload logic from the publisher to keep this file self-contained
  // as is the pattern for other platforms in this route.
  
  const videoUrl = mediaUrls[0];
  const title = content.split('\n')[0].substring(0, 100) || "Untitled Video";
  const description = content;

  // Metadata for YouTube
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: "22", // People & Blogs
    },
    status: {
      privacyStatus: "public",
    },
  };

  // Step 1: Fetch video
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.status}`);
  const videoBlob = await videoResponse.blob();
  const videoSize = videoBlob.size;

  // Step 2: Init resumable upload
  const initResponse = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": videoSize.toString(),
        "X-Upload-Content-Type": videoBlob.type || "video/mp4",
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    throw new Error(`YouTube init upload failed: ${errorText}`);
  }

  const uploadUrl = initResponse.headers.get("Location");
  if (!uploadUrl) throw new Error("No upload URL received from YouTube");

  // Step 3: Upload
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": videoBlob.type || "video/mp4",
      "Content-Length": videoSize.toString(),
    },
    body: videoBlob,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`YouTube upload failed: ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  
  return {
    postId: uploadData.id,
    url: `https://www.youtube.com/watch?v=${uploadData.id}`,
  };
}

async function postToTwitter(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  const tweetData: any = { text: content };

  // Upload media if present
  if (mediaUrls.length > 0) {
    const mediaIds = await Promise.all(
      mediaUrls.map(url => uploadTwitterMedia(accessToken, url))
    );
    tweetData.media = { media_ids: mediaIds };
  }

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter post failed: ${error}`);
  }

  const data = await response.json();
  return {
    postId: data.data.id,
    url: `https://twitter.com/i/web/status/${data.data.id}`,
  };
}

async function uploadTwitterMedia(accessToken: string, mediaUrl: string): Promise<string> {
  // Download media
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = await mediaResponse.arrayBuffer();
  
  // Upload to Twitter
  const formData = new FormData();
  formData.append('media', new Blob([mediaBuffer]));

  const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload media to Twitter');
  }

  const uploadData = await uploadResponse.json();
  return uploadData.media_id_string;
}

async function postToLinkedIn(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  // Get LinkedIn user profile
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const profile = await profileResponse.json();
  const authorUrn = `urn:li:person:${profile.sub}`;

  const postData: any = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  // Add media if present
  if (mediaUrls.length > 0) {
    const mediaAssets = await Promise.all(
      mediaUrls.map(url => uploadLinkedInMedia(accessToken, authorUrn, url))
    );
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  const data = await response.json();

  return {
    postId: data.id,
    url: `https://www.linkedin.com/feed/update/${data.id}`,
  };
}

async function uploadLinkedInMedia(
  accessToken: string,
  authorUrn: string,
  mediaUrl: string
): Promise<any> {
  // Register upload
  const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: authorUrn,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  const registerData = await registerResponse.json();
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = registerData.value.asset;

  // Download and upload media
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = await mediaResponse.arrayBuffer();

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: mediaBuffer,
  });

  return {
    status: 'READY',
    description: {
      text: '',
    },
    media: asset,
    title: {
      text: '',
    },
  };
}

async function postToFacebook(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  // Get user's Facebook pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesResponse.json();
  
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error('No Facebook pages found. Please create a page to post.');
  }

  const pageId = pagesData.data[0].id;
  const pageAccessToken = pagesData.data[0].access_token;

  const params: any = {
    message: content,
    access_token: pageAccessToken,
  };

  // Add media if present
  if (mediaUrls.length > 0) {
    params.url = mediaUrls[0]; // Facebook allows one image per post
  }

  const endpoint = mediaUrls.length > 0 ? 'photos' : 'feed';
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Facebook post failed: ${error}`);
  }

  const data = await response.json();
  return {
    postId: data.id,
    url: `https://www.facebook.com/${data.id}`,
  };
}

async function postToInstagram(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  if (mediaUrls.length === 0) {
    throw new Error('Instagram posts require at least one image or video');
  }

  // Get Instagram Business Account ID
  const meResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  const meData = await meResponse.json();
  
  if (!meData.data || meData.data.length === 0) {
    throw new Error('No Facebook page connected to Instagram account');
  }

  const pageId = meData.data[0].id;
  const pageAccessToken = meData.data[0].access_token;

  // Get Instagram Account ID from page
  const igResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );
  const igData = await igResponse.json();
  const igAccountId = igData.instagram_business_account?.id;

  if (!igAccountId) {
    throw new Error('No Instagram Business Account found');
  }

  // Step 1: Create media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: mediaUrls[0],
        caption: content,
        access_token: pageAccessToken,
      }),
    }
  );

  const containerData = await containerResponse.json();
  
  if (!containerResponse.ok) {
    throw new Error(`Instagram container creation failed: ${JSON.stringify(containerData)}`);
  }

  // Step 2: Publish container
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: pageAccessToken,
      }),
    }
  );

  const publishData = await publishResponse.json();

  if (!publishResponse.ok) {
    throw new Error(`Instagram publish failed: ${JSON.stringify(publishData)}`);
  }

  return {
    postId: publishData.id,
    url: `https://www.instagram.com/p/${publishData.id}`,
  };
}

async function postToTikTok(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<{ postId: string; url: string }> {
  if (mediaUrls.length === 0) {
    throw new Error('TikTok posts require a video');
  }

  // Note: TikTok's Content Posting API requires app approval
  // This is a simplified implementation
  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: content,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_url: mediaUrls[0],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TikTok post failed: ${error}`);
  }

  const data = await response.json();
  
  return {
    postId: data.data.publish_id,
    url: `https://www.tiktok.com/@user/video/${data.data.publish_id}`,
  };
}
