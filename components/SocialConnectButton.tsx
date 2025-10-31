import { Button } from '@/components/ui/button'

interface SocialConnectButtonProps {
  platform: 'twitter' | 'tiktok'
  className?: string
}

const platformConfig = {
  twitter: {
    icon: '𝕏',
    name: 'Twitter'
  },
  tiktok: {
    icon: '🎵',
    name: 'TikTok'
  }
}

export function SocialConnectButton({ platform, className = '' }: SocialConnectButtonProps) {
  const config = platformConfig[platform]
  
  const handleConnect = () => {
    // Direct redirect to OAuth flow
    window.location.href = `/api/auth/connect/${platform}`
  }

  return (
    <Button
      onClick={handleConnect}
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
    >
      <span className="text-lg">{config.icon}</span>
      <span>Connect {config.name}</span>
    </Button>
  )
}