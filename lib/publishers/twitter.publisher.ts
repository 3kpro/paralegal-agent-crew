/**
 * Twitter/X Content Publisher
 * Handles posting tweets and media to Twitter/X
 */

import { getValidAccessToken } from "../social/token-manager"

interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

interface TwitterContent {
  type: "text" | "media" | "thread" | "poll"
  text: string
  mediaUrls?: string[]
  tweets?: string[] // For threads
  pollOptions?: string[]
  pollDurationMinutes?: number
  replySettings?: "everyone" | "mentionedUsers" | "following"
}

/**
 * Publishes content to Twitter/X
 */
export async function publishToTwitter(
  connectionId: string,
  content: TwitterContent
): Promise<PublishResult> {
  try {
    // Get valid access token (auto-refreshes if needed)
    const tokenInfo = await getValidAccessToken(connectionId)

    // Load Twitter capability config
    const capabilityPath = `${process.cwd()}/libs/capabilities/social/twitter.json`
    let capability: any
    try {
      const fs = await import("fs/promises")
      const capabilityData = await fs.readFile(capabilityPath, "utf-8")
      capability = JSON.parse(capabilityData)
    } catch (error) {
      console.error("[Twitter Publisher] Failed to load capability:", error)
      return { success: false, error: "Configuration not found" }
    }

    // Publish based on content type
    switch (content.type) {
      case "text":
        return await publishText(tokenInfo.accessToken, content)
      case "media":
        return await publishMedia(tokenInfo.accessToken, content)
      case "thread":
        return await publishThread(tokenInfo.accessToken, content)
      case "poll":
        return await publishPoll(tokenInfo.accessToken, content)
      default:
        return { success: false, error: "Unsupported content type" }
    }
  } catch (error: any) {
    console.error("[Twitter Publisher] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Posts a text-only tweet
 */
async function publishText(
  accessToken: string,
  content: TwitterContent
): Promise<PublishResult> {
  try {
    const tweetData: any = {
      text: content.text,
    }

    if (content.replySettings) {
      tweetData.reply_settings = content.replySettings
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Twitter Text] Post failed:", errorText)
      return { success: false, error: `Failed to post: ${response.status}` }
    }

    const data = await response.json()
    const tweetId = data.data.id
    const username = await getUsername(accessToken)

    return {
      success: true,
      platformPostId: tweetId,
      platformUrl: `https://twitter.com/${username}/status/${tweetId}`,
    }
  } catch (error: any) {
    console.error("[Twitter Text] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Posts a tweet with media (images/video)
 */
async function publishMedia(
  accessToken: string,
  content: TwitterContent
): Promise<PublishResult> {
  if (!content.mediaUrls || content.mediaUrls.length === 0) {
    return { success: false, error: "Media URLs are required" }
  }

  if (content.mediaUrls.length > 4) {
    return { success: false, error: "Maximum 4 images allowed per tweet" }
  }

  try {
    // Step 1: Upload media and get media IDs
    const mediaIds: string[] = []

    for (const mediaUrl of content.mediaUrls) {
      const mediaId = await uploadMedia(accessToken, mediaUrl)
      if (!mediaId) {
        return { success: false, error: "Failed to upload media" }
      }
      mediaIds.push(mediaId)
    }

    // Step 2: Create tweet with media IDs
    const tweetData: any = {
      text: content.text,
      media: {
        media_ids: mediaIds,
      },
    }

    if (content.replySettings) {
      tweetData.reply_settings = content.replySettings
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Twitter Media] Post failed:", errorText)
      return {
        success: false,
        error: `Failed to post media: ${response.status}`,
      }
    }

    const data = await response.json()
    const tweetId = data.data.id
    const username = await getUsername(accessToken)

    return {
      success: true,
      platformPostId: tweetId,
      platformUrl: `https://twitter.com/${username}/status/${tweetId}`,
    }
  } catch (error: any) {
    console.error("[Twitter Media] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Posts a tweet thread
 */
async function publishThread(
  accessToken: string,
  content: TwitterContent
): Promise<PublishResult> {
  if (!content.tweets || content.tweets.length < 2) {
    return { success: false, error: "At least 2 tweets required for thread" }
  }

  if (content.tweets.length > 25) {
    return { success: false, error: "Maximum 25 tweets per thread" }
  }

  try {
    const tweetIds: string[] = []
    let previousTweetId: string | null = null

    // Post each tweet in the thread
    for (const tweetText of content.tweets) {
      const tweetData: any = {
        text: tweetText,
      }

      // Add reply to previous tweet (except for first tweet)
      if (previousTweetId) {
        tweetData.reply = {
          in_reply_to_tweet_id: previousTweetId,
        }
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          `[Twitter Thread] Tweet ${tweetIds.length + 1} failed:`,
          errorText
        )
        // If thread fails partway, return what we posted
        if (tweetIds.length > 0) {
          const username = await getUsername(accessToken)
          return {
            success: false,
            error: `Thread failed at tweet ${tweetIds.length + 1}`,
            platformPostId: tweetIds[0],
            platformUrl: `https://twitter.com/${username}/status/${tweetIds[0]}`,
          }
        }
        return {
          success: false,
          error: `Failed to post thread: ${response.status}`,
        }
      }

      const data = await response.json()
      const tweetId = data.data.id
      tweetIds.push(tweetId)
      previousTweetId = tweetId
    }

    // Return first tweet in thread as the main post
    const username = await getUsername(accessToken)

    return {
      success: true,
      platformPostId: tweetIds[0],
      platformUrl: `https://twitter.com/${username}/status/${tweetIds[0]}`,
    }
  } catch (error: any) {
    console.error("[Twitter Thread] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Posts a tweet with a poll
 */
async function publishPoll(
  accessToken: string,
  content: TwitterContent
): Promise<PublishResult> {
  if (!content.pollOptions || content.pollOptions.length < 2) {
    return { success: false, error: "At least 2 poll options required" }
  }

  if (content.pollOptions.length > 4) {
    return { success: false, error: "Maximum 4 poll options allowed" }
  }

  if (!content.pollDurationMinutes) {
    return { success: false, error: "Poll duration is required" }
  }

  try {
    const tweetData: any = {
      text: content.text,
      poll: {
        options: content.pollOptions.map((option) => ({ label: option })),
        duration_minutes: content.pollDurationMinutes,
      },
    }

    if (content.replySettings) {
      tweetData.reply_settings = content.replySettings
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Twitter Poll] Post failed:", errorText)
      return {
        success: false,
        error: `Failed to post poll: ${response.status}`,
      }
    }

    const data = await response.json()
    const tweetId = data.data.id
    const username = await getUsername(accessToken)

    return {
      success: true,
      platformPostId: tweetId,
      platformUrl: `https://twitter.com/${username}/status/${tweetId}`,
    }
  } catch (error: any) {
    console.error("[Twitter Poll] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Uploads media to Twitter using v1.1 API
 */
async function uploadMedia(
  accessToken: string,
  mediaUrl: string
): Promise<string | null> {
  try {
    // Download media from URL
    const mediaResponse = await fetch(mediaUrl)
    if (!mediaResponse.ok) {
      console.error("[Twitter] Failed to fetch media:", mediaResponse.status)
      return null
    }

    const mediaBlob = await mediaResponse.blob()
    const mediaBuffer = Buffer.from(await mediaBlob.arrayBuffer())
    const base64Media = mediaBuffer.toString("base64")

    // Upload to Twitter using v1.1 API
    const uploadResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          media_data: base64Media,
        }),
      }
    )

    if (!uploadResponse.ok) {
      console.error("[Twitter] Media upload failed:", uploadResponse.status)
      return null
    }

    const uploadData = await uploadResponse.json()
    return uploadData.media_id_string
  } catch (error) {
    console.error("[Twitter] Media upload error:", error)
    return null
  }
}

/**
 * Gets the authenticated user's Twitter username
 */
async function getUsername(accessToken: string): Promise<string> {
  try {
    const response = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return "user" // Fallback
    }

    const data = await response.json()
    return data.data.username
  } catch (error) {
    return "user" // Fallback
  }
}
