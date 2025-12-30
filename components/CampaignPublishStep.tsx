import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

import { TiktokLogo, TwitterLogo } from "@phosphor-icons/react";

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  connectUrl: string;
}

const platforms: Platform[] = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: TiktokLogo,
    connectUrl: "https://open-api.tiktok.com/platform/oauth/connect",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: TwitterLogo,
    connectUrl: "https://twitter.com/i/oauth2/authorize",
  },
];

export function CampaignPublishStep({ campaignId }: { campaignId: string }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handlePublish = async (platformId: string) => {
    setSelectedPlatform(platformId);
    setIsConnecting(true);

    const platform = platforms.find((p) => p.id === platformId);
    if (!platform) return;

    // Check if already connected
    const supabase = createClient();
    const { data: account } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("platform", platformId)
      .single();

    if (account?.is_active) {
      // Account already connected - proceed to publish
      // TODO: Add publishing logic
      return;
    }

    // Not connected - redirect to OAuth
    const state = `campaign_${campaignId}_platform_${platformId}`;
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
    window.location.href = `${platform.connectUrl}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Choose where to publish</h3>

      <div className="grid grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Button
            key={platform.id}
            onClick={() => handlePublish(platform.id)}
            disabled={isConnecting}
            className="h-24 flex flex-col items-center justify-center gap-2"
            variant={selectedPlatform === platform.id ? "primary" : "outline"}
          >
            <platform.icon className="w-8 h-8" weight="duotone" />
            <span>{platform.name}</span>
          </Button>
        ))}
      </div>

      {isConnecting && (
        <div className="text-center text-sm text-muted-foreground">
          Connecting to {platforms.find((p) => p.id === selectedPlatform)?.name}
          ...
        </div>
      )}
    </div>
  );
}
