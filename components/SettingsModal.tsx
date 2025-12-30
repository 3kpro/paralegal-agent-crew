"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "account" | "billing" | "preferences" | "resources";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // User data
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [subscription, setSubscription] = useState<"free" | "pro" | "premium">("free");

  // Preferences
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState("en-US");
  const [tone, setTone] = useState<"professional" | "casual" | "educational" | "promotional" | "humor">("professional");
  const [targetAudience, setTargetAudience] = useState<"general" | "entrepreneur" | "professional" | "gamer" | "hobbyist">("general");
  const [callToAction, setCallToAction] = useState<"visit" | "learn" | "sign-up" | "follow">("visit");

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  async function loadUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email || "");

    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.success && data.profile) {
        setFullName(data.profile.full_name || "");
        setLanguage(data.profile.language || "en-US");
        setTheme(data.profile.theme || "light");
        // Extract from preferences JSONB column
        const prefs = data.profile.preferences || {};
        setTone(prefs.tone || "professional");
        setTargetAudience(prefs.target_audience || "general");
        setCallToAction(prefs.call_to_action || "visit");
      }

      // Load usage data for subscription tier
      const usageResponse = await fetch("/api/usage");
      const usageData = await usageResponse.json();

      if (usageData.success) {
        setSubscription(usageData.tier || "free");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      // Call delete account API
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await supabase.auth.signOut();
        router.push("/");
      } else {
        setMessage("Error deleting account: " + (data.error || "Unknown error"));
      }
    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrganization() {
    setMessage("Organization creation coming soon! This feature will allow you to collaborate with your team.");
  }

  async function handleUpdatePreferences() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          theme: theme,
          tone: tone,
          target_audience: targetAudience,
          call_to_action: callToAction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Preferences updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: " + (data.error || "Failed to update preferences"));
      }
    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-gray-600" weight="duotone" />
          </button>

          {/* User info */}
          <div className="mt-12 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
              {fullName ? fullName.charAt(0).toUpperCase() : "J"}
            </div>
            <div className="font-semibold text-gray-900">{fullName || "J Lawson"}</div>
          </div>

          {/* Invite team members */}
          <button
            onClick={handleCreateOrganization}
            className="w-full flex items-center justify-between p-3 mb-6 hover:bg-white rounded-lg transition-colors group border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Invite team members</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "account"
                  ? "bg-white text-gray-900 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">Account</span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "billing"
                  ? "bg-white text-gray-900 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm">Billing</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "preferences"
                  ? "bg-white text-gray-900 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "resources"
                  ? "bg-white text-gray-900 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm">Resources</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
                {message}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account</h2>

                {/* Account Information */}
                <section className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Account Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Email</div>
                        <div className="text-sm text-gray-900">{email}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Subscription</div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription === "premium"
                              ? "bg-purple-100 text-purple-800"
                              : subscription === "pro"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {subscription === "premium" ? "Premium" : subscription === "pro" ? "Pro" : "Free"}
                          </span>
                        </div>
                      </div>
                      <div>
                        {subscription === "premium" ? (
                          <a
                            href="/api/stripe/portal"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            Manage Subscription
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <a
                            href="/pricing"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            {subscription === "pro" ? "Upgrade to Premium" : "Upgrade"}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Organization */}
                <section className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Organization
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Create Organization</div>
                        <div className="text-sm text-gray-600">Start collaborating with your team</div>
                      </div>
                      <button
                        onClick={handleCreateOrganization}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        Create
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Account Actions */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Account Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Sign Out</div>
                          <div className="text-sm text-gray-600">Sign out of your account</div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          Sign Out
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-red-900 mb-1">Delete Account</div>
                          <div className="text-sm text-red-700">Permanently delete your account and data</div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          Delete
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing</h2>
                
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage your subscription, payment methods, and billing history.
                  </p>
                  <p className="text-xs text-gray-500">
                    Coming soon - This feature is currently under development
                  </p>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

                <section className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    General Preferences
                  </h3>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="relative">
                        <select
                          id="theme-select"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                          className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-gray-900 appearance-none pr-10"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <div className="relative">
                        <select
                          id="language-select"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-gray-900 appearance-none pr-10"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                          <option value="de-DE">German</option>
                          <option value="ja-JP">Japanese</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Content Generation Preferences */}
                <section className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Content Generation Preferences
                  </h3>

                  <div className="space-y-6">
                    {/* Target Audience */}
                    <div>
                      <label htmlFor="target-audience-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <div className="relative">
                        <select
                          id="target-audience-select"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value as typeof targetAudience)}
                          className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-gray-900 appearance-none pr-10"
                        >
                          <option value="general">General</option>
                          <option value="entrepreneur">Entrepreneur</option>
                          <option value="professional">Professional</option>
                          <option value="gamer">Gamer</option>
                          <option value="hobbyist">Hobbyist</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div>
                      <label htmlFor="call-to-action-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Call to Action
                      </label>
                      <div className="relative">
                        <select
                          id="call-to-action-select"
                          value={callToAction}
                          onChange={(e) => setCallToAction(e.target.value as typeof callToAction)}
                          className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-gray-900 appearance-none pr-10"
                        >
                          <option value="visit">Visit</option>
                          <option value="learn">Learn More</option>
                          <option value="sign-up">Sign Up</option>
                          <option value="follow">Follow</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Tone */}
                    <div>
                      <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Tone
                      </label>
                      <div className="relative">
                        <select
                          id="tone-select"
                          value={tone}
                          onChange={(e) => setTone(e.target.value as typeof tone)}
                          className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent text-gray-900 appearance-none pr-10"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="educational">Educational</option>
                          <option value="promotional">Promotional</option>
                          <option value="humor">Humor</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Mobile App and Save Button */}
                <section>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Mobile App</div>
                          <div className="text-sm text-gray-600">Access Galaxy.ai on your mobile device</div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                          Download
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePreferences}
                    disabled={loading}
                    className="mt-6 px-6 py-2.5 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </section>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Resources</h2>
                
                <div className="grid gap-4">
                  <a
                    href="https://docs.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Documentation</div>
                        <div className="text-xs text-gray-600">Learn how to use all features</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <a
                    href="https://support.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Support Center</div>
                        <div className="text-xs text-gray-600">Get help from our team</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <a
                    href="https://status.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">System Status</div>
                        <div className="text-xs text-gray-600">Check service availability</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <a
                    href="https://api.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">API Reference</div>
                        <div className="text-xs text-gray-600">Integrate with our API</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
