"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import InstructionCard from "@/components/InstructionCard";
import LoadingButton from "@/components/LoadingButton";
import { SettingsSkeleton } from "@/components/SkeletonLoader";
import ComingSoonModal from "@/components/ComingSoonModal";

// Provider Instructions Data
const PROVIDER_INSTRUCTIONS = {
  openai: {
    url: "https://platform.openai.com/api-keys",
    steps: [
      "Sign in to OpenAI Platform",
      'Click "Create new secret key"',
      'Name your key (e.g., "Content Cascade")',
      "Copy the key (shown only once)",
      "Paste above and save",
    ],
    timeEstimate: "~3 minutes",
    costInfo: "$5 free credit, then $0.002-0.12 per 1K tokens",
    keyFormat: "sk-...",
  },
  anthropic: {
    url: "https://console.anthropic.com/settings/keys",
    steps: [
      "Sign in to Anthropic Console",
      "Navigate to API Keys section",
      'Click "Create Key"',
      "Copy the key",
      "Paste above and save",
    ],
    timeEstimate: "~3 minutes",
    costInfo: "$5 free credit, then $0.25-15 per million tokens",
    keyFormat: "sk-ant-...",
  },
  google: {
    url: "https://aistudio.google.com/app/apikey",
    steps: [
      "Sign in with Google account",
      'Click "Get API key"',
      "Create or select project",
      "Copy generated key",
      "Paste above and save",
    ],
    timeEstimate: "~5 minutes",
    costInfo: "Free tier available, then $0.00025-0.00125 per 1K chars",
    keyFormat: "AIza...",
  },
  elevenlabs: {
    url: "https://elevenlabs.io/api",
    steps: [
      "Sign in to ElevenLabs",
      "Go to Profile Settings",
      "Copy API key from API section",
      "Paste above and save",
    ],
    timeEstimate: "~2 minutes",
    costInfo: "10,000 free chars/month, then $5/month",
    keyFormat: "Standard alphanumeric",
  },
  xai: {
    url: "https://console.x.ai/",
    steps: [
      "Sign in with X (Twitter) account",
      "Navigate to API section",
      "Generate API key",
      "Copy the key",
      "Paste above and save",
    ],
    timeEstimate: "~3 minutes",
    costInfo: "Pricing TBD (currently in beta)",
    keyFormat: "xai-...",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"pro" | "premium">("pro");

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [redditHandle, setRedditHandle] = useState("");

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
    xai: "",
    elevenlabs: "",
  });

  // Testing state
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Usage data
  const [usageData, setUsageData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadUserData(), loadUsageData()]).finally(() => {
      setInitialLoading(false);
    });
  }, []);

  async function loadUsageData() {
    try {
      const response = await fetch("/api/usage");
      const data = await response.json();

      if (data.success) {
        setUsageData(data.usage);
      }
    } catch (error: any) {
      console.error("Error loading usage data:", error);
    }
  }

  async function loadUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email || "");

    try {
      // Load profile using new API
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.success && data.profile) {
        const profile = data.profile;
        setFullName(profile.full_name || "");
        setCompanyName(profile.company_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setCompanyLogoUrl(profile.company_logo_url || "");
        setBio(profile.bio || "");
        setWebsite(profile.website || "");
        setTimezone(profile.timezone || "America/New_York");
        setLanguage(profile.language || "en-US");
        setTwitterHandle(profile.twitter_handle || "");
        setLinkedinUrl(profile.linkedin_url || "");
        setFacebookUrl(profile.facebook_url || "");
        setInstagramHandle(profile.instagram_handle || "");
        setTiktokHandle(profile.tiktok_handle || "");
        setRedditHandle(profile.reddit_handle || "");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setMessage("Error loading profile: " + error.message);
    }

    // Load API keys from new AI Tools API
    try {
      const response = await fetch("/api/ai-tools/list");
      const data = await response.json();

      if (data.success && data.providers) {
        const keysMap: any = {
          openai: "",
          anthropic: "",
          google: "",
          xai: "",
          elevenlabs: "",
        };

        // Mark providers as configured (we can't show actual keys for security)
        data.providers.forEach((provider: any) => {
          if (
            provider.hasApiKey &&
            keysMap.hasOwnProperty(provider.provider_key)
          ) {
            // Use placeholder to indicate key is configured
            keysMap[provider.provider_key] = "••••••••••••••••";
          }
        });

        setApiKeys(keysMap);
      }
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          company_name: companyName,
          avatar_url: avatarUrl,
          company_logo_url: companyLogoUrl,
          bio: bio,
          website: website,
          timezone: timezone,
          language: language,
          twitter_handle: twitterHandle,
          linkedin_url: linkedinUrl,
          facebook_url: facebookUrl,
          instagram_handle: instagramHandle,
          tiktok_handle: tiktokHandle,
          reddit_handle: redditHandle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Error: " + (data.error || "Failed to update profile"));
      }
    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function testConnection(providerKey: string) {
    setTestingProvider(providerKey);

    try {
      // First, get the tool ID for this provider
      const listResponse = await fetch("/api/ai-tools/list");
      const listData = await listResponse.json();

      const tool = listData.providers?.find(
        (p: any) => p.provider_key === providerKey && p.hasApiKey,
      );

      if (!tool) {
        setTestResults((prev) => ({
          ...prev,
          [providerKey]: { success: false, message: "Save the API key first" },
        }));
        return;
      }

      // Test the connection
      const response = await fetch("/api/ai-tools/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If 404, the tool might not be saved yet - show helpful message
        if (response.status === 404) {
          setTestResults((prev) => ({
            ...prev,
            [providerKey]: {
              success: false,
              message: "Tool not found. Try refreshing the page.",
            },
          }));
        } else {
          setTestResults((prev) => ({
            ...prev,
            [providerKey]: data,
          }));
        }
      } else {
        setTestResults((prev) => ({
          ...prev,
          [providerKey]: data,
        }));
      }
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        [providerKey]: { success: false, message: error.message },
      }));
    } finally {
      setTestingProvider(null);
    }
  }

  function handleUpgrade(
    tier: "pro" | "premium",
    _billingCycle: "monthly" | "yearly" = "monthly",
  ) {
    // Open Coming Soon modal instead of Stripe checkout
    setSelectedTier(tier);
    setShowComingSoonModal(true);
  }

  async function handleApiKeyUpdate(provider: string, value: string) {
    if (!value.trim()) return;

    // Clear any previous test results for this provider
    setTestResults((prev) => ({
      ...prev,
      [provider]: undefined,
    }));

    try {
      // Get provider ID from list
      const listResponse = await fetch("/api/ai-tools/list");
      const listData = await listResponse.json();

      const providerData = listData.providers?.find(
        (p: any) => p.provider_key === provider,
      );

      if (!providerData) {
        setMessage(`Provider ${provider} not found`);
        return;
      }

      // Save the API key using new API
      const response = await fetch("/api/ai-tools/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: providerData.id,
          apiKey: value,
          configuration: {}, // Use defaults
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`${providerData.name} configured successfully!`);
        // Auto-test after delay to ensure database commit
        if (data.requiresTest) {
          setTimeout(() => testConnection(provider), 1500);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage("Error: " + error.message);
    }
  }

  if (initialLoading) return <SettingsSkeleton />;

  return (
    <>
      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        tier={selectedTier}
      />

      <div className="p-8 bg-tron-dark min-h-screen">
        <h1 className="text-3xl font-bold text-tron-text mb-8">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-tron-grid mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-2 font-semibold ${
                activeTab === "profile"
                  ? "border-b-2 border-tron-cyan text-tron-cyan"
                  : "text-tron-text-muted hover:text-tron-text"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`pb-4 px-2 font-semibold ${
                activeTab === "api-keys"
                  ? "border-b-2 border-tron-cyan text-tron-cyan"
                  : "text-tron-text-muted hover:text-tron-text"
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("membership")}
              className={`pb-4 px-2 font-semibold ${
                activeTab === "membership"
                  ? "border-b-2 border-tron-cyan text-tron-cyan"
                  : "text-tron-text-muted hover:text-tron-text"
              }`}
            >
              Membership
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-tron-grid border border-tron-cyan text-tron-cyan rounded-lg">
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8 max-w-4xl">
            <h2 className="text-xl font-bold text-tron-text mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-sm font-medium text-tron-text-muted mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    title="Email address (cannot be changed)"
                    className="w-full px-4 py-3 border border-tron-grid rounded-lg bg-tron-dark text-tron-text-muted"
                  />
                  <p className="text-sm text-tron-text-muted mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="profile-fullname"
                    className="block text-sm font-medium text-tron-text-muted mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    title="Your full name"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-company"
                    className="block text-sm font-medium text-tron-text-muted mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    id="profile-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    title="Your company name"
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    value={companyLogoUrl}
                    onChange={(e) => setCompanyLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.jpg"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-timezone"
                    className="block text-sm font-medium text-tron-text-muted mb-2"
                  >
                    Timezone
                  </label>
                  <select
                    id="profile-timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    title="Select your timezone"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  >
                    <option value="America/New_York">
                      Eastern Time (US & Canada)
                    </option>
                    <option value="America/Chicago">
                      Central Time (US & Canada)
                    </option>
                    <option value="America/Denver">
                      Mountain Time (US & Canada)
                    </option>
                    <option value="America/Los_Angeles">
                      Pacific Time (US & Canada)
                    </option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="profile-language"
                    className="block text-sm font-medium text-tron-text-muted mb-2"
                  >
                    Language
                  </label>
                  <select
                    id="profile-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    title="Select your preferred language"
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="it-IT">Italian</option>
                    <option value="pt-BR">Portuguese (Brazil)</option>
                    <option value="ja-JP">Japanese</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tron-text-muted mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself and your company..."
                  className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                />
                <p className="text-sm text-tron-text-muted mt-1">
                  Maximum 500 characters
                </p>
              </div>

              {/* Social Media Handles */}
              <div>
                <h3 className="text-lg font-semibold text-tron-text mb-4">
                  Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      Twitter Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-tron-grid bg-tron-dark text-tron-text-muted/80">
                        @
                      </span>
                      <input
                        type="text"
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value)}
                        placeholder="username"
                        className="w-full px-4 py-3 border border-tron-grid rounded-r-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      Instagram Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-tron-grid bg-tron-dark text-tron-text-muted/80">
                        @
                      </span>
                      <input
                        type="text"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        placeholder="username"
                        className="w-full px-4 py-3 border border-tron-grid rounded-r-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="facebook.com/username"
                      className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      TikTok Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-tron-grid bg-tron-dark text-tron-text-muted/80">
                        @
                      </span>
                      <input
                        type="text"
                        value={tiktokHandle}
                        onChange={(e) => setTiktokHandle(e.target.value)}
                        placeholder="username"
                        className="w-full px-4 py-3 border border-tron-grid rounded-r-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tron-text-muted mb-2">
                      Reddit Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-tron-grid bg-tron-dark text-tron-text-muted/80">
                        u/
                      </span>
                      <input
                        type="text"
                        value={redditHandle}
                        onChange={(e) => setRedditHandle(e.target.value)}
                        placeholder="username"
                        className="w-full px-4 py-3 border border-tron-grid rounded-r-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Saving Changes..."
              >
                Save Changes
              </LoadingButton>
            </form>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api-keys" && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8 max-w-4xl">
            <h2 className="text-xl font-bold text-tron-text mb-2">
              AI Tools & API Keys
            </h2>
            <p className="text-tron-text-muted mb-6">
              Configure your AI providers to unlock powerful content generation
              capabilities. Keys are encrypted and stored securely.
            </p>

            <div className="space-y-8">
              {/* OpenAI */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    OpenAI API Key (GPT-4, DALL-E)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, openai: e.target.value })
                    }
                    onBlur={(e) => handleApiKeyUpdate("openai", e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                {/* Test Connection Button */}
                {apiKeys.openai && (
                  <button
                    onClick={() => testConnection("openai")}
                    disabled={testingProvider === "openai"}
                    className="px-4 py-2 bg-tron-green hover:bg-tron-green/80 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingProvider === "openai"
                      ? "Testing..."
                      : "Test Connection"}
                  </button>
                )}

                {/* Test Results */}
                {testResults.openai && (
                  <div
                    className={`mt-2 p-3 rounded-lg ${testResults.openai.success ? "bg-tron-green/20 text-tron-green" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}
                  >
                    {testResults.openai.success ? "✅" : "❌"}{" "}
                    {testResults.openai.message}
                  </div>
                )}

                {/* Expandable Instructions */}
                <InstructionCard
                  provider="OpenAI"
                  url={PROVIDER_INSTRUCTIONS.openai.url}
                  steps={PROVIDER_INSTRUCTIONS.openai.steps}
                  timeEstimate={PROVIDER_INSTRUCTIONS.openai.timeEstimate}
                  costInfo={PROVIDER_INSTRUCTIONS.openai.costInfo}
                  keyFormat={PROVIDER_INSTRUCTIONS.openai.keyFormat}
                />
              </div>

              {/* Anthropic */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Anthropic API Key (Claude)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, anthropic: e.target.value })
                    }
                    onBlur={(e) =>
                      handleApiKeyUpdate("anthropic", e.target.value)
                    }
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                {apiKeys.anthropic && (
                  <button
                    onClick={() => testConnection("anthropic")}
                    disabled={testingProvider === "anthropic"}
                    className="px-4 py-2 bg-tron-green hover:bg-tron-green/80 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingProvider === "anthropic"
                      ? "Testing..."
                      : "Test Connection"}
                  </button>
                )}

                {testResults.anthropic && (
                  <div
                    className={`mt-2 p-3 rounded-lg ${testResults.anthropic.success ? "bg-tron-green/20 text-tron-green" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}
                  >
                    {testResults.anthropic.success ? "✅" : "❌"}{" "}
                    {testResults.anthropic.message}
                  </div>
                )}

                <InstructionCard
                  provider="Anthropic"
                  url={PROVIDER_INSTRUCTIONS.anthropic.url}
                  steps={PROVIDER_INSTRUCTIONS.anthropic.steps}
                  timeEstimate={PROVIDER_INSTRUCTIONS.anthropic.timeEstimate}
                  costInfo={PROVIDER_INSTRUCTIONS.anthropic.costInfo}
                  keyFormat={PROVIDER_INSTRUCTIONS.anthropic.keyFormat}
                />
              </div>

              {/* Google */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Google API Key (Gemini, Imagen)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.google}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, google: e.target.value })
                    }
                    onBlur={(e) => handleApiKeyUpdate("google", e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                {apiKeys.google && (
                  <button
                    onClick={() => testConnection("google")}
                    disabled={testingProvider === "google"}
                    className="px-4 py-2 bg-tron-green hover:bg-tron-green/80 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingProvider === "google"
                      ? "Testing..."
                      : "Test Connection"}
                  </button>
                )}

                {testResults.google && (
                  <div
                    className={`mt-2 p-3 rounded-lg ${testResults.google.success ? "bg-tron-green/20 text-tron-green" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}
                  >
                    {testResults.google.success ? "✅" : "❌"}{" "}
                    {testResults.google.message}
                  </div>
                )}

                <InstructionCard
                  provider="Google"
                  url={PROVIDER_INSTRUCTIONS.google.url}
                  steps={PROVIDER_INSTRUCTIONS.google.steps}
                  timeEstimate={PROVIDER_INSTRUCTIONS.google.timeEstimate}
                  costInfo={PROVIDER_INSTRUCTIONS.google.costInfo}
                  keyFormat={PROVIDER_INSTRUCTIONS.google.keyFormat}
                />
              </div>

              {/* ElevenLabs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    ElevenLabs API Key (Voice Generation)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.elevenlabs}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, elevenlabs: e.target.value })
                    }
                    onBlur={(e) =>
                      handleApiKeyUpdate("elevenlabs", e.target.value)
                    }
                    placeholder="..."
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                {apiKeys.elevenlabs && (
                  <button
                    onClick={() => testConnection("elevenlabs")}
                    disabled={testingProvider === "elevenlabs"}
                    className="px-4 py-2 bg-tron-green hover:bg-tron-green/80 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingProvider === "elevenlabs"
                      ? "Testing..."
                      : "Test Connection"}
                  </button>
                )}

                {testResults.elevenlabs && (
                  <div
                    className={`mt-2 p-3 rounded-lg ${testResults.elevenlabs.success ? "bg-tron-green/20 text-tron-green" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}
                  >
                    {testResults.elevenlabs.success ? "✅" : "❌"}{" "}
                    {testResults.elevenlabs.message}
                  </div>
                )}

                <InstructionCard
                  provider="ElevenLabs"
                  url={PROVIDER_INSTRUCTIONS.elevenlabs.url}
                  steps={PROVIDER_INSTRUCTIONS.elevenlabs.steps}
                  timeEstimate={PROVIDER_INSTRUCTIONS.elevenlabs.timeEstimate}
                  costInfo={PROVIDER_INSTRUCTIONS.elevenlabs.costInfo}
                  keyFormat={PROVIDER_INSTRUCTIONS.elevenlabs.keyFormat}
                />
              </div>

              {/* xAI */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    xAI API Key (Grok) - Beta
                  </label>
                  <input
                    type="password"
                    value={apiKeys.xai}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, xai: e.target.value })
                    }
                    onBlur={(e) => handleApiKeyUpdate("xai", e.target.value)}
                    placeholder="xai-..."
                    className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  />
                </div>

                {apiKeys.xai && (
                  <button
                    onClick={() => testConnection("xai")}
                    disabled={testingProvider === "xai"}
                    className="px-4 py-2 bg-tron-green hover:bg-tron-green/80 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingProvider === "xai"
                      ? "Testing..."
                      : "Test Connection"}
                  </button>
                )}

                {testResults.xai && (
                  <div
                    className={`mt-2 p-3 rounded-lg ${testResults.xai.success ? "bg-tron-green/20 text-tron-green" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}
                  >
                    {testResults.xai.success ? "✅" : "❌"}{" "}
                    {testResults.xai.message}
                  </div>
                )}

                <InstructionCard
                  provider="xAI"
                  url={PROVIDER_INSTRUCTIONS.xai.url}
                  steps={PROVIDER_INSTRUCTIONS.xai.steps}
                  timeEstimate={PROVIDER_INSTRUCTIONS.xai.timeEstimate}
                  costInfo={PROVIDER_INSTRUCTIONS.xai.costInfo}
                  keyFormat={PROVIDER_INSTRUCTIONS.xai.keyFormat}
                />
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-tron-dark to-tron-grid border border-tron-cyan/30 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-tron-cyan mb-2">
                      Local AI Already Available
                    </h3>
                    <p className="text-sm text-tron-cyan mb-3">
                      <strong>LM Studio</strong> is already configured and ready
                      to use! This gives you free, unlimited AI content
                      generation without needing external API keys.
                    </p>
                    <div className="space-y-1 text-sm text-tron-cyan">
                      <p>
                        • ✅ <strong>Free:</strong> No usage costs or API limits
                      </p>
                      <p>
                        • ✅ <strong>Private:</strong> Your data stays on your
                        device
                      </p>
                      <p>
                        • ✅ <strong>Fast:</strong> No network latency for
                        generation
                      </p>
                      <p>
                        • 💡 <strong>Tip:</strong> Add external APIs for access
                        to latest models like GPT-4 or Claude
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === "membership" && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8 max-w-4xl">
            <h2 className="text-xl font-bold text-tron-text mb-6">
              Membership & Usage
            </h2>

            {/* Current Plan Status */}
            <div className="bg-gradient-to-r from-tron-dark to-tron-grid rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-tron-cyan">
                    Current Plan
                  </div>
                  <div className="text-2xl font-bold text-tron-text">
                    {usageData?.currentTier === "free"
                      ? "Free Tier"
                      : usageData?.currentTier === "pro"
                        ? "Pro Plan"
                        : usageData?.currentTier === "premium"
                          ? "Premium Plan"
                          : "Free Tier"}
                  </div>
                </div>
                <div className="px-4 py-2 bg-tron-green/20 text-tron-green rounded-lg font-semibold">
                  Active
                </div>
              </div>
            </div>

            {/* Usage Meters */}
            {usageData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Campaigns Usage */}
                <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
                  <h3 className="font-semibold text-tron-text mb-4">
                    Campaigns
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used this month</span>
                      <span>
                        {usageData.campaignsUsed} / {usageData.campaignsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-tron-grid rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          usageData.campaignsPercentage >= 80
                            ? "bg-red-600 w-4/5"
                            : usageData.campaignsPercentage >= 50
                              ? "bg-yellow-600 w-1/2"
                              : "bg-tron-green w-1/4"
                        }`}
                      />
                    </div>
                    {usageData.campaignsPercentage >= 80 && (
                      <p className="text-sm text-red-600">
                        ⚠️ Approaching limit - consider upgrading
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Tools Usage */}
                <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
                  <h3 className="font-semibold text-tron-text mb-4">
                    AI Tools
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Configured</span>
                      <span>
                        {usageData.aiToolsUsed} / {usageData.aiToolsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-tron-grid rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          usageData.aiToolsPercentage >= 80
                            ? "bg-red-600 w-4/5"
                            : usageData.aiToolsPercentage >= 50
                              ? "bg-yellow-600 w-1/2"
                              : "bg-tron-green w-1/4"
                        }`}
                      />
                    </div>
                    {usageData.aiToolsPercentage >= 100 && (
                      <p className="text-sm text-red-600">
                        🔒 Limit reached - upgrade to add more tools
                      </p>
                    )}
                  </div>
                </div>

                {/* API Usage */}
                <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
                  <h3 className="font-semibold text-tron-text mb-4">
                    API Usage This Month
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Calls</span>
                      <span>{usageData.apiCallsThisMonth || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tokens Used</span>
                      <span>
                        {(usageData.tokensUsed || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Estimated Cost</span>
                      <span className="text-tron-green">
                        ${(usageData.estimatedCost || 0).toFixed(2)}
                      </span>
                    </div>
                    {usageData.estimatedCostSaved && (
                      <div className="flex justify-between text-sm">
                        <span>💰 Saved with LM Studio</span>
                        <span className="text-tron-cyan">
                          ${usageData.estimatedCostSaved.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
                  <h3 className="font-semibold text-tron-text mb-4">Storage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>
                        {usageData.storageUsedMB || 0} MB /{" "}
                        {usageData.storageLimitMB || 100} MB
                      </span>
                    </div>
                    <div className="w-full bg-tron-grid rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (usageData.storagePercentage || 0) >= 80
                            ? "bg-red-600 w-4/5"
                            : (usageData.storagePercentage || 0) >= 50
                              ? "bg-yellow-600 w-1/2"
                              : "bg-tron-green w-1/4"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-tron-text mb-4">
                Available Plans
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pro Plan */}
                <div className="border border-tron-cyan/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-tron-text">
                      Pro Plan
                    </h3>
                    <div className="text-2xl font-bold text-tron-text">
                      $29
                      <span className="text-sm font-normal text-tron-text-muted">
                        /mo
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-tron-text-muted mb-4 space-y-1">
                    <p>• ✅ Unlimited campaigns</p>
                    <p>• ✅ Up to 3 AI tools</p>
                    <p>• ✅ All social platforms</p>
                    <p>• ✅ 10GB storage</p>
                    <p>• ✅ Priority support</p>
                  </div>
                  <LoadingButton
                    onClick={() => handleUpgrade("pro", "monthly")}
                    loading={false}
                    loadingText=""
                    disabled={false}
                    className="w-full"
                  >
                    Join Waitlist
                  </LoadingButton>
                </div>

                {/* Premium Plan */}
                <div className="border border-tron-cyan/40 rounded-lg p-6 bg-gradient-to-br from-tron-cyan/10 to-tron-magenta/10 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-tron-text">
                      Premium Plan
                    </h3>
                    <div className="text-2xl font-bold text-tron-text">
                      $99
                      <span className="text-sm font-normal text-tron-text-muted">
                        /mo
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-tron-text-muted mb-4 space-y-1">
                    <p>• ✅ Everything in Pro</p>
                    <p>• ✅ Unlimited AI tools</p>
                    <p>• ✅ White-label options</p>
                    <p>• ✅ 100GB storage</p>
                    <p>• ✅ Custom integrations</p>
                    <p>• ✅ Dedicated support</p>
                  </div>
                  <LoadingButton
                    onClick={() => handleUpgrade("premium", "monthly")}
                    loading={false}
                    loadingText=""
                    disabled={false}
                    className="w-full bg-gradient-to-r from-tron-cyan to-tron-magenta hover:from-tron-cyan/80 hover:to-tron-magenta/80"
                  >
                    Join Waitlist
                  </LoadingButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
