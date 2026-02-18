"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Fireworks from "@/components/Fireworks";
import { GenerationResponse, ValidationError, RateLimitError, SetupRequiredError } from "@/lib/types/api";
import { useHelix } from "@/context/HelixContext";

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
  Calendar,
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
  Search,
  Activity,
  BrainCircuit,
  Download,
  Home,
  RefreshCw,
  Bookmark,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/LoadingStates";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { BGPattern } from "@/components/ui/bg-pattern";
import ErrorBoundary from "@/components/ErrorBoundary";
import ContentSettings from "./components/ContentSettings";
import GeneratedContentCard from "./components/GeneratedContentCard";
import Toast from "./components/Toast";
import UpgradeModal from "@/components/UpgradeModal";

import { jsPDF } from "jspdf";
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
  PromoteData,
  ValidationType,
  ValidationContext,
} from "./types";
import PromoteInput from "./components/PromoteInput";
import NicheSelector from "./components/NicheSelector";
import ValidationTypeSelector from "./components/ValidationTypeSelector";
import ValidationDataForm from "./components/ValidationDataForm";
import { TransferMasterclass } from "@/components/TransferMasterclass";
import ControlOptionButton from "./components/ControlOptionButton";

// Interface for AI provider data
interface AIProvider {
  provider_key: string;
  isConfigured: boolean;
  name?: string;
}

// Interface for connected account data
interface ConnectedAccount {
  id: string;
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

  // Per-platform customization state
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<string | null>(null);

  const { updateContext, registerAction } = useHelix();

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
  const [connectedAccountObjects, setConnectedAccountObjects] = useState<ConnectedAccount[]>([]);

  // Campaign Type Selection: trending (viral/search), promote (product/service)
  const [campaignType, setCampaignType] = useState<"trending" | "promote">("trending");
  const [promoteData, setPromoteData] = useState<PromoteData>({
    productName: "",
    productType: "product",
    description: "",
    keyFeatures: [],
    targetAudience: "",
    uniqueSellingPoints: [],
    websiteUrl: "",
    uploadedFiles: []
  });
  const [promoteWizardStep, setPromoteWizardStep] = useState(0);

  // Step 2: Trend Discovery
  const [searchQuery, setSearchQuery] = useState("");
  const [trendSource] = useState("mixed");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<Trend[]>([]); // Multiple trends
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [_hasSearched, setHasSearched] = useState(false);

  // Discovery mode: "viral" (niche selection) or "validate" (structured validation)
  const [trendDiscoveryMode, setTrendDiscoveryMode] = useState<"viral" | "validate" | "promote">("viral");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [customNiche, setCustomNiche] = useState("");
  const [validationType, setValidationType] = useState<ValidationType | null>(null);
  const [validationData, setValidationData] = useState<ValidationContext>({ type: "custom" });
  const [validationStep, setValidationStep] = useState<"type" | "data">("type");

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

  // NEW: View All content toggle
  const [viewAllContent, setViewAllContent] = useState(false);

  // NEW: Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"campaigns" | "generations" | "features">("campaigns");
  const [usageData, setUsageData] = useState<{ campaigns: number; campaignLimit: number } | undefined>();
  const [showExportMenu, setShowExportMenu] = useState(false);

  // NEW: Per-platform controls map
  interface PlatformSpecificSettings extends ContentControls {
    selectedAudiences: string[];
  }
  const [platformControls, setPlatformControls] = useState<Record<string, PlatformSpecificSettings>>({});

  // NEW: Sync controls to platform bucket when customizing
  useEffect(() => {
    if (customizePerPlatform && activePlatformTab) {
      setPlatformControls((prev) => ({
        ...prev,
        [activePlatformTab]: {
          ...controls,
          selectedAudiences,
        },
      }));
    }
  }, [controls, selectedAudiences, customizePerPlatform, activePlatformTab]);


  // NEW: Sync Helix Context with Campaign State
  useEffect(() => {
    updateContext({
      page: "campaign-create",
      pageContent: `
        Current Step: ${currentCard}
        Campaign Name: ${campaignName}
        Selected Platforms: ${targetPlatforms.join(", ")}
        Selected Trends: ${selectedTrends.map(t => `${t.title} (Score: ${t.viralScore})`).join(", ")}
        Visible Trends: ${trends.slice(0, 5).map(t => t.title).join(", ")}
        Available Actions: select_highest_trend, optimize_settings
      `,
      data: {
        trends: trends,
        selectedTrends: selectedTrends,
        platforms: targetPlatforms
      },
      selections: {
        trendId: selectedTrends[0]?.id,
        platformIds: targetPlatforms
      }
    });
  }, [currentCard, campaignName, targetPlatforms, selectedTrends, trends, updateContext]);




