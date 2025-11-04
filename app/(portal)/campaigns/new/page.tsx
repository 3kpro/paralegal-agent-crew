"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Fireworks from "@/components/Fireworks";
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
  Loader2,
  Link,
  X,
  Menu as MenuIcon,
  Home,
  Settings,
  Save,
  Eye,
  Calendar,
  LayoutDashboard,
  Palette,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendSourceSelector, AnimatedLoader } from "@/components/ui";
import ErrorBoundary from "@/components/ErrorBoundary";
import CreativitySlider from "./components/CreativitySlider";
import ContentSettings from "./components/ContentSettings";
import GeneratedContentCard from "./components/GeneratedContentCard";
import Toast from "./components/Toast";
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

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Card-based navigation state
  const [currentCard, setCurrentCard] = useState(1);
  const [cardDirection, setCardDirection] = useState(1); // 1 for forward, -1 for back
  const [activePlatformView, setActivePlatformView] = useState<string>(""); // For Card 6 platform switcher
  const [showFireworks, setShowFireworks] = useState(false);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [campaignName, setCampaignName] = useState("");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Step 2: Trend Discovery
  const [searchQuery, setSearchQuery] = useState("");
  const [trendSource, setTrendSource] = useState("mixed");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<Trend[]>([]); // Multiple trends
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
  const [aiProvider, setAiProvider] = useState("lmstudio");
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
    targetAudience: "general",
    contentFocus: "informative",
    callToAction: "engage",
  });

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
    setCardDirection(-1);
    setCurrentCard((prev) => Math.max(prev - 1, 1));
  }, []);

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
            (p: any) =>
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
            (account: any) => account.platform,
          );
          setConnectedPlatforms(connected);
        }
      } catch (error) {
        console.error("Failed to load social accounts:", error);
      }
    }
    loadSocialAccounts();
  }, []);

  /**
   * Generate content for selected platforms
   */
  const generateContent = useCallback(async () => {
    if (selectedTrends.length === 0) {
      showToast("Please select at least one trend before generating content", "error");
      return;
    }

    setGeneratingContent(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTrends.map(t => t.title).join(", "),
          formats: targetPlatforms,
          preferredProvider: aiProvider,
          // Pass content controls to API (map targetAudience to audience for API)
          temperature: controls.temperature,
          tone: controls.tone,
          length: controls.length,
          audience: controls.targetAudience, // API expects "audience" not "targetAudience"
          contentFocus: controls.contentFocus,
          callToAction: controls.callToAction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.content);
        showToast("Content generated successfully!", "success");
        
        // Trigger fireworks celebration after a delay so content shows first
        setTimeout(() => {
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 5000);
        }, 1000);
      } else if (data.requiresSetup) {
        showToast("No AI tools configured. Redirecting to Settings...", "error");
        setTimeout(() => router.push("/settings?tab=api-keys"), 2000);
      } else {
        showToast(`Generation failed: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      showToast("Content generation failed. Please try again.", "error");
    } finally {
      setGeneratingContent(false);
    }
  }, [selectedTrends, targetPlatforms, aiProvider, controls, showToast, router]);

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
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          showToast("Please log in to save campaigns", "error");
          router.push("/login");
          return;
        }

        if (!generatedContent) {
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
            trend: selectedTrend!,
            query: searchQuery,
            controls: {
              temperature: controls.temperature,
              tone: controls.tone,
              length: controls.length,
            },
          },
          ai_provider: aiProvider,
          tone: controls.tone,
        };

        const { data: campaign, error: campaignError } = await supabase
          .from("campaigns")
          .insert(campaignPayload)
          .select()
          .single();

        if (campaignError) throw campaignError;

        // Save generated content for each platform
        const postsToInsert: ScheduledPost[] = [];
        for (const [platform, contentData] of Object.entries(generatedContent)) {
          if (platform === "hashtags") continue;

          // Handle both string and object formats
          const content =
            typeof contentData === "string"
              ? contentData
              : (contentData as any)?.content || "";

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
          const { error: postsError } = await supabase
            .from("scheduled_posts")
            .insert(postsToInsert);

          if (postsError) throw postsError;
        }

        showToast(
          publishNow
            ? "Campaign scheduled successfully!"
            : "Campaign saved as draft!",
          "success"
        );

        // Trigger fireworks celebration after a delay so toast shows first
        setTimeout(() => {
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 5000);
        }, 1000);

        // Delay navigation to show toast and fireworks
        setTimeout(() => router.push("/campaigns"), 6500);
      } catch (error: any) {
        console.error("Error saving campaign:", error);
        showToast(
          `Failed to save campaign: ${error.message || "Unknown error"}`,
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
      
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-8">
      <div className="max-w-4xl mx-auto">
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

          {/* CARD 2: Platform Selection */}
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
                  <Zap className="w-10 h-10 text-tron-cyan" />
                </motion.div>
                <h2 className="text-4xl font-bold text-tron-text mb-4">
                  Choose target accounts
                </h2>
                <p className="text-tron-text-muted text-lg">
                  Select one or more platforms
                  {targetPlatforms.length > 0 && (
                    <span className="text-tron-cyan"> · {targetPlatforms.length} selected</span>
                  )}
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = targetPlatforms.includes(platform.id);
                    const isConnected = connectedPlatforms.includes(platform.id);

                    return (
                      <motion.button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-8 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 group ${
                          isSelected
                            ? "bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 border-tron-cyan shadow-xl shadow-tron-cyan/30"
                            : "bg-tron-dark/50 border-tron-grid hover:border-tron-cyan/50"
                        }`}
                      >
                        {/* Selection Checkmark */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-tron-cyan rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Connection Status */}
                        {isConnected && (
                          <div className="absolute top-3 left-3">
                            <div className="w-3 h-3 rounded-full bg-tron-cyan shadow-lg shadow-tron-cyan/50 animate-pulse" />
                          </div>
                        )}

                        <Icon
                          className={`w-12 h-12 mb-3 mx-auto transition-all duration-300 ${
                            isSelected
                              ? "text-tron-cyan"
                              : "text-tron-text-muted group-hover:text-tron-cyan"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold transition-colors ${
                            isSelected ? "text-tron-text" : "text-tron-text-muted group-hover:text-tron-text"
                          }`}
                        >
                          {platform.name}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex gap-4">
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
                  <AnimatedLoader message="" />
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
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-gradient-to-r from-tron-cyan/10 to-tron-magenta/10 border border-tron-cyan/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Sparkles className="w-5 h-5 text-tron-cyan" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-tron-text mb-1 flex items-center gap-2">
                            Viral Score™ Prediction
                            <span className="inline-flex gap-1 items-center">
                              <Flame className="w-3.5 h-3.5 text-green-400" />
                              <Zap className="w-3.5 h-3.5 text-yellow-400" />
                              <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                            </span>
                          </h4>
                          <p className="text-xs text-tron-text-muted leading-relaxed">
                            Each trend is scored 0-100 based on <span className="text-tron-cyan font-semibold">search volume</span>, <span className="text-tron-cyan font-semibold">multi-platform validation</span>, <span className="text-tron-cyan font-semibold">topic specificity</span>, and <span className="text-tron-cyan font-semibold">freshness</span>.
                            Higher scores mean <span className="text-green-400 font-semibold">higher viral potential</span> - helping you choose topics that perform best.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="max-w-4xl mx-auto">
                {loadingTrends ? (
                  <AnimatedLoader message="" />
                ) : trends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-96 overflow-y-scroll pr-2 scrollbar-thin scrollbar-thumb-tron-cyan/30 scrollbar-track-tron-dark/50">
                    {trends.slice(0, 8).map((trend, idx) => {
                      const isSelected = selectedTrends.some((t) => t.title === trend.title);
                      return (
                        <motion.button
                          key={`${trend.title}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => toggleTrendSelection(trend)}
                          whileTap={{ scale: 0.98 }}
                          className={`p-6 rounded-xl backdrop-blur-xl border-2 transition-all text-left ${
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
                        </motion.button>
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

          {/* CARD 6: Content Controls/Shaping */}
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

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Tone */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Tone</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['professional', 'casual', 'friendly'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setControls({ ...controls, tone: t })}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              controls.tone === t
                                ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                            }`}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Length */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Content Length</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['short', 'standard', 'long'].map((l) => (
                          <button
                            key={l}
                            onClick={() => setControls({ ...controls, length: l })}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              controls.length === l
                                ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                            }`}
                          >
                            {l.charAt(0).toUpperCase() + l.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Focus */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Content Focus</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['informative', 'entertaining', 'educational', 'promotional'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setControls({ ...controls, contentFocus: f })}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              controls.contentFocus === f
                                ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                            }`}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    {/* Target Audience */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Target Audience</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['general', 'technical', 'business', 'creative'].map((a) => (
                          <button
                            key={a}
                            onClick={() => setControls({ ...controls, targetAudience: a })}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              controls.targetAudience === a
                                ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                            }`}
                          >
                            {a.charAt(0).toUpperCase() + a.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div>
                      <label className="block text-tron-text font-semibold mb-2 text-sm">Call to Action</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['engage', 'convert', 'learn', 'share'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setControls({ ...controls, callToAction: c })}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              controls.callToAction === c
                                ? 'bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg'
                                : 'bg-tron-dark/50 border border-tron-cyan/30 text-tron-text hover:border-tron-cyan/50'
                            }`}
                          >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  <AnimatedLoader message="" />
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
                          {/* Header with Platform Name and Action Buttons */}
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
                            <div className="flex gap-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2.5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-lg font-semibold text-white shadow-lg text-sm"
                              >
                                Post
                              </motion.button>
                              <motion.button
                                onClick={() => router.push("/campaigns")}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2.5 bg-tron-dark/50 border border-tron-magenta/30 rounded-lg font-semibold text-tron-magenta hover:bg-tron-magenta/10 text-sm"
                              >
                                Save
                              </motion.button>
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

                    {/* Navigation - Just Back and Edit */}
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
                        <motion.button
                          onClick={() => setEditingContent({ ...editingContent, [activePlatformView]: !editingContent[activePlatformView] })}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-6 py-3 bg-tron-dark/50 border-2 border-tron-cyan/30 rounded-xl font-semibold text-tron-cyan hover:bg-tron-cyan/10 transition-all"
                        >
                          {editingContent[activePlatformView] ? "Save Edits" : "Edit Content"}
                        </motion.button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tron-text-muted">No content generated yet.</p>
                  </div>
                )}
                  </div>
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
                          : (contentData as any)?.content || "";

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
                    <motion.button
                      onClick={() => saveCampaign(true)}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-5 bg-tron-cyan text-tron-dark font-bold rounded-xl hover:bg-tron-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      aria-label="Publish campaign now"
                    >
                      <Sparkles className="w-5 h-5" />
                      {loading ? "Publishing..." : "Publish Now"}
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


