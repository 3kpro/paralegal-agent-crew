"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Fireworks from "@/components/Fireworks";
import { GenerationResponse, ValidationError, RateLimitError, SetupRequiredError } from "@/lib/types/api";

// Type guards for API responses
function isSetupRequiredError(data: GenerationResponse): data is SetupRequiredError {
  return !data.success && data.requiresSetup === true;
}

function isRateLimitError(data: GenerationResponse): data is RateLimitError {
  return !data.success && data.limit_reached === true;
}

function isValidationError(data: GenerationResponse): data is ValidationError {
  return !data.success && Array.isArray(data.details) && data.details.length > 0;
}
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Music,
  MessageSquare,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Check,
  FileText,
  X,
  BarChart3,
  Flame,
  Copy,
  Layout,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TetrisLoading } from "@/components/ui";
import ErrorBoundary from "@/components/ErrorBoundary";
import ContentSettings from "./components/ContentSettings";
import GeneratedContentCard from "./components/GeneratedContentCard";
import Toast from "./components/Toast";
import PublishButton from "@/components/PublishButton";
import { ViralScoreBreakdown } from "@/components/ViralScoreBreakdown";
import {
  Platform,
  StepConfig,
  ToastState,
  Trend,
  GeneratedContent,
  ContentControls,
  CampaignPayload,
  ScheduledPost,
} from "./types";

// Interface for AI provider data
interface AIProvider {
  provider_key: string;
  isConfigured: boolean;
  name?: string;
}

// Interface for connected account data
interface ConnectedAccount {
  platform: string;
  platformUsername?: string;
}

