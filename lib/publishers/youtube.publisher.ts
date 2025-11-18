/**
 * YouTube Content Publisher
 * Handles uploading videos and shorts to YouTube
 */

import { getValidAccessToken } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface YouTubeVideoContent {
  type: "video" | "short"
  videoUrl: string
  title: string
  description?: string
  tags?: string[]
  categoryId?: string
  privacyStatus?: "public" | "private" | "unlisted"
  madeForKids?: boolean
  playlistId?: string
  thumbnailUrl?: string
}

/**
 * Publishes content to YouTube
 */
export async function publishToYouTube(
  connectionId: string,
  content: YouTubeVideoContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load YouTube capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/youtube.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[YouTube Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Both videos and shorts use the same upload endpoint
    return await uploadVideo(tokenInfo.accessToken, content, capability)
  } catch (error: any) {
    console.error("[YouTube Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Uploads a video to YouTube
 * Uses YouTube Data API v3 with resumable upload
 */
async function uploadVideo(
  accessToken: string,
  content: YouTubeVideoContent,
  capability: any
): Promise<PublishResult> {
  try {
    // Prepare video metadata
    const metadata = {
      snippet: {
        title: content.title,
        description: content.description || "",
        tags: content.tags || [],
        categoryId: content.categoryId || "22", // Default: People & Blogs
      },
      status: {
        privacyStatus: content.privacyStatus || "private",
        selfDeclaredMadeForKids: content.madeForKids || false,
      },
    }

    // For YouTube Shorts, the video must be:
    // - Vertical (9:16 aspect ratio)
    // - 60 seconds or less
    // YouTube auto-detects Shorts based on these criteria

    // Step 1: Fetch the video file from the URL
    console.log("[YouTube] Fetching video from URL:", content.videoUrl)
    const videoResponse = await fetch(content.videoUrl)

    if (!videoResponse.ok) {
      return {
        success: false,
        error: `Failed to fetch video from URL: ${videoResponse.status}`,
      }
    }

    const videoBlob = await videoResponse.blob()
    const videoSize = videoBlob.size

    console.log("[YouTube] Video size:", videoSize, "bytes")

    // Step 2: Initialize resumable upload session
    const initUploadResponse = await fetch(
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
    )

    if (!initUploadResponse.ok) {
      const errorText = await initUploadResponse.text()
      console.error("[YouTube] Init upload failed:", errorText)
      return {
        success: false,
        error: `Failed to initialize upload: ${initUploadResponse.status}`,
      }
    }

    // Get the upload URL from Location header
    const uploadUrl = initUploadResponse.headers.get("Location")

    if (!uploadUrl) {
      return { success: false, error: "No upload URL received from YouTube" }
    }

    console.log("[YouTube] Upload URL received, uploading video...")

    // Step 3: Upload the video file
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": videoBlob.type || "video/mp4",
        "Content-Length": videoSize.toString(),
      },
      body: videoBlob,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("[YouTube] Video upload failed:", errorText)
      return {
        success: false,
        error: `Failed to upload video: ${uploadResponse.status}`,
      }
    }

    const uploadData = await uploadResponse.json()

    console.log("[YouTube] Upload successful:", uploadData.id)

    // Step 4: Optionally add to playlist if specified
    if (content.playlistId) {
      await addVideoToPlaylist(
        accessToken,
        uploadData.id,
        content.playlistId
      )
    }

    return {
      success: true,
      platformPostId: uploadData.id,
      platformUrl: `https://www.youtube.com/watch?v=${uploadData.id}`,
    }
  } catch (error: any) {
    console.error("[YouTube] Upload error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Adds a video to a YouTube playlist
 */
async function addVideoToPlaylist(
  accessToken: string,
  videoId: string,
  playlistId: string
): Promise<void> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId,
            },
          },
        }),
      }
    )

    if (!response.ok) {
      console.error(
        "[YouTube] Failed to add video to playlist:",
        response.status
      )
    } else {
      console.log("[YouTube] Video added to playlist:", playlistId)
    }
  } catch (error) {
    console.error("[YouTube] Error adding to playlist:", error)
    // Don't fail the whole upload if playlist addition fails
  }
}

/**
 * Gets the authenticated user's YouTube channel info
 */
export async function getYouTubeChannelInfo(
  accessToken: string
): Promise<{ id: string; title: string } | null> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error("[YouTube] Failed to get channel info:", response.status)
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.error("[YouTube] No channel found for this account")
      return null
    }

    const channel = data.items[0]

    return {
      id: channel.id,
      title: channel.snippet.title,
    }
  } catch (error) {
    console.error("[YouTube] Error getting channel info:", error)
    return null
  }
}
