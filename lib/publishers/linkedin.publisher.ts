/**
 * LinkedIn Content Publisher
 * Handles posting to LinkedIn profiles and company pages
 */

import { getValidAccessToken } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface LinkedInContent {
  type: "text" | "image" | "article" | "video"
  text: string
  imageUrl?: string
  articleUrl?: string
  videoUrl?: string
  visibility?: "PUBLIC" | "CONNECTIONS" | "LOGGED_IN"
}

/**
 * Publishes content to LinkedIn
 */
export async function publishToLinkedIn(
  connectionId: string,
  content: LinkedInContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load LinkedIn capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/linkedin.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[LinkedIn Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Get user's LinkedIn URN
    const userURN = await getUserURN(tokenInfo.accessToken)
    if (!userURN) {
      return { success: false, error: "Failed to get LinkedIn user ID" }
    }

    // Publish based on content type
    switch (content.type) {
      case "text":
        return await publishText(userURN, tokenInfo.accessToken, content)
      case "image":
        return await publishImage(userURN, tokenInfo.accessToken, content)
      case "article":
        return await publishArticle(userURN, tokenInfo.accessToken, content)
      case "video":
        return await publishVideo(userURN, tokenInfo.accessToken, content)
      default:
        return { success: false, error: "Unsupported content type" }
    }
  } catch (error: any) {
    console.error("[LinkedIn Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Gets the user's LinkedIn URN
 */
async function getUserURN(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error("[LinkedIn] Failed to get user info:", response.status)
      return null
    }

    const data = await response.json()
    return data.sub // URN format: urn:li:person:xxx
  } catch (error) {
    console.error("[LinkedIn] Error getting user URN:", error)
    return null
  }
}

/**
 * Publishes text post to LinkedIn
 */
async function publishText(
  userURN: string,
  accessToken: string,
  content: LinkedInContent
): Promise<PublishResult> {
  try {
    const postData = {
      author: userURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility":
          content.visibility || "PUBLIC",
      },
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[LinkedIn Text] Post failed:", errorText)
      return { success: false, error: `Failed to post: ${response.status}` }
    }

    const data = await response.json()
    const postId = data.id

    return {
      success: true,
      platformPostId: postId,
      platformUrl: `https://www.linkedin.com/feed/update/${postId}`,
    }
  } catch (error: any) {
    console.error("[LinkedIn Text] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes image post to LinkedIn
 */
async function publishImage(
  userURN: string,
  accessToken: string,
  content: LinkedInContent
): Promise<PublishResult> {
  if (!content.imageUrl) {
    return { success: false, error: "Image URL is required" }
  }

  try {
    // Step 1: Register image upload
    const registerResponse = await fetch(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: userURN,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        }),
      }
    )

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text()
      console.error("[LinkedIn Image] Register failed:", errorText)
      return {
        success: false,
        error: `Failed to register upload: ${registerResponse.status}`,
      }
    }

    const registerData = await registerResponse.json()
    const uploadUrl =
      registerData.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl
    const asset = registerData.value.asset

    // Step 2: Download image from URL
    const imageResponse = await fetch(content.imageUrl)
    if (!imageResponse.ok) {
      return { success: false, error: "Failed to fetch image from URL" }
    }
    const imageBlob = await imageResponse.blob()

    // Step 3: Upload image to LinkedIn
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: imageBlob,
    })

    if (!uploadResponse.ok) {
      console.error("[LinkedIn Image] Upload failed:", uploadResponse.status)
      return { success: false, error: "Failed to upload image" }
    }

    // Step 4: Create post with uploaded image
    const postData = {
      author: userURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              description: {
                text: content.text,
              },
              media: asset,
              title: {
                text: "Image Post",
              },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility":
          content.visibility || "PUBLIC",
      },
    }

    const postResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postData),
    })

    if (!postResponse.ok) {
      const errorText = await postResponse.text()
      console.error("[LinkedIn Image] Post failed:", errorText)
      return {
        success: false,
        error: `Failed to create post: ${postResponse.status}`,
      }
    }

    const postResponseData = await postResponse.json()
    const postId = postResponseData.id

    return {
      success: true,
      platformPostId: postId,
      platformUrl: `https://www.linkedin.com/feed/update/${postId}`,
    }
  } catch (error: any) {
    console.error("[LinkedIn Image] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Shares an article on LinkedIn
 */
async function publishArticle(
  userURN: string,
  accessToken: string,
  content: LinkedInContent
): Promise<PublishResult> {
  if (!content.articleUrl) {
    return { success: false, error: "Article URL is required" }
  }

  try {
    const postData = {
      author: userURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              originalUrl: content.articleUrl,
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility":
          content.visibility || "PUBLIC",
      },
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[LinkedIn Article] Post failed:", errorText)
      return {
        success: false,
        error: `Failed to share article: ${response.status}`,
      }
    }

    const data = await response.json()
    const postId = data.id

    return {
      success: true,
      platformPostId: postId,
      platformUrl: `https://www.linkedin.com/feed/update/${postId}`,
    }
  } catch (error: any) {
    console.error("[LinkedIn Article] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Publishes video to LinkedIn
 */
async function publishVideo(
  userURN: string,
  accessToken: string,
  content: LinkedInContent
): Promise<PublishResult> {
  // LinkedIn video upload is complex and requires multiple steps
  // For now, return not implemented
  return {
    success: false,
    error: "LinkedIn video publishing not yet fully implemented",
  }
}
