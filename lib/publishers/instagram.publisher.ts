/**
 * Instagram Content Publisher
 * Handles publishing photos, reels, carousels, and stories to Instagram
 */

import { getValidAccessToken, incrementUsage } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface InstagramMediaContent {
  type: "photo" | "reel" | "carousel" | "story"
  imageUrl?: string
  videoUrl?: string
  caption?: string
  coverUrl?: string
  children?: string[] // For carousels
  location?: string
  userTags?: Array<{ username: string; x: number; y: number }>
}

/**
 * Publishes content to Instagram
 */
export async function publishToInstagram(
  connectionId: string,
  content: InstagramMediaContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load Instagram capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/instagram.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[Instagram Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Get Instagram User ID from connection metadata
    // TODO: Store IG User ID during OAuth flow
    // For now, we'll need to fetch it
    const igUserId = await getInstagramUserId(tokenInfo.accessToken)
    if (!igUserId) {
      return { success: false, error: "Instagram User ID not found" }
    }

    // Publish based on content type
    switch (content.type) {
      case "photo":
        return await publishPhoto(igUserId, tokenInfo.accessToken, content, capability)
      case "reel":
        return await publishReel(igUserId, tokenInfo.accessToken, content, capability)
      case "carousel":
        return await publishCarousel(igUserId, tokenInfo.accessToken, content, capability)
      case "story":
        return await publishStory(igUserId, tokenInfo.accessToken, content, capability)
      default:
        return { success: false, error: "Unsupported content type" }
    }
  } catch (error: any) {
    console.error("[Instagram Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Gets Instagram User ID for the authenticated account
 */
async function getInstagramUserId(accessToken: string): Promise<string | null> {
  try {
    // Use Graph API to get user info
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    )

    if (!response.ok) {
      console.error("[Instagram] Failed to get user ID:", response.status)
      return null
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error("[Instagram] Error getting user ID:", error)
    return null
  }
}

/**
 * Publishes a photo to Instagram feed
 */
async function publishPhoto(
  igUserId: string,
  accessToken: string,
  content: InstagramMediaContent,
  capability: any
): Promise<PublishResult> {
  const endpoint = capability.capabilities.publish_photo.endpoint.replace(
    "{ig-user-id}",
    igUserId
  )

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(`${endpoint}?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: content.imageUrl,
        caption: content.caption || "",
        // access_token: accessToken, // Already in URL
      }),
    })

    if (!containerResponse.ok) {
      const errorText = await containerResponse.text()
      console.error("[Instagram Photo] Container creation failed:", errorText)
      return { success: false, error: `Failed to create media container: ${containerResponse.status}` }
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
        }),
      }
    )

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text()
      console.error("[Instagram Photo] Publish failed:", errorText)
      return { success: false, error: `Failed to publish: ${publishResponse.status}` }
    }

    const publishData = await publishResponse.json()

    return {
      success: true,
      platformPostId: publishData.id,
      platformUrl: `https://www.instagram.com/p/${publishData.id}`,
    }
  } catch (error: any) {
    console.error("[Instagram Photo] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes a reel to Instagram
 */
async function publishReel(
  igUserId: string,
  accessToken: string,
  content: InstagramMediaContent,
  capability: any
): Promise<PublishResult> {
  const endpoint = capability.capabilities.publish_reel.endpoint.replace(
    "{ig-user-id}",
    igUserId
  )

  try {
    // Step 1: Create reel container
    const containerResponse = await fetch(`${endpoint}?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: content.videoUrl,
        caption: content.caption || "",
        cover_url: content.coverUrl,
        share_to_feed: true,
      }),
    })

    if (!containerResponse.ok) {
      const errorText = await containerResponse.text()
      console.error("[Instagram Reel] Container creation failed:", errorText)
      return { success: false, error: `Failed to create reel container: ${containerResponse.status}` }
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    // Step 2: Publish the reel
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
        }),
      }
    )

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text()
      console.error("[Instagram Reel] Publish failed:", errorText)
      return { success: false, error: `Failed to publish reel: ${publishResponse.status}` }
    }

    const publishData = await publishResponse.json()

    return {
      success: true,
      platformPostId: publishData.id,
      platformUrl: `https://www.instagram.com/reel/${publishData.id}`,
    }
  } catch (error: any) {
    console.error("[Instagram Reel] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes a carousel to Instagram feed
 */
async function publishCarousel(
  igUserId: string,
  accessToken: string,
  content: InstagramMediaContent,
  capability: any
): Promise<PublishResult> {
  // TODO: Implement carousel publishing
  // This requires creating multiple media containers and then a carousel container
  return { success: false, error: "Carousel publishing not yet implemented" }
}

/**
 * Publishes a story to Instagram
 */
async function publishStory(
  igUserId: string,
  accessToken: string,
  content: InstagramMediaContent,
  capability: any
): Promise<PublishResult> {
  // TODO: Implement story publishing
  return { success: false, error: "Story publishing not yet implemented" }
}