  // Track toast timeout to prevent stacking
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Show toast notification with auto-dismiss
   * Fixed: Added useRef to track and clear previous timeouts, preventing toast stacking
   */
  const showToast = useCallback(
    (message: string | React.ReactNode, type: "success" | "error" = "success") => {
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

  // NEW: Copy all content to clipboard
  const copyAllContent = useCallback(() => {
    if (!generatedContent || Object.keys(generatedContent).length === 0) {
      showToast("No content to copy", "error");
      return;
    }

    const allContent = targetPlatforms.map(platform => {
      const content = editedContent[platform] ||
        (typeof generatedContent[platform] === 'string'
          ? generatedContent[platform]
          : (generatedContent[platform] as ContentData)?.content || '');
      return `=== ${platform.toUpperCase()} ===\n${content}`;
    }).join('\n\n');

    navigator.clipboard.writeText(allContent)
      .then(() => {
        showToast(`All ${targetPlatforms.length} platform posts copied!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        showToast("Failed to copy content", "error");
      });
  }, [editedContent, generatedContent, targetPlatforms, showToast]);

  // NEW: Export campaign in multiple formats (Markdown, TXT, PDF)
  const exportCampaign = useCallback((format: 'md' | 'txt' | 'pdf' = 'md') => {
    if (!generatedContent || Object.keys(generatedContent).length === 0) {
      showToast("No content to export", "error");
      return;
    }

    const timestamp = new Date().toLocaleDateString();
    const title = campaignName || 'Untitled Campaign';
    const baseFileName = (campaignName || 'campaign').toLowerCase().replace(/\s+/g, '-');

    if (format === 'pdf') {
      const doc = new jsPDF();
      let yOffset = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const contentWidth = pageWidth - (margin * 2);

      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yOffset);
      yOffset += 12;

      // Meta info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated: ${timestamp}`, margin, yOffset);
      yOffset += 8;

      if (selectedTrends.length > 0) {
        doc.text(`Trend: ${selectedTrends[0]?.title || 'N/A'}`, margin, yOffset);
        yOffset += 5;
        doc.text(`Viral Score: ${selectedTrends[0]?.viralScore || 'N/A'}`, margin, yOffset);
        yOffset += 15;
      } else {
        yOffset += 7;
      }

      // Content for each platform
      targetPlatforms.forEach((platform) => {
        const contentData = generatedContent[platform];
        const content = editedContent[platform] ||
          (typeof contentData === 'string'
            ? contentData
            : (contentData as any)?.content || '');

        if (!content) return;

        // Check for page break before platform header
        if (yOffset > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yOffset = 20;
        }

        // Platform Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(platform.toUpperCase(), margin, yOffset);
        yOffset += 8;

        // Divider
        doc.setDrawColor(200);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 10;

        // Content body
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        
        const splitText = doc.splitTextToSize(content, contentWidth);
        
        // Handle multi-page content for a single platform
        splitText.forEach((line: string) => {
          if (yOffset > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yOffset = 20;
          }
          doc.text(line, margin, yOffset);
          yOffset += 6;
        });

        yOffset += 15; // Gap between platforms
      });

      doc.save(`${baseFileName}-content.pdf`);
    } else {
      let exportContent = '';
      let fileExt = '';
      let mimeType = '';

      const trendInfo = selectedTrends.length > 0
        ? `Trend: ${selectedTrends[0]?.title || 'N/A'}\nViral Score: ${selectedTrends[0]?.viralScore || 'N/A'}\n\n`
        : '';

      if (format === 'md') {
        fileExt = 'md';
        mimeType = 'text/markdown';
        exportContent = `# ${title}\nGenerated: ${timestamp}\n${trendInfo}${targetPlatforms.map(platform => {
          const contentData = generatedContent[platform];
          const content = editedContent[platform] ||
            (typeof contentData === 'string'
              ? contentData
              : (contentData as any)?.content || '');
          return `## ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n${content}`;
        }).join('\n\n---\n\n')}\n`;
      } else {
        fileExt = 'txt';
        mimeType = 'text/plain';
        exportContent = `${title}\nGenerated: ${timestamp}\n${trendInfo}${targetPlatforms.map(platform => {
          const contentData = generatedContent[platform];
          const content = editedContent[platform] ||
            (typeof contentData === 'string'
              ? contentData
              : (contentData as any)?.content || '');
          return `${platform.toUpperCase()}\n${'='.repeat(platform.length)}\n\n${content}`;
        }).join('\n\n' + '-'.repeat(40) + '\n\n')}\n`;
      }

      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFileName}-content.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    showToast(`Campaign exported as ${format.toUpperCase()}!`, "success");
  }, [campaignName, editedContent, generatedContent, selectedTrends, targetPlatforms, showToast]);

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
      parents: { boost: "+23%", desc: "Safety/education content, high share" },
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
    facebook: {
      tone: "casual",
      length: "standard",
      contentFocus: "story",
      audiences: ["general", "hobbyists"],
      callToAction: "share",
      reason: "Facebook thrives on relatable stories and shareable content. Casual tone with emotional hooks drives engagement and shares.",
    },
    instagram: {
      tone: "casual",
      length: "short",
      contentFocus: "story",
      audiences: ["creators", "general"],
      callToAction: "share",
      reason: "Instagram favors visually-driven captions with storytelling. Short, punchy copy with strong hooks performs best.",
    },
    reddit: {
      tone: "casual",
      length: "long",
      contentFocus: "discussion",
      audiences: ["techies", "hobbyists"],
      callToAction: "comment",
      reason: "Reddit rewards authentic, detailed posts that spark discussion. Long-form content with genuine value gets upvoted.",
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
   * NEW: AI Optimize - Auto-select best settings based on user interests and target platforms
   */
  const handleAIOptimize = useCallback(() => {
    // 1. Create optimized settings for ALL derived platforms
    const optimizedMap: Record<string, PlatformSpecificSettings> = {};
    const primaryPlatform = targetPlatforms[0] || "linkedin";

    targetPlatforms.forEach((platform) => {
      // Get the best preset for this platform
      const preset = platformPresets[platform as keyof typeof platformPresets] || platformPresets.linkedin;
      
      optimizedMap[platform] = {
        temperature: controls.temperature, // Keep current temperature
        tone: preset.tone,
        length: preset.length,
        contentFocus: preset.contentFocus,
        targetAudience: preset.audiences[0] || "professionals", // Primary audience for single-select field
        callToAction: preset.callToAction,
        selectedAudiences: preset.audiences, // Multi-select
      };
    });

    // 2. Update platform-specific controls state
    setPlatformControls(optimizedMap);

    // 3. If multiple platforms, ENABLE per-platform mode to show the differences
    if (targetPlatforms.length > 1) {
      setCustomizePerPlatform(true);
      
      // Ensure we have an active tab
      if (!activePlatformTab) {
        setActivePlatformTab(primaryPlatform);
      }
      
      // Update global controls to match the primary platform just as a fallback
      const primaryPreset = platformPresets[primaryPlatform as keyof typeof platformPresets] || platformPresets.linkedin;
      setControls({
        ...controls,
        tone: primaryPreset.tone,
        length: primaryPreset.length,
        contentFocus: primaryPreset.contentFocus,
        callToAction: primaryPreset.callToAction,
      });
      setSelectedAudiences(primaryPreset.audiences);
      
      showToast(`🎯 Optimized settings applied for all ${targetPlatforms.length} platforms!`, "success");
    } else {
      // Single platform case: Update global controls directly
      const preset = platformPresets[primaryPlatform as keyof typeof platformPresets] || platformPresets.linkedin;
      setControls({
        ...controls,
        tone: preset.tone,
        length: preset.length,
        contentFocus: preset.contentFocus,
        callToAction: preset.callToAction,
      });
      setSelectedAudiences(preset.audiences);
      showToast("🎯 Settings optimized for maximum engagement!", "success");
    }

    // 4. Show reasoning (for primary platform)
    const primaryPreset = platformPresets[primaryPlatform as keyof typeof platformPresets] || platformPresets.linkedin;
    setOptimizationReason(primaryPreset.reason);
    setShowOptimizationReason(true);

    // 5. Calculate and show predicted viral score (for primary platform)
    calculatePredictedViralScore(primaryPreset.tone, primaryPreset.contentFocus, primaryPreset.audiences, primaryPreset.callToAction);

  }, [targetPlatforms, platformPresets, controls, showToast, activePlatformTab, calculatePredictedViralScore]);

  // Register Helix Actions (moved here to access function definitions)
  useEffect(() => {
    registerAction("select_highest_trend", () => {
       if (trends.length > 0) {
          const sorted = [...trends].sort((a,b) => (b.viralScore || 0) - (a.viralScore || 0));
          if (sorted[0]) {
             toggleTrendSelection(sorted[0]);
             showToast(`Selected highest intent trend: ${sorted[0].title}`, "success");
          }
       }
    });

    registerAction("optimize_settings", () => {
       handleAIOptimize();
    });
  }, [trends, toggleTrendSelection, handleAIOptimize, registerAction]);



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
  const applyPlatformPreset = useCallback((platform: "twitter" | "tiktok" | "linkedin" | "facebook" | "instagram" | "reddit") => {
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

  /**
   * Load trending topics filtered by niche keywords
   * Used by the NicheSelector on Card 4 (Discover Viral path)
   */
  const loadTrendingTopicsWithNiche = useCallback(async (nicheKeywords: string) => {
    setLoadingTrends(true);
    setHasSearched(true);
    setSearchQuery(nicheKeywords);
    goToCard(5);

    try {
      const params = new URLSearchParams({
        mode: "trending",
        source: trendSource,
        ...(nicheKeywords && { keyword: nicheKeywords }),
      });
      const response = await fetch(`/api/trends?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

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
          setConnectedAccountObjects(data.accounts);
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
      parenting: ["parents"],
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
    // Validation based on campaign type
    if (campaignType === "trending" && selectedTrends.length === 0 && !selectedTrend) {
      showToast("Please select at least one trend before generating content", "error");
      return;
    }

    if (campaignType === "promote" && (!promoteData.productName || !promoteData.description)) {
      showToast("Please provide product name and description", "error");
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
        campaignType,
        promoteData: campaignType === 'promote' ? promoteData : undefined,
        // Fallback topic for compatibility
        topic: campaignType === 'promote'
          ? `${promoteData.productName} - ${promoteData.productType}`
          : (selectedTrend?.title || selectedTrends.map(t => t.title).join(", ")),
        formats: targetPlatforms,
        preferredProvider: aiProvider,
        // Pass content controls to API (map values to API format)
        temperature: controls.temperature,
        tone: controls.tone,
        length: lengthMapping[controls.length] || 'standard',
        audience: selectedAudiences[0] || 'professionals',
        contentFocus: controls.contentFocus,
        callToAction: controls.callToAction,
        perPlatformControls: customizePerPlatform ? (() => {
          const mapped: Record<string, any> = {};
          Object.entries(platformControls).forEach(([key, settings]) => {
            mapped[key] = {
              tone: settings.tone,
              length: lengthMapping[settings.length] || 'standard',
              audience: settings.selectedAudiences?.[0] || 'professionals',
              contentFocus: settings.contentFocus,
              callToAction: settings.callToAction,
            };
          });
          return mapped;
        })() : undefined,
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
    async (publishNow = false): Promise<boolean> => {
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
          return false;
        }

        if (!generatedContent) {
          console.error("[SAVE CAMPAIGN] No generated content - aborting save");
          showToast("No content to save. Please generate content first.", "error");
          return false;
        }

        // Check usage limits before saving (only for new campaigns, not edits)
        if (!isEditMode || !editId) {
          try {
            const usageRes = await fetch("/api/usage");
            const usageJson = await usageRes.json();

            if (usageJson.success) {
              const { tier, limits, usage } = usageJson;

              // Check if user has exceeded monthly campaign limit
              if (tier === "free" && limits.monthly_campaigns !== -1) {
                if (usage.campaigns >= limits.monthly_campaigns) {
                  setUsageData({
                    campaigns: usage.campaigns,
                    campaignLimit: limits.monthly_campaigns,
                  });
                  setUpgradeReason("campaigns");
                  setShowUpgradeModal(true);
                  setLoading(false);
                  return false;
                }
              }
            }
          } catch (err) {
            console.error("[SAVE CAMPAIGN] Usage check failed:", err);
            // Continue with save even if usage check fails
          }
        }

        // Prepare campaign data for RPC
        const campaignData = {
          id: (isEditMode && editId) ? editId : undefined,
          user_id: user.id, // Included for completeness, though RPC verifies auth
          name: campaignName,
          description: "", // Schema has description, defaulted to empty
          target_platforms: targetPlatforms,
          status: publishNow ? "scheduled" : "draft",
          campaign_type: campaignType,
          source_type: campaignType,
          source_data: {
            trend: campaignType === "trending" ? (selectedTrend || selectedTrends[0] || undefined) : undefined,
            trends: campaignType === "trending" ? selectedTrends : [],
            promoteData: campaignType === "promote" ? promoteData : undefined,
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

        // Prepare posts data for RPC
        const postsData = [];
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

          postsData.push({
            title: selectedTrend?.title || searchQuery,
            content: content,
            platform: platform,
            post_type: "text",
            scheduled_at: scheduledTime,
            status: publishNow ? "scheduled" : "draft",
          });
        }

        // Call the Atomic RPC Function
        console.log("[Campaign Save] Calling RPC upsert_campaign_with_posts", { campaignData, postsCount: postsData.length });
        
        const { data, error } = await supabase.rpc('upsert_campaign_with_posts', {
          campaign_data: campaignData,
          posts_data: postsData
        });

        if (error) {
          console.error("[Campaign Save] RPC Error:", error);
          throw error;
        }

        if (data && data.success === false) {
           console.error("[Campaign Save] logic failure:", data.error);
           throw new Error(data.error || "Save failed");
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

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error saving campaign:", error);
        showToast(
          `Failed to save campaign: ${errorMessage}`,
          "error"
        );
        return false;
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
      isEditMode,
      editId,
      campaignType,
      promoteData,
      selectedTrends,
      selectedAudiences
    ]
  );

  /**
   * Copy platform content to clipboard
   */
  const copyContent = useCallback((platform: string) => {
    if (!generatedContent) {
      showToast("No content to copy", "error");
      return;
    }

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
      <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark flex flex-col items-center justify-center gap-4">
        <LoadingState variant="luma" message="" />
        <p className="text-zinc-300 text-lg">Loading campaign data...</p>
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
      
    <div className="relative min-h-screen bg-background overflow-hidden p-1 md:p-3">
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.15)"
        className="absolute inset-0 z-0 h-full w-full opacity-100"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Card-based navigation - single focused card at a time */}
        <AnimatePresence mode="wait" custom={cardDirection}>
          
          {/* CARD 1: Campaign Name */}
          {currentCard === 1 && (
            <motion.div
              key="card-1"
              custom={cardDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl"
            >
              {/* Subtle coral gradient background */}
              <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-white/5 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-coral-600/10 blur-[100px] rounded-full" />

              <div className="relative z-10 text-center mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase bg-white/5 rounded-full border border-white/10">
                    Setup
                  </span>
                  {/* Free/Pro Quota Indicator */}
                  <span className="inline-block px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                    Free Plan: 5 campaigns/mo
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Name your campaign
                </h2>
                <p className="text-gray-200 max-w-md mx-auto">
                  Give your idea a unique identity. This helps you track performance later.
                </p>
              </div>

              <div className="relative z-10 max-w-xl mx-auto">
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && campaignName.trim()) {
                      goToNextCard();
                    }
                  }}
                  placeholder="e.g., Summer Launch 2026"
                  autoFocus
                  className="w-full px-6 py-5 bg-muted/50 border border-input rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-xl text-center placeholder:text-muted-foreground transition-all"
                />

                <motion.button
                  onClick={goToNextCard}
                  disabled={!campaignName.trim()}
                  whileHover={{ scale: !campaignName.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mt-6 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                    !campaignName.trim()
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  }`}
                >
                  Continue
                  <ChevronRight className={`w-5 h-5 transition-transform ${campaignName.trim() ? "translate-x-1" : ""}`} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 2: Content Format Selection */}
          {currentCard === 2 && (
            <motion.div
              key="card-2"
              custom={cardDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl"
            >
              {/* Subtle coral gradient background */}
              <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-white/5 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-coral-600/10 blur-[100px] rounded-full" />

              <div className="relative z-10 text-center mb-6 md:mb-8">
                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-white uppercase bg-white/5 rounded-full border border-white/10">
                  Choose Your Platforms
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Choose Content Formats
                </h2>
                <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                  Select which social media formats you want to create content for. Each format will be optimized for its platform's style and character limits.
                </p>

                <button
                  onClick={() => {
                    const allIds = ["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"];
                    const allSelected = allIds.every((id) => targetPlatforms.includes(id));
                    if (allSelected) {
                      setTargetPlatforms([]);
                    } else {
                      setTargetPlatforms(allIds);
                    }
                  }}
                  className="mt-6 px-4 py-2 bg-white/5 hover:bg-coral-500/20 border border-white/10 rounded-full text-xs font-medium text-white transition-all flex items-center gap-2 mx-auto"
                >
                  {["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"].every((id) =>
                    targetPlatforms.includes(id)
                  ) ? (
                    <>
                      <X className="w-3 h-3" /> Deselect All
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" /> Select All Platforms
                    </>
                  )}
                </button>
              </div>

              <div className="relative z-10 max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
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
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${
                        targetPlatforms.includes(platform.id)
                          ? "bg-white/5 border-coral-500/50 shadow-lg shadow-coral-500/20 ring-2 ring-coral-500/30"
                          : "bg-gray-800/50 border-gray-700 hover:border-coral-500/50 hover:bg-coral-500/5 hover:shadow-lg hover:shadow-coral-500/10"
                      }`}
                    >
                      {targetPlatforms.includes(platform.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <div className="flex items-center justify-center mb-2">
                        <Icon
                          className={`w-8 h-8 transition-colors ${
                            targetPlatforms.includes(platform.id)
                              ? "text-white"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 className="font-semibold mb-1 text-white text-sm">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-gray-200">
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
                  className="relative z-10 text-sm text-yellow-400/80 text-center mt-8"
                >
                  ⚠️ Please select at least one content format to continue.
                </motion.p>
              )}

              <div className="relative z-10 mt-12 flex gap-4 max-w-2xl mx-auto w-full">
                <motion.button
                  onClick={goToPrevCard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gray-800/50 border border-gray-700 rounded-xl font-semibold text-gray-300 hover:border-white/10 hover:text-white transition-all text-lg"
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={goToNextCard}
                  disabled={targetPlatforms.length === 0}
                  whileHover={{ scale: targetPlatforms.length === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                    targetPlatforms.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  }`}
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 3: Heavy Hitters vs Custom Trend - PREMIUM SAAS UPGRADE */}
          {currentCard === 3 && (
            <motion.div
              key="card-3"
              custom={cardDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl"
            >
              {/* Subtle coral gradient background */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-coral-600/10 blur-[100px] rounded-full" />

              <div className="relative z-10 text-center mb-6 md:mb-8">
                 <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-white/5 rounded-full border border-white/10">
                  Discovery
                </span>
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-3 tracking-tight">
                  Choose your starting point
                </h2>
                
                {/* Mini-Explainer */}
                <div className="max-w-xl mx-auto mb-8 bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 flex items-center gap-3 backdrop-blur-sm">
                  <div className="p-2 bg-white/5 rounded-md">
                    <BrainCircuit className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 text-left leading-relaxed">
                    <span className="text-white font-bold">Viral DNA™ Science:</span> We analyze the psychological triggers (Hooks, Emotions, Values) behind 10M+ viral posts to predict success.
                  </p>
                </div>
              </div>

              <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Discover Viral Button */}
                <motion.button
                  onClick={() => { setTrendDiscoveryMode("viral"); goToNextCard(); }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-5 md:p-6 text-left bg-gray-800/60 border border-coral-500/20 rounded-3xl overflow-hidden hover:border-coral-500/40 hover:shadow-2xl hover:shadow-coral-500/10 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-coral-500 group-hover:text-white transition-colors duration-300">
                        <Flame className="w-6 h-6 text-white group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors min-h-[3.5rem] flex items-center">
                        Discover Viral
                      </h3>
                    </div>

                    <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-grow">
                       Don't guess. Browse concepts that are <strong>mathematically predicted</strong> to go viral right now based on current trends.
                    </p>

                    {/* Example Output Preview */}
                    <div className="mb-6 p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-coral-500/20 transition-colors">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Example Output</p>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Hook Strategy</span>
                           <span className="text-white">"Contrarian Truth"</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Primary Emotion</span>
                           <span className="text-white">"Curiosity"</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Value Prop</span>
                           <span className="text-white">"Insider Knowledge"</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors mt-auto">
                      Launch Discovery <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </motion.button>

                {/* Validate Idea Button */}
                <motion.button
                  onClick={() => { setTrendDiscoveryMode("validate"); goToNextCard(); }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-5 md:p-6 text-left bg-gray-800/60 border border-coral-500/20 rounded-3xl overflow-hidden hover:border-coral-500/40 hover:shadow-2xl hover:shadow-coral-500/10 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-coral-500 group-hover:text-white transition-colors duration-300">
                        <Search className="w-6 h-6 text-white group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors min-h-[3.5rem] flex items-center">
                        Validate Idea
                      </h3>
                    </div>

                    <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-grow">
                      Have a topic? We'll analyze its <strong>Viral potential</strong> and give you specific instructions to increase its reach before you create.
                    </p>

                    {/* Example Output Preview */}
                     <div className="mb-6 p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-coral-500/20 transition-colors">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Analysis Preview</p>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Viral Prediction</span>
                           <span className="text-white font-mono font-bold">76/100</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Optimization</span>
                           <span className="text-white">"Add urgency to hook"</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Format Match</span>
                           <span className="text-white">"Perfect for LinkedIn"</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors mt-auto">
                       Start Validation <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </motion.button>

                {/* Promote Product/Service Button */}
                <motion.button
                  onClick={() => { setTrendDiscoveryMode("promote"); setValidationStep("type"); setValidationType(null); goToNextCard(); }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-5 md:p-6 text-left bg-gray-800/60 border border-coral-500/20 rounded-3xl overflow-hidden hover:border-coral-500/40 hover:shadow-2xl hover:shadow-coral-500/10 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-coral-500 group-hover:text-white transition-colors duration-300">
                        <Rocket className="w-6 h-6 text-white group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors min-h-[3.5rem] flex items-center">
                        Promote
                      </h3>
                    </div>

                    <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-grow">
                      Launch a product or service campaign. We'll create <strong>tailored content</strong> designed to convert based on your offering's unique value.
                    </p>

                    {/* Example Output Preview */}
                     <div className="mb-6 p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-coral-500/20 transition-colors">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Content Focus</p>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Positioning</span>
                           <span className="text-white">"Value-first approach"</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">CTA Strategy</span>
                           <span className="text-white">"Drive signups"</span>
                        </div>
                        <div className="flex items-baseline justify-between whitespace-nowrap text-[11px]">
                           <span className="text-zinc-100">Platform Mix</span>
                           <span className="text-white">"Multi-channel"</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors mt-auto">
                       Launch Campaign <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="relative z-10 mt-12 text-center">
                 <motion.button
                  onClick={goToPrevCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-200 hover:text-white text-sm font-medium transition-colors py-2 px-4"
                >
                  ← Go Back
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CARD 4: Direction Refinement (Niche Selection OR Structured Validation) */}
          {currentCard === 4 && (
            <motion.div
              key="card-4"
              custom={cardDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl"
            >
              {/* VIRAL PATH: Niche Selector */}
              {trendDiscoveryMode === "viral" && (
                <NicheSelector
                  selectedNiches={selectedNiches}
                  customNiche={customNiche}
                  onNichesChange={setSelectedNiches}
                  onCustomNicheChange={setCustomNiche}
                  onContinue={() => {
                    const keywords = [
                      ...selectedNiches,
                      ...(customNiche.trim() ? [customNiche.trim()] : []),
                    ].join(", ");
                    loadTrendingTopicsWithNiche(keywords);
                  }}
                  onBack={goToPrevCard}
                />
              )}

              {/* VALIDATE PATH: Keyword Search */}
              {trendDiscoveryMode === "validate" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-2 border-white/10 mb-6"
                    >
                      <TrendingUp className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      What topic do you want to validate?
                    </h2>
                    <p className="text-zinc-300 text-lg">
                      Enter a keyword or topic to discover its viral potential
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
                        placeholder="e.g., artificial intelligence, sustainable fashion, remote work..."
                        autoFocus
                        className="w-full px-8 py-6 bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white text-white text-xl text-center font-light placeholder-tron-text-muted/50 transition-all"
                      />
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-zinc-300" />
                        </motion.button>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <motion.button
                        onClick={goToPrevCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-5 bg-zinc-950/50 border-2 border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all text-lg"
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
                </div>
              )}

              {/* PROMOTE PATH: Type Selection → Data Form */}
              {trendDiscoveryMode === "promote" && (
                <>
                  {validationStep === "type" && (
                    <ValidationTypeSelector
                      onTypeSelect={(type) => {
                        setValidationType(type);
                        setValidationData({ type });
                        setValidationStep("data");
                      }}
                      onBack={goToPrevCard}
                    />
                  )}
                  {validationStep === "data" && validationType && (
                    <ValidationDataForm
                      validationType={validationType}
                      data={validationData}
                      onChange={setValidationData}
                      onContinue={() => {
                        // Map ValidationContext to PromoteData
                        const productType = validationType.startsWith("physical")
                          ? "product"
                          : validationType.startsWith("saas")
                          ? "saas"
                          : validationType.startsWith("service")
                          ? "service"
                          : "other";

                        const mappedPromoteData: PromoteData = {
                          productName: validationData.productName || "",
                          productType,
                          description: validationData.description || "",
                          keyFeatures: validationData.pricingModel
                            ? [validationData.pricingModel]
                            : [],
                          targetAudience: validationData.targetAudience || "",
                          uniqueSellingPoints: validationData.uniqueValue
                            ? [validationData.uniqueValue]
                            : validationData.problemSolved
                            ? [validationData.problemSolved]
                            : [],
                          websiteUrl:
                            validationData.productUrl ||
                            validationData.freeTrialUrl ||
                            "",
                        };

                        setPromoteData(mappedPromoteData);
                        setCampaignType("promote");
                        goToCard(6);
                      }}
                      onBack={() => setValidationStep("type")}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* CARD 5: Trend Results & Selection */}
          {currentCard === 5 && (
            <motion.div
              key="card-5"
              custom={cardDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={loadingTrends ? '' : 'bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-12 shadow-2xl'}
            >
              {loadingTrends ? (
                <div className="flex items-center justify-center min-h-[calc(100vh_-_4rem)]">
                  <LoadingState variant="luma" message="Finding trends..." />
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Pick your trends
                    </h2>
                    <p className="text-zinc-300 text-lg">
                      {selectedTrends.length > 0
                        ? `${selectedTrends.length} trend${selectedTrends.length > 1 ? 's' : ''} selected`
                        : 'Select one or more trending topics'}
                    </p>
                  </div>

                  {/* Viral Score Education Banner */}
                  {trends.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg">
                              <Activity className="w-5 h-5 text-zinc-100" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">
                                Viral Score™ Prediction
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                                Trends are scored (0-100) based on search volume, platform validation, and freshness.
                                <span className="text-white ml-1">Higher scores indicate stronger viral potential.</span>
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={searchQuery.trim() ? () => loadTrendingTopicsWithNiche(searchQuery) : loadTrendingTopics}
                            disabled={loadingTrends}
                            whileHover={{ scale: loadingTrends ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-bold hover:bg-white/20 transition-all disabled:opacity-50 shadow-xl backdrop-blur-md whitespace-nowrap"
                          >
                            <RefreshCw className={`w-4 h-4 ${loadingTrends ? 'animate-spin' : ''}`} />
                            {loadingTrends ? 'Refreshing...' : 'New Suggestions'}
                          </motion.button>
                      </div>
                      <p className="text-[10px] text-gray-300 mt-2 ml-12">
                        💡 Scores vary based on AI analysis. Not happy with these? Click &quot;New Suggestions&quot; to get fresh trend ideas with updated scores.
                      </p>
                    </div>
                  )}

                  <div className="max-w-4xl mx-auto">
                {loadingTrends ? (
                  <LoadingState variant="luma" message="" />
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
                          className={`cursor-pointer p-6 rounded-xl backdrop-blur-xl border-2 transition-all text-left flex flex-col h-full ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_-3px_var(--primary)] text-foreground"
                              : "bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className={`font-semibold ${
                                  isSelected ? "text-white" : "text-zinc-300"
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
                                        : 'bg-gray-700 text-gray-200'
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
                                <p className="text-xs text-zinc-300">
                                  {trend.formattedTraffic}
                                </p>
                              )}
                            </div>
                            <div className="w-6 h-6 flex-shrink-0">
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Viral DNA Tags - NEW */}
                          {trend.viralDNA && (
                            <div className="flex flex-wrap gap-2 mb-3 mt-2">
                              {trend.viralDNA.hookType && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  🪝 {trend.viralDNA.hookType}
                                </span>
                              )}
                              {trend.viralDNA.primaryEmotion && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                  ❤️ {trend.viralDNA.primaryEmotion}
                                </span>
                              )}
                              {trend.viralDNA.valueProp && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  💎 {trend.viralDNA.valueProp}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Viral Score Breakdown - Pinned to bottom */}
                          {trend.viralFactors && trend.viralScore !== undefined && (
                            <div className="mt-auto pt-6">
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
                    <p className="text-zinc-300">No trends found. Try a different search.</p>
                  </div>
                )}

                {!loadingTrends && (
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => goToCard(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-5 bg-zinc-950/50 border-2 border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all text-lg"
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      onClick={() => { setCampaignType("trending"); goToNextCard(); }}
                      disabled={selectedTrends.length === 0}
                      whileHover={{ scale: selectedTrends.length === 0 ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-8 py-5 bg-primary rounded-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-lg"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {campaignType === "promote" ? "Customize your promotion" : "Shape your content"}
                </h2>
                <p className="text-zinc-300">
                  {campaignType === "promote"
                    ? "Tailor how your product will be presented across platforms"
                    : "Customize how your content will be generated"}
                </p>

              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* AI Optimize & Viral Score Section (only for trending campaigns) */}
                <div className="flex items-center gap-4 mb-4">
                  <motion.button
                    onClick={handleAIOptimize}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2"
                  >
                    <BrainCircuit className="w-5 h-5" />
                    AI Optimize (A)
                  </motion.button>

                  {campaignType !== "promote" && (
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-2.5 shadow-xl">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Flame className={`w-5 h-5 ${
                          (selectedTrends[0]?.viralScore || predictedViralScore) > 80 ? "text-green-400" :
                          (selectedTrends[0]?.viralScore || predictedViralScore) > 60 ? "text-yellow-400" : "text-zinc-400"
                        }`} />
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-black mb-0.5">
                          {selectedTrends.length > 0 ? "Trend Viral Score" : "Predicted Viral Score"}
                        </div>
                        <div className="text-2xl font-black text-white font-mono leading-none">
                          {selectedTrends[0]?.viralScore || predictedViralScore}
                        </div>
                      </div>
                    </div>
                  )}

                  {campaignType === "promote" && (
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-5 py-2.5 shadow-xl">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Rocket className="w-5 h-5 text-coral-400" />
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-black mb-0.5">
                          Campaign Type
                        </div>
                        <div className="text-lg font-bold text-white leading-none">
                          Product Promotion
                        </div>
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSaveTemplateDialog(true)}
                    className="ml-auto px-5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save as Template
                  </motion.button>
                </div>

                {/* Platform Cards - Visual Overview */}
                <div className="bg-zinc-950/30 border border-white/5 rounded-xl p-4">
                  {/* Header with sync toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Your Platforms</h3>
                    {targetPlatforms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = !customizePerPlatform;
                          setCustomizePerPlatform(newValue);

                          if (newValue) {
                            // Turning ON: Initialize all platforms with current controls
                            const initialMap: Record<string, PlatformSpecificSettings> = {};
                            targetPlatforms.forEach((p) => {
                              // If we already have settings for this platform, keep them, otherwise use current
                              initialMap[p] = platformControls[p] || { ...controls, selectedAudiences };
                            });
                            setPlatformControls(initialMap);

                            // Select first platform if not selected
                            if (!activePlatformTab) {
                              setActivePlatformTab(targetPlatforms[0]);
                            }
                          }
                        }}
                        className="flex items-center gap-2 group"
                      >
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${!customizePerPlatform ? 'bg-coral-500' : 'bg-gray-600'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${!customizePerPlatform ? 'left-0.5' : 'left-5'}`} />
                        </div>
                        <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                          {!customizePerPlatform ? 'Same for all' : 'Per platform'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Platform Cards Grid */}
                  <div className={`grid gap-3 ${targetPlatforms.length === 1 ? 'grid-cols-1' : targetPlatforms.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {targetPlatforms.map(platform => {
                      const isEditing = customizePerPlatform && activePlatformTab === platform;
                      const platformIcons: Record<string, typeof Twitter> = {
                        twitter: Twitter,
                        tiktok: Music,
                        linkedin: Linkedin,
                        instagram: Instagram,
                        facebook: Facebook,
                      };
                      const PlatformIcon = platformIcons[platform] || Zap;
                      const platformColors: Record<string, string> = {
                        twitter: '#1DA1F2',
                        tiktok: '#00f2ea',
                        linkedin: '#0A66C2',
                        instagram: '#E4405F',
                        facebook: '#1877F2',
                      };

                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            if (targetPlatforms.length > 1) {
                              // If we are turning per-platform ON via clicking a card (implicit activation)
                              if (!customizePerPlatform) {
                                setCustomizePerPlatform(true);
                                const initialMap: Record<string, PlatformSpecificSettings> = {};
                                targetPlatforms.forEach(p => initialMap[p] = { ...controls, selectedAudiences });
                                setPlatformControls(initialMap);
                                setActivePlatformTab(platform);
                              } else {
                                // Just switching tabs
                                if (activePlatformTab !== platform) {
                                  const targetSettings = platformControls[platform];
                                  if (targetSettings) {
                                    // Strip selectedAudiences to assume ContentControls type compliance if needed,
                                    // but setControls accepts ContentControls which is subset of PlatformSpecificSettings
                                    // however explicit casting might be safer to avoid excess properties if strict
                                    const { selectedAudiences: targetAudiences, ...targetControls } = targetSettings;
                                    setControls(targetControls as ContentControls);
                                    setSelectedAudiences(targetAudiences);
                                  }
                                  setActivePlatformTab(platform);
                                }
                              }
                            }
                          }}
                          disabled={targetPlatforms.length === 1}
                          className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                            isEditing
                              ? 'border-white bg-white/10 ring-2 ring-tron-cyan/30'
                              : !customizePerPlatform
                                ? 'border-coral-500/50 bg-coral-500/5'
                                : 'border-gray-700 bg-gray-800/30 hover:border-gray-500'
                          } ${targetPlatforms.length === 1 ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {/* Editing badge */}
                          {isEditing && (
                            <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg border border-primary-foreground/20 z-10">
                              EDITING
                            </div>
                          )}

                          {/* Platform header */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${platformColors[platform]}20` }}>
                              <PlatformIcon className="w-4 h-4" style={{ color: platformColors[platform] || '#888' }} />
                            </div>
                            <span className="font-semibold text-white capitalize">{platform}</span>
                          </div>

                          {/* Current settings preview */}
                          <div className="space-y-1.5">
                            {(() => {
                              // Determine which settings to show for this card
                              // If per-platform is ON, show this platform's specific settings from map
                              // Fallback to current controls if map entry missing (shouldn't happen if init correct)
                              // If per-platform is OFF, show current global controls
                              const displaySettings = customizePerPlatform 
                                ? (platformControls[platform] || controls)
                                : controls;

                              return (
                                <>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300">Tone</span>
                                    <span className="text-white capitalize font-medium">{displaySettings.tone}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300">Length</span>
                                    <span className="text-white capitalize font-medium">{displaySettings.length}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300">Focus</span>
                                    <span className="text-white capitalize font-medium">{displaySettings.contentFocus}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Click hint for multi-platform */}
                          {!customizePerPlatform && targetPlatforms.length > 1 && (
                            <div className="mt-3 pt-2 border-t border-gray-700/50 text-[10px] text-gray-300">
                              Click to customize just this platform
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Editing indicator */}
                  {customizePerPlatform && activePlatformTab && (
                    <div className="mt-4 p-3 bg-white/10 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm text-white">
                          Settings below apply to <span className="font-bold capitalize">{activePlatformTab}</span> only
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomizePerPlatform(false)}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Apply to All
                      </button>
                    </div>
                  )}

                  {/* Quick Presets */}
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-300 uppercase tracking-wide">Quick Presets</span>
                      {customizePerPlatform && activePlatformTab && (
                        <span className="text-xs text-white capitalize">for {activePlatformTab}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {targetPlatforms.includes('tiktok') && (!customizePerPlatform || activePlatformTab === 'tiktok') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("tiktok")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-primary hover:text-primary transition-all flex items-center gap-1.5"
                        >
                          <Music className="w-3 h-3" />
                          TikTok Viral
                        </button>
                      )}
                      {targetPlatforms.includes('twitter') && (!customizePerPlatform || activePlatformTab === 'twitter') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("twitter")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center gap-1.5"
                        >
                          <Twitter className="w-3 h-3" />
                          Twitter Thread
                        </button>
                      )}
                      {targetPlatforms.includes('linkedin') && (!customizePerPlatform || activePlatformTab === 'linkedin') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("linkedin")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-primary hover:text-primary transition-all flex items-center gap-1.5"
                        >
                          <Linkedin className="w-3 h-3" />
                          LinkedIn Pro
                        </button>
                      )}
                      {targetPlatforms.includes('facebook') && (!customizePerPlatform || activePlatformTab === 'facebook') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("facebook")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-[#1877F2] hover:text-[#1877F2] transition-all flex items-center gap-1.5"
                        >
                          <Facebook className="w-3 h-3" />
                          Facebook Story
                        </button>
                      )}
                      {targetPlatforms.includes('instagram') && (!customizePerPlatform || activePlatformTab === 'instagram') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("instagram")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-[#E4405F] hover:text-[#E4405F] transition-all flex items-center gap-1.5"
                        >
                          <Instagram className="w-3 h-3" />
                          Instagram Caption
                        </button>
                      )}
                      {targetPlatforms.includes('reddit') && (!customizePerPlatform || activePlatformTab === 'reddit') && (
                        <button
                          type="button"
                          onClick={() => applyPlatformPreset("reddit")}
                          className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-[#FF4500] hover:text-[#FF4500] transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Reddit Post
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setControls({ ...controls, tone: 'casual', contentFocus: 'tips', length: 'short' })}
                        className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-coral-500 hover:text-white transition-all"
                      >
                        Quick & Casual
                      </button>
                      <button
                        type="button"
                        onClick={() => setControls({ ...controls, tone: 'professional', contentFocus: 'informative', length: 'long' })}
                        className="px-3 py-1.5 bg-zinc-950/50 border border-gray-600 rounded-lg text-xs text-gray-300 hover:border-coral-500 hover:text-white transition-all"
                      >
                        Long-form Pro
                      </button>
                    </div>
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
                      <label className="block text-white font-semibold mb-2 text-sm flex items-center gap-2">
                        Tone <span className="text-xs text-zinc-300">(Press 1-3)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['professional', 'casual', 'friendly'].map((t) => (
                          <div key={t} className="group relative">
                            <ControlOptionButton
                              id={t}
                              label={t.charAt(0).toUpperCase() + t.slice(1)}
                              isSelected={controls.tone === t}
                              onClick={(id) => setControls({ ...controls, tone: id })}
                              className="w-full"
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                              <div className="font-bold text-white mb-0.5">{engagementData.tone[t as keyof typeof engagementData.tone]?.boost} engagement</div>
                              <div className="text-gray-200 text-[11px] leading-relaxed">{engagementData.tone[t as keyof typeof engagementData.tone]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Length Slider */}
                    <div>
                      <label htmlFor="content-length-slider" className="block text-white font-semibold mb-2 text-sm flex items-center gap-2">
                        Content Length <span className="text-xs text-zinc-300">(Press S/M/L)</span>
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
                          className="w-full h-2 bg-zinc-950/50 rounded-lg appearance-none cursor-pointer range-slider"
                        />
                        <div className="flex justify-between text-xs text-zinc-300">
                          <span className={controls.length === 'short' ? 'text-white font-semibold' : ''}>Short (280 chars)</span>
                          <span className={controls.length === 'standard' ? 'text-white font-semibold' : ''}>Standard (500 chars)</span>
                          <span className={controls.length === 'long' ? 'text-white font-semibold' : ''}>Long (1000+ chars)</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Focus with Tooltips */}
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">Content Focus</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['informative', 'discussion', 'opinion', 'news', 'tips', 'story', 'walkthrough'].map((f) => (
                          <div key={f} className="group relative">
                            <ControlOptionButton
                              id={f}
                              label={f.charAt(0).toUpperCase() + f.slice(1)}
                              isSelected={controls.contentFocus === f}
                              onClick={(id) => setControls({ ...controls, contentFocus: id })}
                              className="w-full"
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                              <div className="font-bold text-white mb-0.5">{engagementData.contentFocus[f as keyof typeof engagementData.contentFocus]?.boost} engagement</div>
                              <div className="text-gray-200 text-[11px] leading-relaxed">{engagementData.contentFocus[f as keyof typeof engagementData.contentFocus]?.desc}</div>
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
                      <label className="block text-white font-semibold mb-2 text-sm">
                        Target Audience <span className="text-xs text-zinc-300">(Select up to 3)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['professionals', 'entrepreneurs', 'creators', 'students', 'techies', 'gamers', 'hobbyists', 'parents'].map((a) => (
                          <div key={a} className="group relative">
                            <ControlOptionButton
                              id={a}
                              label={a.charAt(0).toUpperCase() + a.slice(1)}
                              isSelected={selectedAudiences.includes(a)}
                              onClick={() => {
                                if (!(selectedAudiences.length >= 3 && !selectedAudiences.includes(a))) {
                                  toggleAudience(a);
                                }
                              }}
                              className={`w-full ${selectedAudiences.length >= 3 && !selectedAudiences.includes(a) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                              <div className="font-bold text-white mb-0.5">{engagementData.targetAudience[a as keyof typeof engagementData.targetAudience]?.boost} engagement</div>
                              <div className="text-gray-200 text-[11px] leading-relaxed">{engagementData.targetAudience[a as keyof typeof engagementData.targetAudience]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAudiences.length > 0 && (
                        <div className="mt-2 text-xs text-zinc-300">
                          Selected: {selectedAudiences.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Call to Action with Tooltips (NO "none") */}
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">Call to Action</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['engage', 'share', 'comment', 'follow', 'learn'].map((c) => (
                          <div key={c} className="group relative">
                            <ControlOptionButton
                              id={c}
                              label={c.charAt(0).toUpperCase() + c.slice(1)}
                              isSelected={controls.callToAction === c}
                              onClick={(id) => setControls({ ...controls, callToAction: id })}
                              className="w-full"
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
                              <div className="font-bold text-white mb-0.5">{engagementData.callToAction[c as keyof typeof engagementData.callToAction]?.boost} engagement</div>
                              <div className="text-gray-200 text-[11px] leading-relaxed">{engagementData.callToAction[c as keyof typeof engagementData.callToAction]?.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending This Week */}
                <div className="bg-zinc-950/30 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <div className="text-sm text-white font-semibold">Trending This Week</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {trendingCombinations.map((combo) => (
                      <button
                        type="button"
                        key={combo.name}
                        onClick={() => applyTrendingCombination(combo)}
                        className="text-left px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/10 transition-all active:scale-[0.98]"
                      >
                        <div className="text-xs font-semibold text-white mb-1">{combo.name}</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <span className="text-green-400">{combo.successRate}</span>
                          <span>•</span>
                          <span>{combo.uses} uses</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="text-center text-xs text-zinc-300">
                  💡 Tip: Use keyboard shortcuts - 1-3 for tone, S/M/L for length, A for AI optimize
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mt-6">
                  <motion.button
                    onClick={goToPrevCard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
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
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl font-semibold text-white shadow-lg shadow-purple-900/20 hover:border-purple-500/60 hover:shadow-purple-500/20 transition-all"
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
                    className="bg-zinc-950 border-2 border-white/10 rounded-2xl p-6 max-w-md w-full mx-4"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Save as Template</h3>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name..."
                      className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-lg text-white outline-none focus:border-white/50 mb-4"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveTemplate()}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSaveTemplateDialog(false)}
                        className="flex-1 px-4 py-2 bg-zinc-950/50 border border-white/10 rounded-lg text-white hover:bg-white/10"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={generatingContent ? '' : 'bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl max-w-4xl mx-auto'}
            >
              {generatingContent ? (
                <div className="flex items-center justify-center min-h-[calc(100vh_-_4rem)]">
                   <LoadingState variant="luma" message="Generating high-viral content..." />
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Enter campaign name"
                      className="text-3xl font-bold text-white mb-2 bg-transparent border-2 border-transparent hover:border-white/10 focus:border-white/50 rounded-lg px-4 py-2 text-center outline-none transition-all w-full max-w-2xl mx-auto"
                    />
                    {generatedContent && (
                      <p className="text-zinc-300">
                        Edit and publish your campaign
                      </p>
                    )}
                  </div>

                  <div className="max-w-4xl mx-auto">
                    {generatedContent ? (
                  <>
                    {/* Platform Switcher Toolbar */}
                    <div className="flex gap-2 mb-6 p-2 bg-zinc-950/50 border border-white/10 rounded-xl">
                      {targetPlatforms.map((platform) => (
                        <motion.button
                          key={platform}
                          onClick={() => { setActivePlatformView(platform); setViewAllContent(false); }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                            activePlatformView === platform && !viewAllContent
                              ? "bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg"
                              : "text-zinc-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </motion.button>
                      ))}
                      {/* View All Toggle */}
                      <motion.button
                        onClick={() => setViewAllContent(!viewAllContent)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border-l border-white/10 ml-2 ${
                          viewAllContent
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                            : "text-zinc-300 hover:text-white hover:bg-purple-500/10"
                        }`}
                      >
                        View All
                      </motion.button>
                    </div>

                    {/* View All Content OR Single Platform View */}
                    {viewAllContent ? (
                      <div className="space-y-4 mb-6">
                        {/* Viral DNA Display */}
                        {selectedTrends[0]?.viralDNA && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Viral DNA&trade; Analysis</h4>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-300">Hook:</span>
                                <span className="text-sm font-semibold text-white">{selectedTrends[0].viralDNA.hookType}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-300">Emotion:</span>
                                <span className="text-sm font-semibold text-white">{selectedTrends[0].viralDNA.primaryEmotion}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-300">Value:</span>
                                <span className="text-sm font-semibold text-white">{selectedTrends[0].viralDNA.valueProp}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* All Platform Content Cards */}
                        {targetPlatforms.map((platform) => {
                          const content = editedContent[platform] ||
                            (typeof generatedContent[platform] === 'string'
                              ? generatedContent[platform]
                              : (generatedContent[platform] as ContentData)?.content || '');
                          return (
                            <motion.div
                              key={platform}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-zinc-950/50 border border-white/10 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-white capitalize">{platform}</h4>
                                <button
                                  type="button"
                                  onClick={() => copyContent(platform)}
                                  className="px-3 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" /> Copy
                                </button>
                              </div>
                              <p className="text-zinc-300 text-sm whitespace-pre-wrap line-clamp-4">{content}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {/* Content Display for Active Platform */}
                        <AnimatePresence mode="wait">
                          {activePlatformView && generatedContent[activePlatformView] && (
                            <motion.div
                              key={activePlatformView}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="bg-zinc-950/50 border-2 border-white/10 rounded-xl p-6 mb-6"
                            >
                              {/* Header with Platform Name */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-white">
                                    {activePlatformView.charAt(0).toUpperCase() + activePlatformView.slice(1)} Post
                                  </h3>
                                  <p className="text-sm text-zinc-300">
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
                                  className="w-full h-64 px-4 py-3 bg-zinc-950/50 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-tron-cyan/50 focus:border-white resize-none"
                                />
                              ) : (
                                <div className="bg-zinc-950/30 border border-zinc-800 rounded-xl p-4">
                                  <p className="text-white whitespace-pre-wrap">
                                    {editedContent[activePlatformView] || (typeof generatedContent[activePlatformView] === 'string' ? generatedContent[activePlatformView] : generatedContent[activePlatformView]?.content || '')}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Transfer Masterclass - Context-Aware Guide for All Platforms */}
                        {activePlatformView && generatedContent[activePlatformView] && (
                          <div className="mb-6">
                            <TransferMasterclass
                              activePlatform={activePlatformView}
                              content={editedContent[activePlatformView] || (typeof generatedContent[activePlatformView] === 'string' ? generatedContent[activePlatformView] : generatedContent[activePlatformView]?.content || '')}
                              onCopy={() => showToast("Content copied!", "success")}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Navigation - Back, Copy, Edit, and Bulk Actions */}
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        onClick={goToPrevCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-zinc-950/50 border-2 border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
                      >
                        ← Back
                      </motion.button>
                      {!viewAllContent && activePlatformView && generatedContent[activePlatformView] && (
                        <>
                          <motion.button
                            onClick={() => copyContent(activePlatformView)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-zinc-950/50 border-2 border-green-500/30 rounded-xl font-semibold text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Content
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingContent({ ...editingContent, [activePlatformView]: !editingContent[activePlatformView] })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-zinc-950/50 border-2 border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
                          >
                            {editingContent[activePlatformView] ? "Save Edits" : "Edit Content"}
                          </motion.button>
                        </>
                      )}
                      {/* Bulk Actions - Always visible when content exists */}
                      <motion.button
                        onClick={copyAllContent}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-zinc-950/50 border-2 border-green-500/30 rounded-xl font-semibold text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy All
                      </motion.button>
                      <div className="relative">
                        <motion.button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-zinc-950/50 border-2 border-purple-500/30 rounded-xl font-semibold text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </motion.button>

                        <AnimatePresence>
                          {showExportMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                            >
                              <button
                                onClick={() => { exportCampaign('md'); setShowExportMenu(false); }}
                                className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                              >
                                <span className="p-1 px-1.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold">MD</span>
                                Markdown
                              </button>
                              <button
                                onClick={() => { exportCampaign('txt'); setShowExportMenu(false); }}
                                className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                              >
                                <span className="p-1 px-1.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold">TXT</span>
                                Plain Text
                              </button>
                              <button
                                onClick={() => { exportCampaign('pdf'); setShowExportMenu(false); }}
                                className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                              >
                                <span className="p-1 px-1.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">PDF</span>
                                PDF Document
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-300">No content generated yet.</p>
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
                        className="px-6 py-4 bg-zinc-900/50 backdrop-blur-xl border-2 border-white/50 rounded-2xl font-semibold text-white hover:border-white hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        aria-label="Save campaign as draft"
                      >
                        {loading ? (
                          <OrbitalLoader className="w-5 h-5" />
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            {campaignSaved ? "Saved" : "Save Draft"}
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={async () => {
                          const success = await saveCampaign(false);
                          if (success) {
                            router.push('/campaigns');
                          }
                        }}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-semibold text-white shadow-lg shadow-green-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        aria-label="Save and return to dashboard"
                      >
                        {loading ? (
                          <OrbitalLoader className="w-5 h-5" />
                        ) : (
                          <>
                            <Home className="w-5 h-5" />
                            Save & Dashboard
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
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
                        ? "bg-gradient-to-br from-tron-cyan to-tron-magenta shadow-lg shadow-white/20 ring-4 ring-white/10"
                        : isCompleted
                          ? "bg-white/20 border-2 border-white"
                          : "bg-zinc-900 border-2 border-zinc-800"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isActive
                            ? "text-white"
                            : "text-zinc-300"
                        }`}
                      />
                    )}
                  </div>
                  {idx < stepConfig.length - 1 && (
                    <div
                      className={`w-20 h-0.5 transition-all duration-500 ${
                        isCompleted ? "bg-white" : "bg-zinc-900"
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
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 1 && "Setup Your Campaign"}
              {step === 2 && "Discover Trending Topics"}
              {step === 3 && "Generate Content"}
            </h2>
            <p className="text-zinc-300">
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
                <label htmlFor="campaign-name" className="block text-sm font-medium text-zinc-300">
                  Campaign Name <span className="text-zinc-300">*</span>
                </label>
                <input
                  type="text"
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Product Launch"
                  aria-label="Campaign name"
                  aria-required="true"
                  className="w-full px-6 py-4 bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white text-white text-xl font-light placeholder-tron-text-muted/50 transition-all"
                />
                {campaignName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-white flex items-center gap-2"
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
                    <h3 className="text-lg font-semibold text-white">
                      Target Platforms <span className="text-zinc-300">*</span>
                    </h3>
                    <p className="text-sm text-zinc-300 mt-1">
                      {targetPlatforms.length > 0 
                        ? `${targetPlatforms.length} platform${targetPlatforms.length > 1 ? 's' : ''} selected`
                        : 'Select at least one platform'}
                    </p>
                  </div>
                  {connectedPlatforms.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-white">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
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
                          ? "bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-white shadow-xl shadow-tron-cyan/30 ring-2 ring-white/10"
                          : "bg-zinc-950/50 border-zinc-800 hover:border-white/50 hover:shadow-lg"
                      }`}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-3 left-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Connection Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isConnected ? (
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/20 animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping" />
                          </div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-zinc-900 border border-tron-text-muted/30" />
                        )}
                      </div>

                      <Icon
                        className={`w-12 h-12 mb-4 mx-auto transition-all duration-300 ${
                          isSelected
                            ? "text-white"
                            : "text-zinc-300 group-hover:text-white"
                        }`}
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 12px ${platform.color})`
                            : "none",
                        }}
                      />
                      <div className={`font-semibold text-center transition-colors ${
                        isSelected ? "text-white" : "text-white"
                      }`}>
                        {platform.name}
                      </div>
                      {isConnected && (
                        <div className="text-xs text-white mt-1 text-center">
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
                    className="text-sm text-zinc-300 text-center mb-4"
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
                <label htmlFor="search-trends" className="block text-sm font-medium text-zinc-300">
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
                      className="w-full px-6 py-4 bg-zinc-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white text-white text-lg placeholder-tron-text-muted/50 transition-all"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-300 hover:text-white transition-colors"
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
                    <h3 className="text-lg font-semibold text-white">
                      Trending Topics
                    </h3>
                    <span className="text-sm text-zinc-300">
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
                            ? "bg-gradient-to-r from-tron-cyan/20 to-tron-magenta/20 border-white shadow-xl ring-2 ring-white/10"
                            : "bg-zinc-950/50 border-zinc-800 hover:border-white/50 hover:shadow-lg"
                        }`}
                      >
                        {selectedTrend === trend && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`font-semibold text-lg ${
                            selectedTrend === trend ? "text-white" : "text-white"
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
                          <span className="text-zinc-300">
                            {trend.formattedTraffic || "Trending"}
                          </span>
                          {trend.relatedQueries && (
                            <span className="text-white">
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
                    <div className="p-6 bg-zinc-900/30 rounded-full">
                      <TrendingUp className="w-16 h-16 text-zinc-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    No trends found
                  </h3>
                  <p className="text-zinc-300 max-w-md mx-auto">
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
                      <Sparkles className="w-16 h-16 text-white" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Discover Trending Topics
                  </h3>
                  <p className="text-zinc-300 max-w-md mx-auto mb-8">
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
                        className="px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-white hover:border-white hover:bg-white/10 transition-all text-sm"
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
                  className="px-8 py-4 bg-zinc-900/50 border-2 border-white/10 rounded-2xl font-semibold text-white hover:border-white hover:bg-white/10 transition-all"
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
                  mode={campaignType === "promote" ? "promote" : "trending"}
                />
              </ErrorBoundary>

              {/* Generate Button */}
              <motion.button
                onClick={generateContent}
                disabled={generatingContent || (campaignType !== "promote" && selectedTrends.length === 0)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-6 bg-white text-tron-dark font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-3"
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
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-white" />
                      Generated Posts
                    </h3>
                    <span
                      className="text-sm text-zinc-300"
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
                          onCopy={copyContent}
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
                      className="px-8 py-5 bg-zinc-900/50 backdrop-blur-xl border-2 border-white/50 rounded-2xl font-semibold text-white hover:border-white hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      aria-label="Save campaign as draft"
                    >
                      {loading ? (
                        <OrbitalLoader className="w-5 h-5" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Save for Later
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => saveCampaign(true)}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      aria-label="Schedule campaign"
                    >
                      {loading ? (
                        <OrbitalLoader className="w-5 h-5" />
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Schedule for Later
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-zinc-900/50 border-2 border-white/10 rounded-2xl font-semibold text-white"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification - using refactored component */}
        <Toast toast={toast} />

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeReason}
          currentUsage={usageData}
        />
      </div>

      </div>
      {/* End hidden old content */}

    </div>
    </>
  );
}


