// Common Props
export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  connected: boolean;
  oauth_url: string;
}

export interface SocialAccountSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
  mode?: 'onboarding' | 'settings';
}

export interface SocialConnectionCardProps {
  platform: SocialPlatform;
  onConnect: (platform: string) => void;
  isConnecting: boolean;
}