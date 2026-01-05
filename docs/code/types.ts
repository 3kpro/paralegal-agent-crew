
import { GoogleGenAI, Type } from '@google/genai';

export type Step = 'discover' | 'details' | 'settings' | 'results';

export interface Trend {
  title: string;
  searchVolume: string;
  relatedTopics: string[];
  sources?: { web: { uri: string; title: string } }[];
}

export type PresentationStyle = 'Benefits-focused' | 'Feature-focused' | 'Story-telling' | 'Technical Details';
export type FocusPoint = 'Quality' | 'Value' | 'Innovation' | 'Reliability' | 'Sustainability';
export type ContentLength = 'Concise' | 'Standard' | 'Detailed';
export type ContentTone = 'Professional' | 'Casual' | 'Humorous' | 'Inspirational' | 'Educational';
export type TargetAudience = 'General Audience' | 'Professionals' | 'Entrepreneurs' | 'Content Creators' | 'Students' | 'Tech Enthusiasts';
export type ContentFocus = 'Share Information' | 'Start Discussion' | 'Share Opinion/Take' | 'News/Update' | 'Tips & Advice' | 'Tell a Story';
export type CallToAction = 'Ask for Engagement' | 'Encourage Sharing' | 'Ask for Comments' | 'Ask to Follow' | 'Learn More' | 'No Specific CTA';
export type SocialPlatform = 'TikTok' | 'Instagram' | 'Twitter' | 'Facebook';

export interface ProductDetails {
  productName: string;
  productUrl: string;
  presentationStyle: PresentationStyle;
  focusPoints: FocusPoint[];
  highlightPrice: boolean;
  includeTestimonials: boolean;
  customDescription: string;
  aiDescription: string;
}

export interface CampaignImage {
  platform: SocialPlatform | '';
  style: string;
  generating: boolean;
  url: string;
  prompt: string;
}

export interface ContentSettings {
  creativity: number;
  contentLength: ContentLength;
  contentTone: ContentTone;
  targetAudience: TargetAudience;
  contentFocus: ContentFocus;
  callToAction: CallToAction;
}

export interface SocialPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
}

export interface AppState {
  step: Step;
  trendingTopic: string;
  productDetails: ProductDetails;
  campaignImage: CampaignImage;
  contentSettings: ContentSettings;
  generatedPosts: SocialPost[];
  isLoading: boolean;
  error: string | null;
}

export interface AppContextType extends AppState {
  setStep: (step: Step) => void;
  setTrendingTopic: (topic: string) => void;
  updateProductDetails: (details: Partial<ProductDetails>) => void;
  updateCampaignImage: (image: Partial<CampaignImage>) => void;
  updateContentSettings: (settings: Partial<ContentSettings>) => void;
  setGeneratedPosts: (posts: SocialPost[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export const AI_MODEL_TEXT = 'gemini-2.5-flash';
export const AI_MODEL_IMAGE = 'imagen-4.0-generate-001';

export const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
};

export const socialPostSchema = {
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      description: "Generated social media posts for different platforms.",
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, description: "The social media platform (e.g., Twitter, Instagram, Facebook, TikTok)." },
          content: { type: Type.STRING, description: "The main text content for the post or a script idea for video. Should be engaging and platform-appropriate." },
          hashtags: {
            type: Type.ARRAY,
            description: "A list of 3-5 relevant and trending hashtags.",
            items: { type: Type.STRING }
          }
        },
        required: ["platform", "content", "hashtags"]
      }
    }
  },
  required: ["posts"]
};
