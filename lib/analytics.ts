// Analytics Helper Library
// Easy event tracking throughout the application

export type AnalyticsEventType =
  | "login"
  | "signup"
  | "content_generated"
  | "content_published"
  | "tier_upgrade"
  | "platform_connected"
  | "platform_disconnected"
  | "campaign_created"
  | "campaign_deleted"
  | "ai_tool_configured"
  | "feature_used"
  | "error"
  | "page_view";

export type AnalyticsEventCategory =
  | "auth"
  | "content"
  | "social"
  | "payment"
  | "campaign"
  | "ai"
  | "error"
  | "navigation";

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  event_category?: AnalyticsEventCategory;
  event_data?: Record<string, any>;
  session_id?: string;
}

/**
 * Track an analytics event
 * @param event - The event to track
 * @returns Promise that resolves when event is tracked
 */
export async function trackEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.warn("Failed to track analytics event:", event.event_type);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Analytics tracking error:", error);
    // Don't throw - analytics should never break the app
    return false;
  }
}

/**
 * Track user login
 */
export async function trackLogin() {
  return trackEvent({
    event_type: "login",
    event_category: "auth",
  });
}

/**
 * Track user signup
 */
export async function trackSignup(data?: { method?: string }) {
  return trackEvent({
    event_type: "signup",
    event_category: "auth",
    event_data: data,
  });
}

/**
 * Track content generation
 */
export async function trackContentGenerated(data: {
  platform: string;
  ai_provider?: string;
  success: boolean;
  error?: string;
}) {
  return trackEvent({
    event_type: "content_generated",
    event_category: "content",
    event_data: data,
  });
}

/**
 * Track content publishing
 */
export async function trackContentPublished(data: {
  platform: string;
  campaign_id?: string;
  success: boolean;
  error?: string;
}) {
  return trackEvent({
    event_type: "content_published",
    event_category: "content",
    event_data: data,
  });
}

/**
 * Track platform connection
 */
export async function trackPlatformConnected(data: {
  platform: string;
  success: boolean;
}) {
  return trackEvent({
    event_type: "platform_connected",
    event_category: "social",
    event_data: data,
  });
}

/**
 * Track platform disconnection
 */
export async function trackPlatformDisconnected(data: { platform: string }) {
  return trackEvent({
    event_type: "platform_disconnected",
    event_category: "social",
    event_data: data,
  });
}

/**
 * Track tier upgrade
 */
export async function trackTierUpgrade(data: {
  from_tier: string;
  to_tier: string;
  plan_id?: string;
}) {
  return trackEvent({
    event_type: "tier_upgrade",
    event_category: "payment",
    event_data: data,
  });
}

/**
 * Track campaign creation
 */
export async function trackCampaignCreated(data: {
  campaign_type: string;
  platforms: string[];
  ai_provider?: string;
}) {
  return trackEvent({
    event_type: "campaign_created",
    event_category: "campaign",
    event_data: data,
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsed(data: {
  feature_name: string;
  action?: string;
}) {
  return trackEvent({
    event_type: "feature_used",
    event_category: "navigation",
    event_data: data,
  });
}

/**
 * Track error
 */
export async function trackError(data: {
  error_type: string;
  error_message: string;
  context?: string;
  stack?: string;
}) {
  return trackEvent({
    event_type: "error",
    event_category: "error",
    event_data: data,
  });
}

/**
 * Track page view
 */
export async function trackPageView(data: { page: string; referrer?: string }) {
  return trackEvent({
    event_type: "page_view",
    event_category: "navigation",
    event_data: data,
  });
}

/**
 * Get usage metrics and limits
 */
export async function getUsageMetrics() {
  try {
    const response = await fetch("/api/analytics/usage");
    if (!response.ok) {
      console.warn("Failed to get usage metrics");
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn("Failed to get usage metrics:", error);
    return null;
  }
}

/**
 * Get analytics overview
 */
export async function getAnalyticsOverview(days: number = 30) {
  try {
    const response = await fetch(`/api/analytics/overview?days=${days}`);
    if (!response.ok) {
      console.warn("Failed to get analytics overview");
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn("Failed to get analytics overview:", error);
    return null;
  }
}

/**
 * Check if user has reached usage limit
 */
export async function checkUsageLimit(
  limitType:
    | "content_generated"
    | "content_published"
    | "ai_requests"
    | "platforms"
    | "ai_tools",
): Promise<boolean> {
  const metrics = await getUsageMetrics();
  if (!metrics) return false;

  return metrics.limits_reached[limitType] === true;
}
