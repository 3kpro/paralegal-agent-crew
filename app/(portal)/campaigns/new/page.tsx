"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendSourceSelector } from "@/components/ui";
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
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);

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
    if (!selectedTrend) return;

    setGeneratingContent(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTrend.title || searchQuery,
          formats: targetPlatforms,
          preferredProvider: aiProvider,
          // Pass content controls to API
          ...controls,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.content);
        showToast("Content generated successfully!", "success");
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
  }, [selectedTrend, searchQuery, targetPlatforms, aiProvider, controls, showToast, router]);

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
          setGeneratedContent((prevGen) => ({
            ...prevGen,
            [platform]:
              typeof prevGen[platform] === "string"
                ? editedText
                : {
                    ...prevGen[platform],
                    content: editedText,
                  },
          }));
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

        // Delay navigation to show toast
        setTimeout(() => router.push("/campaigns"), 1500);
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
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-8">
      <div className="max-w-6xl mx-auto">
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
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {trends.map((trend, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTrend(trend)}
                        whileHover={{ scale: 1.02, x: 5 }}
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
                        <div className={`font-semibold text-lg mb-2 ${
                          selectedTrend === trend ? "text-tron-cyan" : "text-tron-text"
                        }`}>
                          {trend.title}
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
                disabled={generatingContent}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-6 bg-gradient-to-r from-tron-cyan via-tron-magenta to-tron-cyan bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-tron-cyan/50 disabled:opacity-50 transition-all duration-500 flex items-center justify-center gap-3"
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
                      className="px-8 py-5 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-bold text-white shadow-xl shadow-tron-cyan/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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

      <style jsx global>{`
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
    </div>
  );
}


