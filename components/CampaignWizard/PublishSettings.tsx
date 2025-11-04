"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: string;
  connectUrl: string;
}

const platforms: Platform[] = [
  {
    id: "twitter",
    name: "Twitter",
    icon: "𝕏",
    connectUrl: "https://twitter.com/i/oauth2/authorize",
  },
];

interface PublishSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
  onBack: () => void;
  campaignData: any;
}

export function PublishSettings({
  onBack,
  campaignData,
}: PublishSettingsProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handlePlatformSelect = async (platformId: string) => {
    // Check if already connected
    const supabase = createClient();
    const { data: account } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("platform", platformId)
      .single();

    if (account?.is_active) {
      // Already connected - just select it
      setSelectedPlatforms((prev) =>
        prev.includes(platformId)
          ? prev.filter((p) => p !== platformId)
          : [...prev, platformId],
      );
      setShowError(false);
      return;
    }

    // Need to connect - start OAuth flow
    setConnecting(platformId);
    setError(null);

    try {
      const platform = platforms.find((p) => p.id === platformId);
      if (!platform) throw new Error("Invalid platform");

      const state = `campaign_${Date.now()}_platform_${platformId}`;
      const redirectUri = `${window.location.origin}/api/auth/callback/${platformId}`;

      const params = new URLSearchParams({
        client_id:
          platformId === "tiktok"
            ? process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!
            : process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: "code",
        state,
        scope:
          platformId === "tiktok"
            ? "user.info.basic,video.list,video.upload"
            : "tweet.read tweet.write users.read",
      });

      // Redirect to platform OAuth
      window.location.assign(`${platform.connectUrl}?${params.toString()}`);
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect to platform");
      setConnecting(null);
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setShowError(true);
      return;
    }

    setPublishing(true);
    setError(null);
    setShowError(false);

    try {
      // Create campaign in database
      const supabase = createClient();
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          content: campaignData.content,
          style: campaignData.style,
          platforms: selectedPlatforms,
          status: "publishing",
        })
        .select()
        .single();

      if (campaignError) {
        throw new Error(campaignError.message);
      }

      if (!campaign) {
        throw new Error("Failed to create campaign");
      }

      // Trigger publishing for each platform
      await Promise.all(
        selectedPlatforms.map(async (platform) => {
          const response = await fetch("/api/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              campaignId: campaign.id,
              platform,
              content: campaignData.content,
              style: campaignData.style,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to publish to ${platform}`);
          }
        }),
      );

      // Update campaign status
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({ status: "published" })
        .eq("id", campaign.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Redirect to success page
      window.location.assign(`/campaigns/${campaign.id}/success`);
    } catch (err) {
      console.error("Publishing error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to publish campaign",
      );
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Choose platforms</h3>
        <div className="grid grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform.id)}
              disabled={connecting !== null}
              className="h-24 flex flex-col items-center justify-center gap-2"
              variant={
                selectedPlatforms.includes(platform.id) ? "primary" : "outline"
              }
              aria-pressed={selectedPlatforms.includes(platform.id) ? "true" : "false"}
              data-testid={`platform-button-${platform.id}`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span>{platform.name}</span>
              {connecting === platform.id && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {(error || showError) && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          data-testid="error-message"
        >
          <span className="block sm:inline">
            {error || "Please select at least one platform"}
          </span>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={() => {
            if (selectedPlatforms.length === 0) {
              setShowError(true);
              return;
            }
            handlePublish();
          }}
          disabled={publishing || selectedPlatforms.length === 0}
          data-testid="publish-button"
        >
          {publishing ? (
            <>
              <Loader2
                data-testid="loading-spinner"
                className="w-4 h-4 animate-spin mr-2"
              />
              Publishing...
            </>
          ) : (
            "Publish Now"
          )}
        </Button>
      </div>
    </div>
  );
}
