import { Button } from "@/components/ui/Button";
import { TwitterLogo, TiktokLogo } from "@phosphor-icons/react";

interface SocialConnectButtonProps {
  platform: "twitter" | "tiktok";
  className?: string;
}

const platformConfig = {
  twitter: {
    icon: TwitterLogo,
    name: "Twitter",
  },
  tiktok: {
    icon: TiktokLogo,
    name: "TikTok",
  },
};

export function SocialConnectButton({
  platform,
  className = "",
}: SocialConnectButtonProps) {
  const config = platformConfig[platform];

  const handleConnect = () => {
    // Direct redirect to OAuth flow
    window.location.href = `/api/auth/connect/${platform}`;
  };

  return (
    <Button
      onClick={handleConnect}
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
    >
      <config.icon className="w-5 h-5" weight="duotone" />
      <span>Connect {config.name}</span>
    </Button>
  );
}
