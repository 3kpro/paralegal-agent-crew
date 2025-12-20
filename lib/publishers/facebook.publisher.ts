/**
 * Facebook Content Publisher
 * Handles posting to Facebook Pages
 */

import { getValidAccessToken } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface FacebookContent {
  type: "text" | "photo" | "video" | "link"
  message?: string
  photoUrl?: string
  videoUrl?: string
  link?: string
  published?: boolean // Default true, set false for drafts
}

/**
 * Publishes content to Facebook
 */
export async function publishToFacebook(
  connectionId: string,
  content: FacebookContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load Facebook capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/facebook.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[Facebook Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Get Page ID from connection metadata
    // TODO: Store Page ID during OAuth flow or allow user to select
    const pageId = await getPageId(tokenInfo.accessToken)
    if (!pageId) {
      return { success: false, error: "Facebook Page not found" }
    }

    // Get Page access token (required for posting)
    const pageAccessToken = await getPageAccessToken(
      tokenInfo.accessToken,
      pageId
    )
    if (!pageAccessToken) {
      return { success: false, error: "Failed to get Page access token" }
    }

    // Publish based on content type
    switch (content.type) {
      case "text":
        return await publishText(pageId, pageAccessToken, content, capability)
      case "photo":
        return await publishPhoto(pageId, pageAccessToken, content, capability)
      case "video":
        return await publishVideo(pageId, pageAccessToken, content, capability)
      case "link":
        return await publishLink(pageId, pageAccessToken, content, capability)
      default:
        return { success: false, error: "Unsupported content type" }
    }
  } catch (error: any) {
    console.error("[Facebook Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Gets the user's Facebook Pages
 */
async function getPageId(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/me/accounts?access_token=${accessToken}`
    )

    if (!response.ok) {
      console.error("[Facebook] Failed to get pages:", response.status)
      return null
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      console.error("[Facebook] No pages found")
      return null
    }

    // Return first page ID (TODO: Allow user to select page)
    return data.data[0].id
  } catch (error) {
    console.error("[Facebook] Error getting page ID:", error)
    return null
  }
}

/**
 * Gets Page access token from user access token
 */
async function getPageAccessToken(
  userAccessToken: string,
  pageId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${pageId}?fields=access_token&access_token=${userAccessToken}`
    )

    if (!response.ok) {
      console.error(
        "[Facebook] Failed to get page access token:",
        response.status
      )
      return null
    }

    const data = await response.json()
    return data.access_token || null
  } catch (error) {
    console.error("[Facebook] Error getting page access token:", error)
    return null
  }
}

/**
 * Publishes text post to Facebook Page
 */
async function publishText(
  pageId: string,
  pageAccessToken: string,
  content: FacebookContent,
  capability: any
): Promise<PublishResult> {
  if (!content.message) {
    return { success: false, error: "Message is required for text posts" }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content.message,
          published: content.published !== false,
          access_token: pageAccessToken,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Facebook Text] Post failed:", errorText)
      return { success: false, error: `Failed to post: ${response.status}` }
    }

    const data = await response.json()

    return {
      success: true,
      platformPostId: data.id,
      platformUrl: `https://www.facebook.com/${data.id}`,
    }
  } catch (error: any) {
    console.error("[Facebook Text] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes photo to Facebook Page
 */
async function publishPhoto(
  pageId: string,
  pageAccessToken: string,
  content: FacebookContent,
  capability: any
): Promise<PublishResult> {
  if (!content.photoUrl) {
    return { success: false, error: "Photo URL is required" }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${pageId}/photos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: content.photoUrl,
          caption: content.message || "",
          published: content.published !== false,
          access_token: pageAccessToken,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Facebook Photo] Post failed:", errorText)
      return { success: false, error: `Failed to post photo: ${response.status}` }
    }

    const data = await response.json()

    return {
      success: true,
      platformPostId: data.id,
      platformUrl: `https://www.facebook.com/photo?fbid=${data.id}`,
    }
  } catch (error: any) {
    console.error("[Facebook Photo] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes video to Facebook Page
 */
async function publishVideo(
  pageId: string,
  pageAccessToken: string,
  content: FacebookContent,
  capability: any
): Promise<PublishResult> {
  if (!content.videoUrl) {
    return { success: false, error: "Video URL is required" }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${pageId}/videos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: content.videoUrl,
          description: content.message || "",
          published: content.published !== false,
          access_token: pageAccessToken,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Facebook Video] Post failed:", errorText)
      return { success: false, error: `Failed to post video: ${response.status}` }
    }

    const data = await response.json()

    return {
      success: true,
      platformPostId: data.id,
      platformUrl: `https://www.facebook.com/${pageId}/videos/${data.id}`,
    }
  } catch (error: any) {
    console.error("[Facebook Video] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Shares a link on Facebook Page
 */
async function publishLink(
  pageId: string,
  pageAccessToken: string,
  content: FacebookContent,
  capability: any
): Promise<PublishResult> {
  if (!content.link) {
    return { success: false, error: "Link is required" }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: content.link,
          message: content.message || "",
          published: content.published !== false,
          access_token: pageAccessToken,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Facebook Link] Post failed:", errorText)
      return { success: false, error: `Failed to share link: ${response.status}` }
    }

    const data = await response.json()

    return {
      success: true,
      platformPostId: data.id,
      platformUrl: `https://www.facebook.com/${data.id}`,
    }
  } catch (error: any) {
    console.error("[Facebook Link] Error:", error)
    return { success: false, error: error.message }
  }
}