// Interface for generated content data
interface ContentData {
  content?: string;
  [key: string]: unknown;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Edit mode detection
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingCampaignData, setLoadingCampaignData] = useState(false);

  console.log("[EDIT MODE] editId:", editId, "isEditMode:", isEditMode);

  // Card-based navigation state
  const [currentCard, setCurrentCard] = useState(1);
  const [cardDirection, setCardDirection] = useState(1); // 1 for forward, -1 for back
  const [activePlatformView, setActivePlatformView] = useState<string>(""); // For Card 6 platform switcher
  const [showFireworks, setShowFireworks] = useState(false);
  const [campaignSaved, setCampaignSaved] = useState(false);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [campaignName, setCampaignName] = useState("");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Step 2: Trend Discovery
  const [searchQuery, setSearchQuery] = useState("");
  const [trendSource] = useState("mixed");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<Trend[]>([]); // Multiple trends
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [_hasSearched, setHasSearched] = useState(false);

  // Generate button motivational messages
  const [generateButtonText] = useState(() => {
    const messages = [
      "Show me magic ✨",
      "Let's dance 💃",
      "Make it pop 🎉",
      "Bring IT!! 🔥",
      "Unleash creativity 🚀",
      "Let's go viral 📈",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  });

  // Step 3: Content Generation + Controls
  const [aiProvider, setAiProvider] = useState("openai");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  // Consolidated content controls
  const [controls, setControls] = useState<ContentControls>({
    temperature: 0.7,
    tone: "professional",
    length: "standard",
    targetAudience: "professionals",
    contentFocus: "informative",
    callToAction: "engage",
  });

  // NEW: Multi-select audiences (replaces single targetAudience)
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(["professionals"]);

  // NEW: Predicted viral score based on current settings
  const [predictedViralScore, setPredictedViralScore] = useState(65);

  // NEW: Show AI optimization reasoning
  const [showOptimizationReason, setShowOptimizationReason] = useState(false);
  const [optimizationReason, setOptimizationReason] = useState("");

  // NEW: User's saved templates
  const [_savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // NEW: User's interests from onboarding
  const [_userInterests, setUserInterests] = useState<string[]>([]);

  // Post-generation editing
  const [editingContent, setEditingContent] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  // Track toast timeout to prevent stacking
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Show toast notification with auto-dismiss
   * Fixed: Added useRef to track and clear previous timeouts, preventing toast stacking
   */
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      // Clear previous timeout if one exists
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      // Show new toast
      setToast({ show: true, message, type });

      // Set new timeout to dismiss toast
      toastTimeoutRef.current = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
        toastTimeoutRef.current = null;
      }, 4000);
    },
    []
  );

  // Memoized platform list to prevent recreating on every render
  const platforms = useMemo<Platform[]>(
    () => [
      { id: "twitter", name: "Twitter", icon: Twitter, color: "#1DA1F2" },
      { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
      { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2" },
      { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F" },
      { id: "tiktok", name: "TikTok", icon: Music, color: "#000000" },
      { id: "reddit", name: "Reddit", icon: MessageSquare, color: "#FF4500" },
    ],
    []
  );

  // NEW: Engagement data for tooltips
  const engagementData = useMemo(() => ({
    tone: {
      professional: { boost: "+23%", desc: "Higher B2B engagement, builds authority" },
      casual: { boost: "+18%", desc: "More relatable, increases shares" },
      friendly: { boost: "+15%", desc: "Better for community building" },
    },
    contentFocus: {
      informative: { boost: "+20%", desc: "Builds trust, high saves" },
      discussion: { boost: "+25%", desc: "Drives comments and replies" },
      opinion: { boost: "+15%", desc: "Polarizing, high engagement" },
      news: { boost: "+18%", desc: "Timely content performs well" },
      tips: { boost: "+28%", desc: "Most saved content type" },
      story: { boost: "+22%", desc: "Emotional connection, high shares" },
      walkthrough: { boost: "+26%", desc: "Tutorial content, high value" },
    },
    targetAudience: {
      professionals: { boost: "+20%", desc: "LinkedIn best performer" },
      entrepreneurs: { boost: "+22%", desc: "Action-oriented, high engagement" },
      creators: { boost: "+24%", desc: "Highly engaged community" },
      students: { boost: "+16%", desc: "TikTok/Instagram strong" },
      techies: { boost: "+21%", desc: "Twitter/Reddit strong" },
      gamers: { boost: "+19%", desc: "Twitch/YouTube crossover" },
      hobbyists: { boost: "+17%", desc: "Niche communities" },
    },
    callToAction: {
      engage: { boost: "+12%", desc: "Generic but effective" },
      share: { boost: "+18%", desc: "Viral amplification" },
      comment: { boost: "+22%", desc: "Algorithm boost from comments" },
      follow: { boost: "+8%", desc: "Growth-focused" },
      learn: { boost: "+15%", desc: "Educational content" },
    },
  }), []);

  // NEW: Platform presets
  const platformPresets = useMemo(() => ({
    twitter: {
      tone: "casual",
      length: "short",
      contentFocus: "discussion",
      audiences: ["techies", "professionals"],
      callToAction: "comment",
      reason: "Twitter thrives on quick, conversational content that sparks discussion. Short threads with debate-worthy takes get the most engagement.",
    },
    tiktok: {
      tone: "casual",
      length: "short",
      contentFocus: "tips",
      audiences: ["creators", "students"],
      callToAction: "share",
      reason: "TikTok's algorithm loves bite-sized tips and tutorials that viewers save and share. Casual, approachable tone performs best.",
    },
    linkedin: {
      tone: "professional",
      length: "standard",
      contentFocus: "informative",
      audiences: ["professionals", "entrepreneurs"],
      callToAction: "engage",
      reason: "LinkedIn rewards thoughtful, professional content that provides value. Standard length posts with clear insights drive engagement.",
    },
  }), []);

  // NEW: Trending combinations (simulated - could be fetched from analytics)
  const trendingCombinations = useMemo(() => [
    {
      name: "Viral Thread Formula",
      tone: "casual",
      contentFocus: "tips",
      audiences: ["creators", "entrepreneurs"],
      callToAction: "share",
      successRate: "89%",
      uses: 1247,
    },
    {
      name: "LinkedIn Authority",
      tone: "professional",
      contentFocus: "informative",
      audiences: ["professionals"],
      callToAction: "engage",
      successRate: "85%",
      uses: 892,
    },
    {
      name: "TikTok Viral",
      tone: "casual",
      contentFocus: "story",
      audiences: ["students", "hobbyists"],
      callToAction: "share",
      successRate: "91%",
      uses: 2103,
    },
  ], []);

  // Memoized step configuration
  const stepConfig = useMemo<StepConfig[]>(
    () => [
      { number: 1, icon: Zap },
      { number: 2, icon: TrendingUp },
      { number: 3, icon: Sparkles },
    ],
    []
  );

  /**
   * Toggle platform selection
   */
  const togglePlatform = useCallback((platformId: string) => {
    setTargetPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  }, []);

  /**
   * Toggle trend selection (multiple)
   */
  const toggleTrendSelection = useCallback((trend: Trend) => {
    setSelectedTrends((prev) => {
      const isSelected = prev.some((t) => t.title === trend.title);
      if (isSelected) {
        return prev.filter((t) => t.title !== trend.title);
      } else {
        return [...prev, trend];
      }
    });
  }, []);

  /**
   * Card navigation helpers
   */
  const goToNextCard = useCallback(() => {
    setCardDirection(1);
    setCurrentCard((prev) => {
      const nextCard = Math.min(prev + 1, 7);
      // Set first platform as active when entering Card 7
      if (nextCard === 7 && targetPlatforms.length > 0) {
        setActivePlatformView(targetPlatforms[0]);
      }
      return nextCard;
    });
  }, [targetPlatforms]);

  const goToPrevCard = useCallback(() => {
    // Smart back button for Card 7 (content display)
    if (currentCard === 7 && generatedContent && Object.keys(generatedContent).length > 0) {
      if (campaignSaved || isEditMode) {
        // If saved or in edit mode, go to campaigns page
        router.push("/campaigns");
      } else {
        // If not saved, warn about unsaved changes
        if (confirm("You have unsaved changes. Exit anyway? Your generated content will be lost.")) {
          router.push("/campaigns");
        }
      }
    } else {
      // For other cards, normal navigation
      setCardDirection(-1);
      setCurrentCard((prev) => Math.max(prev - 1, 1));
    }
  }, [currentCard, generatedContent, campaignSaved, isEditMode, router]);

  /**
   * NEW: AI Optimize - Auto-select best settings based on user interests and target platforms
   */
  const handleAIOptimize = useCallback(() => {
    const primaryPlatform = targetPlatforms[0] || "linkedin";
    const preset = platformPresets[primaryPlatform as keyof typeof platformPresets] || platformPresets.linkedin;

    // Apply preset
    setControls({
      ...controls,
      tone: preset.tone,
      length: preset.length,
      contentFocus: preset.contentFocus,
      callToAction: preset.callToAction,
    });

    // Set multi-select audiences
    setSelectedAudiences(preset.audiences);

    // Show reasoning
    setOptimizationReason(preset.reason);
    setShowOptimizationReason(true);

    // Calculate and show predicted viral score
    calculatePredictedViralScore(preset.tone, preset.contentFocus, preset.audiences, preset.callToAction);

    showToast("🎯 Settings optimized for maximum engagement!", "success");
  }, [targetPlatforms, platformPresets, controls, showToast]);

  /**
   * NEW: Calculate predicted viral score based on selected settings
   */
  const calculatePredictedViralScore = useCallback((
    tone: string,
    focus: string,
    audiences: string[],
    cta: string
  ) => {
    // Base score
    let score = 50;

    // Add boosts from each setting
    const toneBoost = parseInt(engagementData.tone[tone as keyof typeof engagementData.tone]?.boost || "0");
    const focusBoost = parseInt(engagementData.contentFocus[focus as keyof typeof engagementData.contentFocus]?.boost || "0");
    const ctaBoost = parseInt(engagementData.callToAction[cta as keyof typeof engagementData.callToAction]?.boost || "0");

    // Average audience boost (for multi-select)
    const audienceBoosts = audiences.map(a =>
      parseInt(engagementData.targetAudience[a as keyof typeof engagementData.targetAudience]?.boost || "0")
    );
    const avgAudienceBoost = audienceBoosts.length > 0
      ? audienceBoosts.reduce((sum, b) => sum + b, 0) / audienceBoosts.length
      : 0;

    // Calculate total score (max 100)
    score = Math.min(100, Math.round(score + toneBoost + focusBoost + avgAudienceBoost + ctaBoost));

    setPredictedViralScore(score);
    return score;
  }, [engagementData]);

  /**
   * NEW: Toggle audience selection (multi-select, max 3)
   */
  const toggleAudience = useCallback((audience: string) => {
    setSelectedAudiences(prev => {
      const isSelected = prev.includes(audience);
      if (isSelected) {
        // Remove if already selected
        return prev.filter(a => a !== audience);
      } else if (prev.length < 3) {
        // Add if under limit
        return [...prev, audience];
      }
      return prev; // Already at max
    });
  }, []);

  /**
   * NEW: Apply platform preset
   */
  const applyPlatformPreset = useCallback((platform: "twitter" | "tiktok" | "linkedin") => {
    const preset = platformPresets[platform];
    setControls({
      ...controls,
      tone: preset.tone,
      length: preset.length,
      contentFocus: preset.contentFocus,
      callToAction: preset.callToAction,
    });
    setSelectedAudiences(preset.audiences);
    setOptimizationReason(preset.reason);
    setShowOptimizationReason(true);
    calculatePredictedViralScore(preset.tone, preset.contentFocus, preset.audiences, preset.callToAction);
    showToast(`Applied ${platform.charAt(0).toUpperCase() + platform.slice(1)} best practices`, "success");
  }, [platformPresets, controls, calculatePredictedViralScore, showToast]);

  /**
   * NEW: Save current settings as template
   */
  const handleSaveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }

    const newTemplate = {
      name: templateName,
      tone: controls.tone,
      length: controls.length,
      contentFocus: controls.contentFocus,
      audiences: selectedAudiences,
      callToAction: controls.callToAction,
      createdAt: new Date().toISOString(),
    };

    // In production, save to Supabase user_templates table
    setSavedTemplates(prev => [...prev, newTemplate]);
    setShowSaveTemplateDialog(false);
    setTemplateName("");
    showToast(`Template "${templateName}" saved!`, "success");
  }, [templateName, controls, selectedAudiences, showToast]);

  /**
   * NEW: Apply trending combination
   */
  const applyTrendingCombination = useCallback((combo: typeof trendingCombinations[0]) => {
    setControls({
      ...controls,
      tone: combo.tone,
      contentFocus: combo.contentFocus,
      callToAction: combo.callToAction,
    });
    setSelectedAudiences(combo.audiences);
    calculatePredictedViralScore(combo.tone, combo.contentFocus, combo.audiences, combo.callToAction);
    showToast(`Applied "${combo.name}" (${combo.successRate} success rate)`, "success");
  }, [controls, calculatePredictedViralScore, trendingCombinations, showToast]);

  const goToCard = useCallback((cardNum: number) => {
    setCardDirection(cardNum > currentCard ? 1 : -1);
    setCurrentCard(cardNum);
    // Set first platform as active when entering Card 7
    if (cardNum === 7 && targetPlatforms.length > 0) {
      setActivePlatformView(targetPlatforms[0]);
    }
  }, [currentCard, targetPlatforms]);

  /**
   * Search for trends based on query
   */
  const searchTrends = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoadingTrends(true);
    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(searchQuery)}&mode=ideas&source=${trendSource}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();
      if (data.success) {
        setTrends(data.data?.trending || []);
      } else {
        console.error("Trends API error:", data.error);
        setTrends([]);
      }
    } catch (error) {
      console.error("Failed to fetch trends:", error);
      setTrends([]);
    } finally {
      setLoadingTrends(false);
    }
  }, [searchQuery, trendSource]);

  /**
   * Load trending topics without a specific search query
   */
  const loadTrendingTopics = useCallback(async () => {
    setLoadingTrends(true);
    setHasSearched(true);
    goToCard(5);
    
    try {
      const response = await fetch(
        `/api/trends?mode=trending&source=${trendSource}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();
      if (data.success) {
        setTrends(data.data?.trending || []);
      } else {
        console.error("Trends API error:", data.error);
        setTrends([]);
      }
    } catch (error) {
      console.error("Failed to fetch trends:", error);
      setTrends([]);
    } finally {
      setLoadingTrends(false);
    }
  }, [trendSource, goToCard]);

  // Load AI tools on mount
  useEffect(() => {
    async function loadAITools() {
      try {
        const response = await fetch("/api/ai-tools/list");
        const data = await response.json();
        if (data.success) {
          const configuredTools = data.providers.filter(
            (p: AIProvider) =>
              p.isConfigured &&
              p.provider_key !== "openai" &&
              p.provider_key !== "anthropic",
          );
          if (configuredTools.length > 0) {
            setAiProvider(configuredTools[0].provider_key);
          }
        }
      } catch (error) {
        console.error("Failed to load AI tools:", error);
      }
    }
    loadAITools();
  }, []);

  // Load connected social accounts on mount
  useEffect(() => {
    async function loadSocialAccounts() {
      try {
        const response = await fetch("/api/social-accounts");
        const data = await response.json();
        if (data.success && data.accounts) {
          const connected = data.accounts.map(
            (account: ConnectedAccount) => account.platform,
          );
          setConnectedPlatforms(connected);
        }
      } catch (error) {
        console.error("Failed to load social accounts:", error);
      }
    }
    loadSocialAccounts();
  }, []);

  // NEW: Load user interests from onboarding
  useEffect(() => {
    async function loadUserInterests() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("interests")
            .eq("id", user.id)
            .single();

          // Silently skip if interests column doesn't exist (not critical)
          if (error) return;

          if (profile?.interests) {
            setUserInterests(profile.interests);
            // Pre-populate audiences based on interests mapping
            const mappedAudiences = mapInterestsToAudiences(profile.interests);
            if (mappedAudiences.length > 0) {
              setSelectedAudiences(mappedAudiences.slice(0, 2)); // Max 2 by default
            }
          }
        }
      } catch (error) {
        // Silently skip interests loading errors (non-critical feature)
      }
    }
    loadUserInterests();
  }, [supabase]);

  // Load existing campaign data when in edit mode
  useEffect(() => {
    if (!editId) return;

    async function loadCampaignData() {
      setLoadingCampaignData(true);
      setIsEditMode(true);

      try {
        const { data: campaign, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", editId)
          .single();

        if (error) throw error;

        if (campaign) {
          // Populate basic info (Card 1)
          setCampaignName(campaign.name || "");
          setTargetPlatforms(campaign.target_platforms || []);

          // Populate trends (Card 3)
          if (campaign.source_data?.trends) {
            setSelectedTrends(campaign.source_data.trends);
          }

          // Populate content controls (Card 6)
          if (campaign.source_data?.controls) {
            const controls = campaign.source_data.controls;
            setControls({
              temperature: controls.temperature || 0.7,
              tone: controls.tone || "professional",
              length: controls.length || "standard",
              targetAudience: controls.targetAudience || "professionals",
              contentFocus: controls.contentFocus || "informative",
              callToAction: controls.callToAction || "engage",
            });
          }

          if (campaign.source_data?.selectedAudiences) {
            setSelectedAudiences(campaign.source_data.selectedAudiences);
          }

          // Load generated content if exists
          if (campaign.source_data?.generatedContent) {
            setGeneratedContent(campaign.source_data.generatedContent);
          }

          showToast("Campaign loaded successfully", "success");
        }
      } catch (error) {
        console.error("Failed to load campaign:", error);
        showToast("Failed to load campaign data", "error");
      } finally {
        setLoadingCampaignData(false);
      }
    }

    loadCampaignData();
  }, [editId, supabase, showToast]);

  // NEW: Helper to map interests to audiences
  const mapInterestsToAudiences = (interests: string[]): string[] => {
    const mapping: Record<string, string[]> = {
      technology: ["techies", "professionals"],
      business: ["entrepreneurs", "professionals"],
      gaming: ["gamers"],
      education: ["students", "professionals"],
      fitness: ["hobbyists"],
      finance: ["professionals", "entrepreneurs"],
      travel: ["hobbyists"],
      food: ["hobbyists"],
      fashion: ["creators"],
      entertainment: ["creators"],
      parenting: ["hobbyists"],
      lifestyle: ["hobbyists"],
    };

    const audiences = new Set<string>();
    interests.forEach(interest => {
      const mapped = mapping[interest];
      if (mapped) {
        mapped.forEach(a => audiences.add(a));
      }
    });

    return Array.from(audiences);
  };

  // NEW: Update viral score when settings change
  useEffect(() => {
    if (currentCard === 6) {
      calculatePredictedViralScore(
        controls.tone,
        controls.contentFocus,
        selectedAudiences,
        controls.callToAction
      );
    }
  }, [controls.tone, controls.contentFocus, selectedAudiences, controls.callToAction, currentCard, calculatePredictedViralScore]);

  // NEW: Keyboard shortcuts
  useEffect(() => {
    if (currentCard !== 6) return; // Only active on customization card

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Tone shortcuts: 1=professional, 2=casual, 3=friendly
      if (e.key === '1') {
        setControls(prev => ({ ...prev, tone: 'professional' }));
      } else if (e.key === '2') {
        setControls(prev => ({ ...prev, tone: 'casual' }));
      } else if (e.key === '3') {
        setControls(prev => ({ ...prev, tone: 'friendly' }));
      }

      // Length shortcuts: S=short, M=standard, L=long
      else if (e.key.toLowerCase() === 's') {
        setControls(prev => ({ ...prev, length: 'short' }));
      } else if (e.key.toLowerCase() === 'm') {
        setControls(prev => ({ ...prev, length: 'standard' }));
      } else if (e.key.toLowerCase() === 'l') {
        setControls(prev => ({ ...prev, length: 'long' }));
      }

      // A = AI Optimize
      else if (e.key.toLowerCase() === 'a') {
        handleAIOptimize();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentCard, handleAIOptimize]);

  /**
   * Generate content for selected platforms
   */
  const generateContent = useCallback(async () => {
    if (selectedTrends.length === 0) {
      showToast("Please select at least one trend before generating content", "error");
      return;
    }

    if (selectedAudiences.length === 0) {
      showToast("Please select at least one target audience", "error");
      return;
    }

    setGeneratingContent(true);
    try {
      // Map UI length values to API format
      const lengthMapping: Record<string, string> = {
        'short': 'concise',
        'standard': 'standard',
        'long': 'detailed',
      };

      const requestBody = {
        topic: selectedTrends.map(t => t.title).join(", "),
        formats: targetPlatforms,
        preferredProvider: aiProvider,
        // Pass content controls to API (map values to API format)
        temperature: controls.temperature,
        tone: controls.tone,
        length: lengthMapping[controls.length] || 'standard',
        audience: selectedAudiences[0] || 'professionals',
        contentFocus: controls.contentFocus,
        callToAction: controls.callToAction,
      };

      let response: Response;
      try {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      } catch (fetchError) {
        console.error('[Generate Content] Network error:', fetchError);
        showToast("Network error. Please check your connection and try again.", "error");
        return;
      }

      // Parse response regardless of status to get detailed error info
      let responseData: GenerationResponse;
      try {
        const responseText = await response.text();
        console.log('[Generate Content] Raw response:', responseText);
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('[Generate Content] Failed to parse response:', parseError);
        showToast("Invalid server response. Please try again.", "error");
        return;
      }

      console.log('[Generate Content] Parsed response:', responseData);

      // Log detailed error info if response not ok
      if (!response.ok) {
        console.error('[Generate Content] HTTP error:', response.status, response.statusText);
        console.error('[Generate Content] Error details:', responseData);
      }

      if (responseData.success && responseData.content) {
        setGeneratedContent(responseData.content);
        showToast("Content generated successfully!", "success");
        
        // Trigger fireworks celebration after a delay so content shows first
        setTimeout(() => {
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 5000);
        }, 1000);
      } else {
        // Safe error logging
        console.error('Generation error details:', responseData);
        
        // Type guards for specific error types
        if (isSetupRequiredError(responseData)) {
          showToast("No AI tools configured. Redirecting to Settings...", "error");
          setTimeout(() => router.push("/settings?tab=api-keys"), 2000);
          return;
        }

        if (isRateLimitError(responseData)) {
          const message = responseData.message || `Daily limit reached (${responseData.current_usage}/${responseData.daily_limit}). Please upgrade your plan.`;
          showToast(message, "error");
          return;
        }

        if (isValidationError(responseData)) {
          const message = `Validation Error: ${responseData.details
            .map(d => `${d.field}: ${d.message}`)
            .join(', ')}`;
          showToast(message, "error");
          return;
        }

        // Generic error handling with detailed error info
        let errorMessage = responseData.message || responseData.error || "Content generation failed. Please try again.";

        // Add error type and details for debugging (500 errors)
        if (responseData.errorType || responseData.details) {
          console.error('[Generate Content] Error Type:', responseData.errorType);
          console.error('[Generate Content] Error Details:', responseData.details);
          errorMessage += ` (${responseData.errorType || 'Error'})`;
        }

        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      showToast("Content generation failed. Please try again.", "error");
    } finally {
      setGeneratingContent(false);
    }
  }, [selectedTrends, targetPlatforms, aiProvider, controls, selectedAudiences, showToast, router]);

  /**
   * Toggle edit mode for a platform's content
   * Fixed: Removed object dependencies [generatedContent, editedContent] that were causing
   * infinite callback recreation. Using state setters instead which have stable references.
   */
  const toggleEdit = useCallback((platform: string) => {
    // Get current state in closure
    setGeneratedContent((currentGenerated) => {
      setEditingContent((prev) => ({
        ...prev,
        [platform]: !prev[platform],
      }));

      // Initialize edited content with current content if not already set
      if (currentGenerated && currentGenerated[platform]) {
        setEditedContent((prev) => {
          if (prev[platform]) return prev; // Already initialized
          const contentData = currentGenerated[platform];
          const content =
            typeof contentData === "string"
              ? contentData
              : contentData?.content || "";
          return {
            ...prev,
            [platform]: content,
          };
        });
      }
      return currentGenerated;
    });
  }, []);

  /**
   * Save edit for a platform's content
   * Fixed: Removed object dependencies [editedContent, generatedContent] that were causing
   * infinite callback recreation. Using state setter callback patterns instead.
   */
  const saveEdit = useCallback((platform: string) => {
    // Update generated content using the updater function
    setGeneratedContent((prev) => {
      if (!prev) return prev;
      
      // Get edited content from state at call time
      setEditedContent((editedContentSnapshot) => {
        const editedText = editedContentSnapshot[platform];
        if (editedText) {
          // This closure captures the edited content at save time
          setGeneratedContent((prevGen) => {
            if (!prevGen) return prevGen;
            return {
              ...prevGen,
              [platform]:
                typeof prevGen[platform] === "string"
                  ? editedText
                  : {
                      ...prevGen[platform],
                      content: editedText,
                    },
            };
          });
        }
        return editedContentSnapshot;
      });
      return prev;
    });

    // Exit edit mode
    setEditingContent((prev) => ({
      ...prev,
      [platform]: false,
    }));
  }, []);

  /**
   * Handle content edit change
   */
  const handleContentChange = useCallback(
    (platform: string, content: string) => {
      setEditedContent((prev) => ({
        ...prev,
        [platform]: content,
      }));
    },
    []
  );

  /**
   * Handle content controls change
   */
  const handleControlsChange = useCallback((newControls: ContentControls) => {
    setControls(newControls);
  }, []);

  /**
   * Save campaign (as draft or scheduled)
   */
  const saveCampaign = useCallback(
    async (publishNow = false) => {
      console.log("[SAVE CAMPAIGN] Function called. publishNow:", publishNow, "generatedContent exists:", !!generatedContent);
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("[SAVE CAMPAIGN] User:", user?.id);

        if (!user) {
          console.error("[SAVE CAMPAIGN] No user - redirecting to login");
          showToast("Please log in to save campaigns", "error");
          router.push("/login");
          return;
        }

        if (!generatedContent) {
          console.error("[SAVE CAMPAIGN] No generated content - aborting save");
          showToast("No content to save. Please generate content first.", "error");
          return;
        }

        // Save campaign metadata
        const campaignPayload: CampaignPayload = {
          user_id: user.id,
          name: campaignName,
          target_platforms: targetPlatforms,
          status: publishNow ? "scheduled" : "draft",
          campaign_type: "trending",
          source_type: "trending",
          source_data: {
            trend: selectedTrend || selectedTrends[0] || null,
            trends: selectedTrends,
            query: searchQuery,
            controls: {
              temperature: controls.temperature,
              tone: controls.tone,
              length: controls.length,
              targetAudience: controls.targetAudience,
              contentFocus: controls.contentFocus,
              callToAction: controls.callToAction,
            },
            selectedAudiences: selectedAudiences,
            generatedContent: generatedContent,
          },
          ai_provider: aiProvider,
          tone: controls.tone,
        };

        let campaign;
        let campaignError;

        if (isEditMode && editId) {
          // UPDATE existing campaign
          const { data, error } = await supabase
            .from("campaigns")
            .update(campaignPayload)
            .eq("id", editId)
            .select()
            .single();
          campaign = data;
          campaignError = error;
        } else {
          // INSERT new campaign
          console.log("[Campaign Save] Payload:", campaignPayload);
          const { data, error } = await supabase
            .from("campaigns")
            .insert(campaignPayload)
            .select()
            .single();
          campaign = data;
          campaignError = error;
          console.log("[Campaign Save] Result:", { data, error });
        }

        if (campaignError) {
          console.error("[Campaign Save] Error:", campaignError);
          throw campaignError;
        }

        // Save generated content for each platform
        const postsToInsert: ScheduledPost[] = [];
        for (const [platform, contentData] of Object.entries(generatedContent)) {
          if (platform === "hashtags") continue;

          // Handle both string and object formats
          const content =
            typeof contentData === "string"
              ? contentData
              : (contentData as ContentData)?.content || "";

          if (!content) continue;

          // Set scheduled_at to future time for scheduled posts, current time for drafts
          const scheduledTime = publishNow
            ? new Date(Date.now() + 60000).toISOString() // 1 minute from now for scheduled
            : new Date().toISOString(); // Current time for drafts

          postsToInsert.push({
            user_id: user.id,
            campaign_id: campaign.id,
            title: selectedTrend?.title || searchQuery,
            content: content,
            platform: platform,
            post_type: "text",
            scheduled_at: scheduledTime,
            status: publishNow ? "scheduled" : "draft",
          });
        }

        if (postsToInsert.length > 0) {
          // If editing, delete old posts first
          if (isEditMode && editId) {
            await supabase
              .from("scheduled_posts")
              .delete()
              .eq("campaign_id", editId);
          }

          // Insert new/updated posts
          const { error: postsError } = await supabase
            .from("scheduled_posts")
            .insert(postsToInsert);

          if (postsError) throw postsError;
        }

        const successMessage = isEditMode
          ? (publishNow
              ? `"${campaignName}" updated and scheduled!`
              : `"${campaignName}" updated successfully!`)
          : (publishNow
              ? `"${campaignName}" scheduled successfully!`
              : `"${campaignName}" saved as draft!`);

        showToast(successMessage, "success");

        // Mark campaign as saved
        if (!publishNow) {
          setCampaignSaved(true);
        }

        // Trigger fireworks celebration after a delay so toast shows first
        setTimeout(() => {
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 5000);
        }, 1000);

        // Only redirect if publishing, stay on page if just saving
        if (publishNow) {
          setTimeout(() => {
            router.push(`/campaigns?action=published&name=${encodeURIComponent(campaignName)}`);
          }, 6500);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error saving campaign:", error);
        showToast(
          `Failed to save campaign: ${errorMessage}`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      supabase,
      router,
      generatedContent,
      showToast,
      campaignName,
      targetPlatforms,
      selectedTrend,
      searchQuery,
      controls,
      aiProvider,
    ]
  );

  /**
   * Copy platform content to clipboard
   */
  const copyContent = useCallback((platform: string) => {
    const content = editedContent[platform] ||
      (typeof generatedContent[platform] === 'string'
        ? generatedContent[platform]
        : generatedContent[platform]?.content || '');

    if (!content) {
      showToast("No content to copy", "error");
      return;
    }

    navigator.clipboard.writeText(content)
      .then(() => {
        showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} content copied!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        showToast("Failed to copy content", "error");
      });
  }, [editedContent, generatedContent, showToast]);

  // Show loading screen while loading campaign data in edit mode
  if (loadingCampaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <TetrisLoading size="lg" showLoadingText={false} />
          </div>
          <p className="text-tron-text-muted text-lg">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fireworks celebration effect */}
      <Fireworks active={showFireworks} duration={5000} />

      {/* Hide the default sidebar on this page */}
      <style jsx global>{`
        aside.w-64 {
          display: none !important;
        }
        .md\\:ml-64 {
          margin-left: 0 !important;
        }
        
        .slider-tron::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00f5ff, #ff00ff);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        .slider-tron::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00f5ff, #ff00ff);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        .bg-size-200 {
          background-size: 200%;
        }

        .bg-pos-0 {
          background-position: 0%;
        }

        .bg-pos-100 {
          background-position: 100%;
        }
      `}</style>
      
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Card-based navigation - single focused card at a time */}
        <AnimatePresence mode="wait" custom={cardDirection}>
          
          {/* CARD 1: Campaign Name */}
          {currentCard === 1 && (
            <motion.div
              key="card-1"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-12 shadow-2xl"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-tron-text mb-4">
                  Campaign Name
                </h2>
              </div>

              <div className="max-w-xl mx-auto">
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && campaignName.trim()) {
                      goToNextCard();
                    }
                  }}
                  placeholder="e.g., Summer Product Launch"
                  autoFocus
                  className="w-full px-8 py-6 bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan text-tron-text text-2xl text-center font-light placeholder-tron-text-muted/50 transition-all"
                />

                <motion.button
                  onClick={goToNextCard}
                  disabled={!campaignName.trim()}
                  whileHover={{ scale: !campaignName.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
                >
                  Continue
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 2: Content Format Selection */}
          {currentCard === 2 && (
            <motion.div
              key="card-2"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-12 shadow-2xl"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-2 border-tron-cyan/30 mb-6"
                >
                  <Layout className="w-10 h-10 text-tron-cyan" />
                </motion.div>
                <h2 className="text-4xl font-bold text-tron-text mb-4">
                  Choose Content Formats
                </h2>
                <p className="text-tron-text-muted text-lg max-w-2xl mx-auto">
                  Select which social media formats you want to create content for. Each format will be optimized for its platform's style and character limits.
                </p>
                <p className="text-tron-cyan/60 text-sm mt-2">
                  💡 Note: This is for content generation only. Social publishing features coming soon!
                </p>
              </div>

              <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "twitter", name: "Twitter/X", IconComponent: Twitter, limit: "280 chars" },
                  { id: "linkedin", name: "LinkedIn", IconComponent: Linkedin, limit: "3,000 chars" },
                  { id: "facebook", name: "Facebook", IconComponent: Facebook, limit: "63,206 chars" },
                  { id: "instagram", name: "Instagram", IconComponent: Instagram, limit: "2,200 chars" },
                  { id: "tiktok", name: "TikTok", IconComponent: Music, limit: "2,200 chars" },
                  { id: "reddit", name: "Reddit", IconComponent: MessageSquare, limit: "40,000 chars" },
                ].map((platform) => {
                  const Icon = platform.IconComponent;
                  return (
                    <motion.button
                      key={platform.id}
                      onClick={() => {
                        setTargetPlatforms((prev) =>
                          prev.includes(platform.id)
                            ? prev.filter((p) => p !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-2xl border-2 transition-all ${
                        targetPlatforms.includes(platform.id)
                          ? "bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-tron-cyan shadow-lg shadow-tron-cyan/30"
                          : "bg-tron-dark/30 border-tron-cyan/20 hover:border-tron-cyan/40"
                      }`}
                    >
                      {targetPlatforms.includes(platform.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-tron-cyan rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-tron-dark" />
                        </motion.div>
                      )}
                      <div className="flex items-center justify-center mb-2">
                        <Icon
                          className={`w-8 h-8 ${
                            targetPlatforms.includes(platform.id)
                              ? "text-tron-cyan"
                              : "text-tron-text-muted/50"
                          }`}
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="font-semibold mb-1 text-tron-text text-sm">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-tron-text-muted">
                        {platform.limit}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              {targetPlatforms.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-yellow-400/80 text-center mt-8"
                >
                  ⚠️ Please select at least one content format to continue.
                </motion.p>
              )}

              <div className="mt-12 flex gap-4">
                <motion.button
                  onClick={goToPrevCard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-5 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all text-lg"
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={goToNextCard}
                  disabled={targetPlatforms.length === 0}
                  whileHover={{ scale: targetPlatforms.length === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
                >
                  Continue
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 3: Heavy Hitters vs Custom Trend */}
          {currentCard === 3 && (
            <motion.div
              key="card-3"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-12 shadow-2xl"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-2 border-tron-cyan/30 mb-6"
                >
                  <TrendingUp className="w-10 h-10 text-tron-cyan" />
                </motion.div>
                <h2 className="text-4xl font-bold text-tron-text mb-4">
                  Which direction do you want to go?
                </h2>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Trending Now Button */}
                <motion.button
                  onClick={loadTrendingTopics}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-8 bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 backdrop-blur-xl border-2 border-tron-cyan rounded-2xl hover:shadow-xl hover:shadow-tron-cyan/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tron-cyan to-tron-magenta flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-tron-text mb-1">
                          Trending Now
                        </h3>
                        <p className="text-tron-text-muted">
                          Hot topics trending right now
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-tron-cyan group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>

                {/* Custom Search Button */}
                <motion.button
                  onClick={() => goToNextCard()}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-8 bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 backdrop-blur-xl border-2 border-tron-cyan rounded-2xl hover:shadow-xl hover:shadow-tron-cyan/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tron-cyan to-tron-magenta flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-tron-text mb-1">
                          Your Trend
                        </h3>
                        <p className="text-tron-text-muted">
                          Find something specific
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-tron-cyan group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>

                {/* Back Button */}
                <motion.button
                  onClick={goToPrevCard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                >
                  ← Back
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 4: Custom Trend Search */}
          {currentCard === 4 && (
            <motion.div
              key="card-4"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-12 shadow-2xl"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-2 border-tron-cyan/30 mb-6"
                >
                  <TrendingUp className="w-10 h-10 text-tron-cyan" />
                </motion.div>
                <h2 className="text-4xl font-bold text-tron-text mb-4">
                  What is the focus of your campaign?
                </h2>
                <p className="text-tron-text-muted text-lg">
                  Search for topics, keywords, or niches that matter to you
                </p>
              </div>

              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        searchTrends();
                        goToNextCard();
                      }
                    }}
                    placeholder="e.g., artificial intelligence, sustainable fashion, gaming..."
                    autoFocus
                    className="w-full px-8 py-6 bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan text-tron-text text-xl text-center font-light placeholder-tron-text-muted/50 transition-all"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-tron-cyan/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-tron-text-muted" />
                    </motion.button>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    onClick={goToPrevCard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-5 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all text-lg"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      if (searchQuery.trim()) {
                        setHasSearched(true);
                        goToNextCard();
                        await searchTrends();
                      }
                    }}
                    disabled={!searchQuery.trim()}
                    whileHover={{ scale: !searchQuery.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
                  >
                    Search Trends
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARD 5: Trend Results & Selection */}
          {currentCard === 5 && (
            <motion.div
              key="card-5"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={loadingTrends ? '' : 'bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-12 shadow-2xl'}
            >
              {loadingTrends ? (
                <div className="flex items-center justify-center min-h-[600px]">
                  <TetrisLoading size="lg" loadingText="Finding trends..." />
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-tron-text mb-4">
                      Pick your trends
                    </h2>
                    <p className="text-tron-text-muted text-lg">
                      {selectedTrends.length > 0
                        ? `${selectedTrends.length} trend${selectedTrends.length > 1 ? 's' : ''} selected`
                        : 'Select one or more trending topics'}
                    </p>
                  </div>

                  {/* Viral Score Education Banner */}
                  {trends.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <Sparkles className="w-5 h-5 text-coral-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          Viral Score™ Prediction
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                          Trends are scored (0-100) based on search volume, platform validation, and freshness. 
                          <span className="text-coral-400 ml-1">Higher scores indicate stronger viral potential.</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="max-w-4xl mx-auto">
                {loadingTrends ? (
                  <TetrisLoading size="md" loadingText="" />
                ) : trends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-96 overflow-y-scroll pr-2 scrollbar-thin scrollbar-thumb-tron-cyan/30 scrollbar-track-tron-dark/50">
                    {trends.slice(0, 8).map((trend, idx) => {
                      const isSelected = selectedTrends.some((t) => t.title === trend.title);
                      return (
                        <motion.div
                          key={`${trend.title}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => toggleTrendSelection(trend)}
                          whileTap={{ scale: 0.98 }}
                          className={`cursor-pointer p-6 rounded-xl backdrop-blur-xl border-2 transition-all text-left ${
                            isSelected
                              ? "bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-tron-cyan shadow-lg"
                              : "bg-tron-dark/50 border-tron-grid hover:border-tron-cyan/50 hover:shadow-md hover:shadow-tron-cyan/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className={`font-semibold ${
                                  isSelected ? "text-tron-text" : "text-tron-text-muted"
                                }`}>
                                  {trend.title}
                                </h3>
                                {trend.viralScore !== undefined && (
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-bold flex-shrink-0 inline-flex items-center gap-1.5 ${
                                      trend.viralPotential === 'high'
                                        ? 'bg-green-500/10 text-green-400'
                                        : trend.viralPotential === 'medium'
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                                  >
                                    {trend.viralPotential === 'high' ? (
                                      <Flame className="w-3 h-3" />
                                    ) : trend.viralPotential === 'medium' ? (
                                      <Zap className="w-3 h-3" />
                                    ) : (
                                      <BarChart3 className="w-3 h-3" />
                                    )}
                                    {trend.viralScore}
                                  </span>
                                )}
                              </div>
                              {trend.formattedTraffic && (
                                <p className="text-xs text-tron-text-muted">
                                  {trend.formattedTraffic}
                                </p>
                              )}
                            </div>
                            <div className="w-6 h-6 flex-shrink-0">
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 bg-tron-cyan rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Viral Score Breakdown */}
                          {trend.viralFactors && trend.viralScore !== undefined && (
                            <div className="mt-3 px-3">
                              <ViralScoreBreakdown
                                score={trend.viralScore}
                                potential={trend.viralPotential || 'low'}
                                factors={trend.viralFactors}
                                aiReasoning={trend.aiReasoning}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tron-text-muted">No trends found. Try a different search.</p>
                  </div>
                )}

                {!loadingTrends && (
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => goToCard(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-5 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all text-lg"
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      onClick={goToNextCard}
                      disabled={selectedTrends.length === 0}
                      whileHover={{ scale: selectedTrends.length === 0 ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
                    >
                      Continue
                    </motion.button>
                  </div>
                )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* CARD 6: Content Controls/Shaping - Enhanced with AI Optimization */}
          {currentCard === 6 && (
            <motion.div
              key="card-6"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-tron-text mb-2">
                  Shape your content
                </h2>
                <p className="text-tron-text-muted">
                  Customize how your content will be generated
                </p>
              </div>

              <div className="max-w-5xl mx-auto space-y-6">
                {/* AI Optimize & Viral Score Section */}
                <div className="flex items-center gap-4 mb-4">
                  <motion.button
                    onClick={handleAIOptimize}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Optimize (A)
                  </motion.button>

                  <div className="flex items-center gap-3 bg-[#2b2b2b] border border-gray-700/50 rounded-lg px-4 py-2">
                    <Flame className={`w-5 h-5 ${
                      predictedViralScore > 80 ? "text-green-400" :
                      predictedViralScore > 60 ? "text-yellow-400" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Predicted Viral Score</div>
                      <div className="text-xl font-bold text-white font-mono">{predictedViralScore}%</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSaveTemplateDialog(true)}
                    className="ml-auto px-4 py-2 bg-tron-dark/70 border border-tron-cyan/30 rounded-lg text-sm text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                  >
                    Save as Template
                  </button>
                </div>

                {/* Platform Presets */}
                <div className="bg-tron-dark/30 border border-tron-cyan/20 rounded-xl p-4">
                  <div className="text-sm text-tron-text-muted mb-3 font-semibold">Quick Presets</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyPlatformPreset("twitter")}
                      className="px-4 py-2 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-sm text-tron-cyan hover:bg-tron-cyan/10 transition-all flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter Best Practices
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPlatformPreset("tiktok")}
                      className="px-4 py-2 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-sm text-tron-cyan hover:bg-tron-cyan/10 transition-all flex items-center gap-2"
                    >
                      <Music className="w-4 h-4" />
                      TikTok Viral
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPlatformPreset("linkedin")}
                      className="px-4 py-2 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-sm text-tron-cyan hover:bg-tron-cyan/10 transition-all flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Authority
                    </button>
                  </div>
                </div>

                {/* Validation Warnings */}
                {selectedAudiences.length === 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-sm">
                    ⚠️ Please select at least one target audience for better results
                  </div>
                )}

                {/* Why These Options? */}
                {showOptimizationReason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-purple-200 mb-1">Why These Options?</div>
                        <div className="text-sm text-purple-100">{optimizationReason}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowOptimizationReason(false)}
                        className="ml-auto text-purple-400 hover:text-purple-200"
                        aria-label="Close optimization explanation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Tone with Tooltips */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm flex items-center gap-2">
                        Tone <span className="text-xs text-tron-text-muted">(Press 1-3)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['professional', 'casual', 'friendly'].map((t) => (
                          <div key={t} className="group relative">
                            <button
                              type="button"
                              onClick={() => setControls({ ...controls, tone: t })}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                controls.tone === t
                                  ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                  : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                              }`}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 bg-black/90 border border-tron-cyan/30 rounded-lg p-2 text-xs">
                              <div className="font-semibold text-tron-cyan">{engagementData.tone[t as keyof typeof engagementData.tone]?.boost} engagement</div>
                              <div className="text-tron-text-muted">{engagementData.tone[t as keyof typeof engagementData.tone]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Length Slider */}
                    <div>
                      <label htmlFor="content-length-slider" className="block text-tron-text font-semibold mb-2 text-sm flex items-center gap-2">
                        Content Length <span className="text-xs text-tron-text-muted">(Press S/M/L)</span>
                      </label>
                      <div className="space-y-3">
                        <input
                          id="content-length-slider"
                          type="range"
                          min="0"
                          max="2"
                          step="1"
                          value={controls.length === 'short' ? 0 : controls.length === 'standard' ? 1 : 2}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setControls({ ...controls, length: val === 0 ? 'short' : val === 1 ? 'standard' : 'long' });
                          }}
                          aria-label="Select content length"
                          className="w-full h-2 bg-tron-dark/50 rounded-lg appearance-none cursor-pointer range-slider"
                        />
                        <div className="flex justify-between text-xs text-tron-text-muted">
                          <span className={controls.length === 'short' ? 'text-tron-cyan font-semibold' : ''}>Short (280 chars)</span>
                          <span className={controls.length === 'standard' ? 'text-tron-cyan font-semibold' : ''}>Standard (500 chars)</span>
                          <span className={controls.length === 'long' ? 'text-tron-cyan font-semibold' : ''}>Long (1000+ chars)</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Focus with Tooltips */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Content Focus</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['informative', 'discussion', 'opinion', 'news', 'tips', 'story', 'walkthrough'].map((f) => (
                          <div key={f} className="group relative">
                            <button
                              type="button"
                              onClick={() => setControls({ ...controls, contentFocus: f })}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                controls.contentFocus === f
                                  ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                  : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                              }`}
                            >
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 bg-black/90 border border-tron-cyan/30 rounded-lg p-2 text-xs">
                              <div className="font-semibold text-tron-cyan">{engagementData.contentFocus[f as keyof typeof engagementData.contentFocus]?.boost} engagement</div>
                              <div className="text-tron-text-muted">{engagementData.contentFocus[f as keyof typeof engagementData.contentFocus]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    {/* Target Audience - Multi-Select (NO "general") */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">
                        Target Audience <span className="text-xs text-tron-text-muted">(Select up to 3)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['professionals', 'entrepreneurs', 'creators', 'students', 'techies', 'gamers', 'hobbyists'].map((a) => (
                          <div key={a} className="group relative">
                            <button
                              type="button"
                              onClick={() => toggleAudience(a)}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 relative ${
                                selectedAudiences.includes(a)
                                  ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                  : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                              } ${selectedAudiences.length >= 3 && !selectedAudiences.includes(a) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={selectedAudiences.length >= 3 && !selectedAudiences.includes(a)}
                            >
                              {selectedAudiences.includes(a) && (
                                <Check className="w-4 h-4 absolute left-1 top-1/2 -translate-y-1/2" />
                              )}
                              {a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 bg-black/90 border border-tron-cyan/30 rounded-lg p-2 text-xs">
                              <div className="font-semibold text-tron-cyan">{engagementData.targetAudience[a as keyof typeof engagementData.targetAudience]?.boost} engagement</div>
                              <div className="text-tron-text-muted">{engagementData.targetAudience[a as keyof typeof engagementData.targetAudience]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAudiences.length > 0 && (
                        <div className="mt-2 text-xs text-tron-text-muted">
                          Selected: {selectedAudiences.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Call to Action with Tooltips (NO "none") */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Call to Action</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['engage', 'share', 'comment', 'follow', 'learn'].map((c) => (
                          <div key={c} className="group relative">
                            <button
                              type="button"
                              onClick={() => setControls({ ...controls, callToAction: c })}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                controls.callToAction === c
                                  ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                  : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                              }`}
                            >
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 bg-black/90 border border-tron-cyan/30 rounded-lg p-2 text-xs">
                              <div className="font-semibold text-tron-cyan">{engagementData.callToAction[c as keyof typeof engagementData.callToAction]?.boost} engagement</div>
                              <div className="text-tron-text-muted">{engagementData.callToAction[c as keyof typeof engagementData.callToAction]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending This Week */}
                <div className="bg-tron-dark/30 border border-tron-cyan/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-tron-cyan" />
                    <div className="text-sm text-tron-text font-semibold">Trending This Week</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {trendingCombinations.map((combo) => (
                      <button
                        type="button"
                        key={combo.name}
                        onClick={() => applyTrendingCombination(combo)}
                        className="text-left px-3 py-2 bg-tron-dark/50 border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/50 transition-all"
                      >
                        <div className="text-xs font-semibold text-tron-text mb-1">{combo.name}</div>
                        <div className="flex items-center gap-2 text-xs text-tron-text-muted">
                          <span className="text-green-400">{combo.successRate}</span>
                          <span>•</span>
                          <span>{combo.uses} uses</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="text-center text-xs text-tron-text-muted">
                  💡 Tip: Use keyboard shortcuts - 1-3 for tone, S/M/L for length, A for AI optimize
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mt-6">
                  <motion.button
                    onClick={goToPrevCard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      setGeneratingContent(true);
                      goToNextCard();
                      await generateContent();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-xl font-semibold text-white shadow-lg shadow-tron-cyan/30 transition-all"
                  >
                    {generateButtonText}
                  </motion.button>
                </div>
              </div>

              {/* Save Template Dialog */}
              {showSaveTemplateDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSaveTemplateDialog(false)}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-tron-dark border-2 border-tron-cyan/30 rounded-2xl p-6 max-w-md w-full mx-4"
                  >
                    <h3 className="text-xl font-bold text-tron-text mb-4">Save as Template</h3>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name..."
                      className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-tron-text outline-none focus:border-tron-cyan/50 mb-4"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveTemplate()}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSaveTemplateDialog(false)}
                        className="flex-1 px-4 py-2 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-tron-text hover:bg-tron-cyan/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-lg text-white font-semibold"
                      >
                        Save Template
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* CARD 7: Content Display with Platform Switcher */}
          {currentCard === 7 && (
            <motion.div
              key="card-7"
              custom={cardDirection}
              initial={{ x: cardDirection > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: cardDirection > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={generatingContent ? '' : 'bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl p-8 shadow-2xl max-w-6xl mx-auto'}
            >
              {generatingContent ? (
                <div className="flex items-center justify-center min-h-[600px]">
                  <TetrisLoading size="lg" speed="fast" loadingText="Generating high-viral content..." />
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Enter campaign name"
                      className="text-3xl font-bold text-tron-text mb-2 bg-transparent border-2 border-transparent hover:border-tron-cyan/30 focus:border-tron-cyan/50 rounded-lg px-4 py-2 text-center outline-none transition-all w-full max-w-2xl mx-auto"
                    />
                    {generatedContent && (
                      <p className="text-tron-text-muted">
                        Edit and publish your campaign
                      </p>
                    )}
                  </div>

                  <div className="max-w-5xl mx-auto">
                    {generatedContent ? (
                  <>
                    {/* Platform Switcher Toolbar */}
                    <div className="flex gap-2 mb-6 p-2 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl">
                      {targetPlatforms.map((platform) => (
                        <motion.button
                          key={platform}
                          onClick={() => setActivePlatformView(platform)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                            activePlatformView === platform
                              ? "bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg"
                              : "text-tron-text-muted hover:text-tron-text hover:bg-tron-cyan/10"
                          }`}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </motion.button>
                      ))}
                    </div>

                    {/* Content Display for Active Platform */}
                    <AnimatePresence mode="wait">
                      {activePlatformView && generatedContent[activePlatformView] && (
                        <motion.div
                          key={activePlatformView}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl p-6 mb-6"
                        >
                          {/* Header with Platform Name */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-tron-text">
                                {activePlatformView.charAt(0).toUpperCase() + activePlatformView.slice(1)} Post
                              </h3>
                              <p className="text-sm text-tron-text-muted">
                                {typeof generatedContent[activePlatformView] === 'string'
                                  ? generatedContent[activePlatformView].length
                                  : generatedContent[activePlatformView]?.content?.length || 0} characters
                              </p>
                            </div>
                          </div>

                          {/* Content Text */}
                          {editingContent[activePlatformView] ? (
                            <textarea
                              value={editedContent[activePlatformView] || (typeof generatedContent[activePlatformView] === 'string' ? generatedContent[activePlatformView] : generatedContent[activePlatformView]?.content || '')}
                              onChange={(e) => setEditedContent({ ...editedContent, [activePlatformView]: e.target.value })}
                              placeholder="Edit your content..."
                              className="w-full h-64 px-4 py-3 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl text-tron-text focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan resize-none"
                            />
                          ) : (
                            <div className="bg-tron-dark/30 border border-tron-grid rounded-xl p-4">
                              <p className="text-tron-text whitespace-pre-wrap">
                                {editedContent[activePlatformView] || (typeof generatedContent[activePlatformView] === 'string' ? generatedContent[activePlatformView] : generatedContent[activePlatformView]?.content || '')}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation - Back, Copy, and Edit */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={goToPrevCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                      >
                        ← Back
                      </motion.button>
                      {activePlatformView && generatedContent[activePlatformView] && (
                        <>
                          <motion.button
                            onClick={() => copyContent(activePlatformView)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-tron-dark/50 border-2 border-green-500/30 rounded-xl font-semibold text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Content
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingContent({ ...editingContent, [activePlatformView]: !editingContent[activePlatformView] })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-6 py-3 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                          >
                            {editingContent[activePlatformView] ? "Save Edits" : "Edit Content"}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tron-text-muted">No content generated yet.</p>
                  </div>
                )}
                  </div>

                  {/* Campaign Save Buttons */}
                  {generatedContent && Object.keys(generatedContent).length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        onClick={() => saveCampaign(false)}
                        disabled={loading || campaignSaved}
                        whileHover={{ scale: loading || campaignSaved ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-5 bg-tron-grid/50 backdrop-blur-xl border-2 border-tron-cyan/50 rounded-2xl font-semibold text-tron-cyan hover:border-tron-cyan hover:bg-tron-cyan/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        aria-label="Save campaign as draft"
                      >
                        <Check className="w-5 h-5" />
                        {loading ? "Saving..." : campaignSaved ? "Saved" : "Save for Later"}
                      </motion.button>
                      <PublishButton
                        content={(() => {
                          // Get content from the first available platform
                          if (!generatedContent) return "";
                          const platforms = Object.keys(generatedContent).filter(k => k !== 'hashtags');
                          if (platforms.length === 0) return "";
                          const firstPlatform = platforms[0];
                          const platformContent = generatedContent[firstPlatform];
                          if (typeof platformContent === 'string') return platformContent;
                          return platformContent?.content || "";
                        })()}
                        campaignId={editId || undefined}
                        onPublishSuccess={(data) => {
                          console.log("✅ Content posted!", data);

                          // Handle new multi-platform response format
                          if (data.results && Array.isArray(data.results)) {
                            const successfulPosts = data.results;

                            if (successfulPosts.length === 1) {
                              // Single post - show simple success with link
                              const post = successfulPosts[0];
                              showToast(
                                <div>
                                  <p>✅ Posted to {post.platform} successfully!</p>
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-tron-cyan"
                                  >
                                    View on {post.platform} →
                                  </a>
                                </div>,
                                "success"
                              );
                            } else {
                              // Multiple posts - show count and links
                              showToast(
                                <div>
                                  <p>✅ Posted to {successfulPosts.length} platforms!</p>
                                  <div className="mt-2 space-y-1">
                                    {successfulPosts.map((post: any, idx: number) => (
                                      <a
                                        key={idx}
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block underline hover:text-tron-cyan text-sm"
                                      >
                                        View on {post.platform} →
                                      </a>
                                    ))}
                                  </div>
                                  {data.errors && data.errors.length > 0 && (
                                    <p className="mt-2 text-xs text-red-400">
                                      {data.errors.length} platform(s) failed
                                    </p>
                                  )}
                                </div>,
                                "success"
                              );
                            }
                          } else if (data.url) {
                            // Legacy format fallback
                            showToast(
                              <div>
                                <p>✅ Posted successfully!</p>
                                <a
                                  href={data.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-tron-cyan"
                                >
                                  View post →
                                </a>
                              </div>,
                              "success"
                            );
                          } else {
                            showToast(`Published successfully!`, "success");
                          }

                          // Save campaign and redirect to campaigns list
                          saveCampaign(false);

                          // Redirect to campaigns page after 2 seconds
                          setTimeout(() => {
                            router.push('/campaigns');
                          }, 2000);
                        }}
                        onPublishError={(error) => {
                          showToast(error, "error");
                        }}
                        disabled={loading || !generatedContent}
                        variant="primary"
                        size="lg"
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Keep existing steps temporarily for testing - we'll convert them next */}
          {currentCard > 7 && (
            <div className="text-center text-tron-text">
              <p className="text-2xl mb-4">Card {currentCard} - Coming soon!</p>
              <button
                onClick={goToPrevCard}
                className="px-6 py-3 bg-tron-cyan/20 border-2 border-tron-cyan rounded-xl text-tron-cyan hover:bg-tron-cyan/30 transition-all"
              >
                ← Back
              </button>
            </div>
          )}

        </AnimatePresence>

        {/* Old step-based content below - will remove after all cards are done */}
        <div className="hidden">
        {/* Enhanced Progress Indicator with Step Titles */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            {stepConfig.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              return (
                <motion.div
                  key={s.number}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-tron-cyan to-tron-magenta shadow-lg shadow-tron-cyan/50 ring-4 ring-tron-cyan/20"
                        : isCompleted
                          ? "bg-tron-cyan/20 border-2 border-tron-cyan"
                          : "bg-tron-grid border-2 border-tron-grid"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-tron-cyan" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isActive
                            ? "text-white"
                            : "text-tron-text-muted"
                        }`}
                      />
                    )}
                  </div>
                  {idx < stepConfig.length - 1 && (
                    <div
                      className={`w-20 h-0.5 transition-all duration-500 ${
                        isCompleted ? "bg-tron-cyan" : "bg-tron-grid"
                      }`}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Step Title */}
          <motion.div
            key={`step-title-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-tron-text mb-2">
              {step === 1 && "Setup Your Campaign"}
              {step === 2 && "Discover Trending Topics"}
              {step === 3 && "Generate Content"}
            </h2>
            <p className="text-tron-text-muted">
              {step === 1 && "Choose a name and select target platforms"}
              {step === 2 && "Find the perfect trending topic for your campaign"}
              {step === 3 && "Customize and generate AI-powered content"}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: PLATFORM SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Campaign Name Input */}
              <div className="space-y-3">
                <label htmlFor="campaign-name" className="block text-sm font-medium text-tron-text-muted">
                  Campaign Name <span className="text-tron-magenta">*</span>
                </label>
                <input
                  type="text"
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Product Launch"
                  aria-label="Campaign name"
                  aria-required="true"
                  className="w-full px-6 py-4 bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan text-tron-text text-xl font-light placeholder-tron-text-muted/50 transition-all"
                />
                {campaignName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-tron-cyan flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Looking good!
                  </motion.p>
                )}
              </div>

              {/* Platform Selection with Section Title */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-tron-text">
                      Target Platforms <span className="text-tron-magenta">*</span>
                    </h3>
                    <p className="text-sm text-tron-text-muted mt-1">
                      {targetPlatforms.length > 0 
                        ? `${targetPlatforms.length} platform${targetPlatforms.length > 1 ? 's' : ''} selected`
                        : 'Select at least one platform'}
                    </p>
                  </div>
                  {connectedPlatforms.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-tron-cyan">
                      <div className="w-2 h-2 rounded-full bg-tron-cyan animate-pulse" />
                      {connectedPlatforms.length} connected
                    </div>
                  )}
                </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = connectedPlatforms.includes(platform.id);
                  const isSelected = targetPlatforms.includes(platform.id);

                  return (
                    <motion.button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-6 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 group ${
                        isSelected
                          ? "bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-tron-cyan shadow-xl shadow-tron-cyan/30 ring-2 ring-tron-cyan/20"
                          : "bg-tron-dark/50 border-tron-grid hover:border-tron-cyan/50 hover:shadow-lg"
                      }`}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-3 left-3 w-6 h-6 bg-tron-cyan rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Connection Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isConnected ? (
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-tron-cyan shadow-lg shadow-tron-cyan/50 animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-tron-cyan animate-ping" />
                          </div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-tron-grid border border-tron-text-muted/30" />
                        )}
                      </div>

                      <Icon
                        className={`w-12 h-12 mb-4 mx-auto transition-all duration-300 ${
                          isSelected
                            ? "text-tron-cyan"
                            : "text-tron-text-muted group-hover:text-tron-cyan"
                        }`}
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 12px ${platform.color})`
                            : "none",
                        }}
                      />
                      <div className={`font-semibold text-center transition-colors ${
                        isSelected ? "text-tron-cyan" : "text-tron-text"
                      }`}>
                        {platform.name}
                      </div>
                      {isConnected && (
                        <div className="text-xs text-tron-cyan mt-1 text-center">
                          Connected
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Enhanced Continue Button with Validation */}
              <motion.div className="pt-4">
                {!campaignName && targetPlatforms.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-tron-text-muted text-center mb-4"
                  >
                    Enter a campaign name and select at least one platform to continue
                  </motion.p>
                )}
                <motion.button
                  onClick={() => setStep(2)}
                  disabled={!campaignName || targetPlatforms.length === 0}
                  whileHover={{ scale: !campaignName || targetPlatforms.length === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
                >
                  Continue to Trends
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </motion.div>
            </div>
            </motion.div>
          )}

          {/* STEP 2: TREND DISCOVERY */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Search Bar with Better UX */}
              <div className="space-y-3">
                <label htmlFor="search-trends" className="block text-sm font-medium text-tron-text-muted">
                  Search Keywords
                </label>
                <div className="flex gap-3">
                  <div className="sr-only" id="search-help">
                    Enter keywords to discover trending topics for your campaign
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      id="search-trends"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchTrends()}
                      placeholder="e.g., AI productivity tools, healthy recipes..."
                      aria-label="Search trending topics"
                      aria-describedby="search-help"
                      className="w-full px-6 py-4 bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan text-tron-text text-lg placeholder-tron-text-muted/50 transition-all"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-tron-text-muted hover:text-tron-cyan transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                  <motion.button
                    onClick={searchTrends}
                    disabled={loadingTrends || !searchQuery.trim()}
                    whileHover={{ scale: !loadingTrends && searchQuery.trim() ? 1.05 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Search for trending topics"
                    className="px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 flex items-center gap-2"
                  >
                    {loadingTrends ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Trends Display with Enhanced Cards */}
              {trends.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-tron-text">
                      Trending Topics
                    </h3>
                    <span className="text-sm text-tron-text-muted">
                      {trends.length} results
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    {trends.map((trend, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTrend(trend)}
                        whileHover={{ scale: 1.01 }}
                        className={`relative p-6 rounded-2xl backdrop-blur-xl border-2 cursor-pointer transition-all ${
                          selectedTrend === trend
                            ? "bg-gradient-to-r from-tron-cyan/20 to-tron-magenta/20 border-tron-cyan shadow-xl ring-2 ring-tron-cyan/20"
                            : "bg-tron-dark/50 border-tron-grid hover:border-tron-cyan/50 hover:shadow-lg"
                        }`}
                      >
                        {selectedTrend === trend && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-tron-cyan rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`font-semibold text-lg ${
                            selectedTrend === trend ? "text-tron-cyan" : "text-tron-text"
                          }`}>
                            {trend.title}
                          </div>
                          {trend.viralScore !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 inline-flex items-center gap-1 ${
                                trend.viralPotential === 'high'
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                  : trend.viralPotential === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                              }`}
                            >
                              {trend.viralPotential === 'high' ? (
                                <Flame className="w-3 h-3" />
                              ) : trend.viralPotential === 'medium' ? (
                                <Zap className="w-3 h-3" />
                              ) : (
                                <BarChart3 className="w-3 h-3" />
                              )}
                              {trend.viralScore}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-tron-text-muted">
                            {trend.formattedTraffic || "Trending"}
                          </span>
                          {trend.relatedQueries && (
                            <span className="text-tron-cyan">
                              +{trend.relatedQueries.length} related topics
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loadingTrends && trends.length === 0 && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 px-4"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="p-6 bg-tron-grid/30 rounded-full">
                      <TrendingUp className="w-16 h-16 text-tron-text-muted" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-tron-text mb-3">
                    No trends found
                  </h3>
                  <p className="text-tron-text-muted max-w-md mx-auto">
                    Try different keywords or search terms
                  </p>
                </motion.div>
              )}

              {/* Initial State */}
              {trends.length === 0 && !searchQuery && !loadingTrends && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 px-4"
                >
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="p-6 bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 rounded-full"
                    >
                      <Sparkles className="w-16 h-16 text-tron-cyan" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold text-tron-text mb-3">
                    Discover Trending Topics
                  </h3>
                  <p className="text-tron-text-muted max-w-md mx-auto mb-8">
                    Enter keywords to find the hottest trends and content ideas powered by AI
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Tech Innovations', 'Health & Wellness', 'Business Tips', 'Marketing Trends'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setTimeout(() => searchTrends(), 100);
                        }}
                        className="px-4 py-2 bg-tron-grid/50 border border-tron-cyan/30 rounded-xl text-tron-text hover:border-tron-cyan hover:bg-tron-cyan/10 transition-all text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-tron-grid/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:border-tron-cyan hover:bg-tron-cyan/10 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  disabled={!selectedTrend}
                  whileHover={{ scale: !selectedTrend ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  Generate Content
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONTENT GENERATION WITH CONTROLS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Content Controls - using refactored component */}
              <ErrorBoundary>
                <ContentSettings
                  controls={controls}
                  onControlsChange={handleControlsChange}
                />
              </ErrorBoundary>

              {/* Generate Button */}
              <motion.button
                onClick={generateContent}
                disabled={generatingContent || selectedTrends.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-6 bg-tron-cyan text-tron-dark font-bold rounded-xl hover:bg-tron-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-3"
              >
                {generatingContent ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Content
                  </>
                )}
              </motion.button>

              {/* Generated Content Display with Save/Publish Actions */}
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-tron-text flex items-center gap-2">
                      <FileText className="w-5 h-5 text-tron-cyan" />
                      Generated Posts
                    </h3>
                    <span
                      className="text-sm text-tron-text-muted"
                      aria-live="polite"
                    >
                      {Object.keys(generatedContent).filter((k) => k !== "hashtags")
                        .length}{" "}
                      {Object.keys(generatedContent).filter((k) => k !== "hashtags")
                        .length === 1
                        ? "post"
                        : "posts"}
                    </span>
                  </div>

                  {/* Content Preview Cards - using refactored component */}
                  <div className="space-y-4">
                    {Object.entries(generatedContent).map(([platform, contentData], index) => {
                      if (platform === "hashtags") return null;

                      // Handle both string and object formats
                      const content =
                        typeof contentData === "string"
                          ? contentData
                          : (contentData as ContentData)?.content || "";

                      if (!content) return null;

                      const platformConfig = platforms.find(
                        (p) => p.id === platform
                      );
                      if (!platformConfig) return null;

                      return (
                        <GeneratedContentCard
                          key={platform}
                          platform={platform}
                          content={contentData}
                          platformConfig={platformConfig}
                          isEditing={editingContent[platform] || false}
                          editedContent={editedContent[platform]}
                          index={index}
                          onEditToggle={toggleEdit}
                          onSaveEdit={saveEdit}
                          onContentChange={handleContentChange}
                        />
                      );
                    })}
                  </div>

                  {/* Action Buttons - Save or Publish */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <motion.button
                      onClick={() => saveCampaign(false)}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-5 bg-tron-grid/50 backdrop-blur-xl border-2 border-tron-cyan/50 rounded-2xl font-semibold text-tron-cyan hover:border-tron-cyan hover:bg-tron-cyan/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      aria-label="Save campaign as draft"
                    >
                      <Check className="w-5 h-5" />
                      {loading ? "Saving..." : "Save for Later"}
                    </motion.button>
                    <div className="flex items-center justify-center">
                      <PublishButton
                        content={(() => {
                          // Get content from the first available platform
                          if (!generatedContent) return "";
                          const platforms = Object.keys(generatedContent).filter(k => k !== 'hashtags');
                          if (platforms.length === 0) return "";
                          const firstPlatform = platforms[0];
                          const platformContent = generatedContent[firstPlatform];
                          if (typeof platformContent === 'string') return platformContent;
                          return platformContent?.content || "";
                        })()}
                        campaignId={editId || undefined}
                        onPublishSuccess={(data) => {
                          console.log("✅ Content posted!", data);

                          // Handle new multi-platform response format
                          if (data.results && Array.isArray(data.results)) {
                            const successfulPosts = data.results;

                            if (successfulPosts.length === 1) {
                              // Single post - show simple success with link
                              const post = successfulPosts[0];
                              showToast(
                                <div>
                                  <p>✅ Posted to {post.platform} successfully!</p>
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-tron-cyan"
                                  >
                                    View on {post.platform} →
                                  </a>
                                </div>,
                                "success"
                              );
                            } else {
                              // Multiple posts - show count and links
                              showToast(
                                <div>
                                  <p>✅ Posted to {successfulPosts.length} platforms!</p>
                                  <div className="mt-2 space-y-1">
                                    {successfulPosts.map((post, idx) => (
                                      <a
                                        key={idx}
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block underline hover:text-tron-cyan text-sm"
                                      >
                                        View on {post.platform} →
                                      </a>
                                    ))}
                                  </div>
                                  {data.errors && data.errors.length > 0 && (
                                    <p className="mt-2 text-xs text-red-400">
                                      {data.errors.length} platform(s) failed
                                    </p>
                                  )}
                                </div>,
                                "success"
                              );
                            }
                          } else if (data.url) {
                            // Legacy format fallback
                            showToast(
                              <div>
                                <p>✅ Posted successfully!</p>
                                <a
                                  href={data.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-tron-cyan"
                                >
                                  View post →
                                </a>
                              </div>,
                              "success"
                            );
                          } else {
                            showToast(`Published successfully!`, "success");
                          }

                          // Save campaign and redirect to campaigns list
                          saveCampaign(false);

                          // Redirect to campaigns page after 2 seconds
                          setTimeout(() => {
                            router.push('/campaigns');
                          }, 2000);
                        }}
                        onPublishError={(error) => {
                          showToast(error, "error");
                        }}
                        disabled={loading || !generatedContent}
                        variant="primary"
                        size="lg"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-tron-grid/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification - using refactored component */}
        <Toast toast={toast} />
      </div>

      </div>
      {/* End hidden old content */}

    </div>
    </>
  );
}


