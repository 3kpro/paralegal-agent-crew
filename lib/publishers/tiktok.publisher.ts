/**
 * TikTok Content Publisher
 * Handles publishing videos and photo slideshows to TikTok
 */

import { getValidAccessToken } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface TikTokVideoContent {
  type: "video" | "photo"
  videoUrl?: string
  photoUrls?: string[]
  title: string
  privacyLevel?: "SELF_ONLY" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "PUBLIC_TO_EVERYONE"
  disableDuet?: boolean
  disableComment?: boolean
  disableStitch?: boolean
  brandContentToggle?: boolean
  brandOrganicToggle?: boolean
}

/**
 * Publishes content to TikTok
 */
export async function publishToTikTok(
  connectionId: string,
  content: TikTokVideoContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load TikTok capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/tiktok.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[TikTok Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Publish based on content type
    switch (content.type) {
      case "video":
        return await publishVideo(tokenInfo.accessToken, content, capability)
      case "photo":
        return await publishPhotoPost(tokenInfo.accessToken, content, capability)
      default:
        return { success: false, error: "Unsupported content type" }
    }
  } catch (error: any) {
    console.error("[TikTok Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes a video to TikTok
 * Uses TikTok's 3-step upload process: initialize → upload → publish
 */
async function publishVideo(
  accessToken: string,
  content: TikTokVideoContent,
  capability: any
): Promise<PublishResult> {
  if (!content.videoUrl) {
    return { success: false, error: "Video URL is required" }
  }

  try {
    // Step 1: Initialize the upload session
    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.title,
            privacy_level: content.privacyLevel || "PUBLIC_TO_EVERYONE",
            disable_duet: content.disableDuet || false,
            disable_comment: content.disableComment || false,
            disable_stitch: content.disableStitch || false,
            video_cover_timestamp_ms: 1000, // Cover image at 1 second
          },
          source_info: {
            source: "FILE_URL",
            video_url: content.videoUrl,
          },
        }),
      }
    )

    if (!initResponse.ok) {
      const errorText = await initResponse.text()
      console.error("[TikTok Video] Initialize failed:", errorText)
      return {
        success: false,
        error: `Failed to initialize upload: ${initResponse.status}`,
      }
    }

    const initData = await initResponse.json()

    // Check if initialization was successful
    if (initData.error?.code) {
      console.error("[TikTok Video] API error:", initData.error)
      return {
        success: false,
        error: `TikTok API error: ${initData.error.message || initData.error.code}`,
      }
    }

    const publishId = initData.data?.publish_id

    if (!publishId) {
      console.error("[TikTok Video] No publish_id received:", initData)
      return { success: false, error: "No publish ID received from TikTok" }
    }

    // Step 2 & 3: TikTok handles upload and publishing automatically for FILE_URL source
    // We need to poll for status to get the final video ID
    const finalResult = await pollPublishStatus(accessToken, publishId)

    if (!finalResult.success) {
      return finalResult
    }

    return {
      success: true,
      platformPostId: publishId,
      platformUrl: `https://www.tiktok.com/@user/video/${publishId}`, // Generic URL format
    }
  } catch (error: any) {
    console.error("[TikTok Video] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes a photo slideshow to TikTok
 */
async function publishPhotoPost(
  accessToken: string,
  content: TikTokVideoContent,
  capability: any
): Promise<PublishResult> {
  if (!content.photoUrls || content.photoUrls.length < 2) {
    return {
      success: false,
      error: "At least 2 photos required for TikTok photo posts",
    }
  }

  if (content.photoUrls.length > 35) {
    return { success: false, error: "Maximum 35 photos allowed" }
  }

  try {
    // Step 1: Initialize the photo post
    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.title,
            privacy_level: content.privacyLevel || "PUBLIC_TO_EVERYONE",
            disable_comment: content.disableComment || false,
          },
          source_info: {
            source: "FILE_URL",
            photo_cover_index: 0, // Use first photo as cover
            photo_urls: content.photoUrls,
          },
          post_mode: "MEDIA_UPLOAD",
          media_type: "PHOTO",
        }),
      }
    )

    if (!initResponse.ok) {
      const errorText = await initResponse.text()
      console.error("[TikTok Photo] Initialize failed:", errorText)
      return {
        success: false,
        error: `Failed to initialize photo post: ${initResponse.status}`,
      }
    }

    const initData = await initResponse.json()

    // Check for API errors
    if (initData.error?.code) {
      console.error("[TikTok Photo] API error:", initData.error)
      return {
        success: false,
        error: `TikTok API error: ${initData.error.message || initData.error.code}`,
      }
    }

    const publishId = initData.data?.publish_id

    if (!publishId) {
      console.error("[TikTok Photo] No publish_id received:", initData)
      return { success: false, error: "No publish ID received from TikTok" }
    }

    // Poll for completion
    const finalResult = await pollPublishStatus(accessToken, publishId)

    if (!finalResult.success) {
      return finalResult
    }

    return {
      success: true,
      platformPostId: publishId,
      platformUrl: `https://www.tiktok.com/@user/video/${publishId}`,
    }
  } catch (error: any) {
    console.error("[TikTok Photo] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Polls TikTok's status endpoint to check if upload is complete
 */
async function pollPublishStatus(
  accessToken: string,
  publishId: string,
  maxAttempts: number = 10,
  intervalMs: number = 3000
): Promise<PublishResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResponse = await fetch(
        `https://open.tiktokapis.com/v2/post/publish/status/fetch/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            publish_id: publishId,
          }),
        }
      )

      if (!statusResponse.ok) {
        console.error(
          `[TikTok Status] Poll attempt ${attempt} failed:`,
          statusResponse.status
        )
        // Continue polling
        await sleep(intervalMs)
        continue
      }

      const statusData = await statusResponse.json()

      // Check status
      const status = statusData.data?.status

      if (status === "PUBLISH_COMPLETE") {
        // Success!
        return {
          success: true,
          platformPostId: publishId,
        }
      } else if (status === "FAILED") {
        return {
          success: false,
          error: statusData.data?.fail_reason || "Publishing failed",
        }
      } else if (status === "PROCESSING_UPLOAD" || status === "PROCESSING_PUBLISH") {
        // Still processing, continue polling
        console.log(
          `[TikTok Status] Attempt ${attempt}/${maxAttempts}: ${status}`
        )
        await sleep(intervalMs)
        continue
      } else {
        // Unknown status
        console.warn(`[TikTok Status] Unknown status: ${status}`)
        await sleep(intervalMs)
        continue
      }
    } catch (error) {
      console.error(`[TikTok Status] Poll attempt ${attempt} error:`, error)
      if (attempt === maxAttempts) {
        return { success: false, error: "Failed to verify publish status" }
      }
      await sleep(intervalMs)
    }
  }

  // Max attempts reached
  return {
    success: false,
    error: "Publish status check timed out. Video may still be processing.",
  }
}

/**
 * Sleep utility for polling
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
