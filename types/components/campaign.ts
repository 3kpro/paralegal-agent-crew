// Campaign Wizard Types
export interface CampaignWizardProps {
  defaultData?: CampaignData;
}

export interface CampaignData {
  content: string;
  style: CampaignStyle;
  publishSettings: PublishSettings;
}

export interface CampaignStyle {
  theme: string;
  music: string | null;
  effects: string[];
}

export interface PublishSettings {
  platforms: string[];
  schedule: Date | null;
}

// Component Props
export interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export interface StyleCustomizerProps {
  style: CampaignStyle;
  onChange: (style: CampaignStyle) => void;
}

export interface PublishSettingsProps {
  settings: PublishSettings;
  onChange: (settings: PublishSettings) => void;
  onBack: () => void;
  campaignData: CampaignData;
}