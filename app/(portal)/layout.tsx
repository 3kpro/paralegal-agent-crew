"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import { Gear as Settings, Bell, CaretDown as ChevronDown } from "@phosphor-icons/react";
import HelixWidget from "@/components/helix/HelixWidget";
import { XeloraLogo } from "@/components/XeloraLogo";
import { BGPattern } from "@/components/ui/bg-pattern";

import { HelixProvider } from "@/context/HelixContext";
import { ToastProvider } from "@/components/ui/toast";

interface Profile {
  email?: string;
  full_name?: string;
  subscription_tier?: string;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }

    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      // Clean up remember me preferences and session storage
      localStorage.removeItem("rememberMe");
      sessionStorage.removeItem("tempSession");

      // Sign out via API
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API call fails
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        <BGPattern variant="dots" mask="fade-center" size={24} fill="rgba(255,255,255,0.15)" className="z-0" style={{ zIndex: 0 }} />
        <div className="text-white z-10 relative">Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <HelixProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-[#0a0a0a] flex relative">
          <BGPattern 
              variant="dots" 
              mask="fade-center" 
              size={24} 
              fill="rgba(255,255,255,0.15)" 
              className="z-0 fixed inset-0 pointer-events-none" 
              style={{ zIndex: 0 }}
          />
          {/* Desktop Sidebar */}
          <Sidebar onLogout={handleLogout} />

          {/* Main Content */}
          <div className="flex-1 relative z-10">
            {/* Top Bar */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 px-4 md:px-8 py-3 relative z-20">
              <div className="flex items-center justify-between">
                 {/* Logo - only show on mobile since desktop has sidebar */}
                 <div className="flex items-center gap-3 md:hidden">
                   <span className="text-lg font-bold text-white uppercase tracking-wide">
                     XELORA
                   </span>
                   <XeloraLogo className="w-8 h-8" />
                 </div>
                 {/* Spacer for desktop to push right items */}
                 <div className="hidden md:block" />
                <div className="flex items-center space-x-2 md:space-x-3">
                  {/* What's New Button */}
                  <button
                    onClick={() => setShowWhatsNew(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Bell className="w-4 h-4" weight="duotone" />
                    <span className="hidden md:inline">What's New</span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 hover:bg-gray-700/50 rounded-lg px-2 py-1 transition-colors"
                    >
                      <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {profile?.full_name?.charAt(0) || "J"}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-white">
                          {profile?.full_name || "J Lawson"}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" weight="duotone" />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {profile?.full_name || "J Lawson"}
                          </div>
                          <div className="text-xs text-gray-500">{profile?.email}</div>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsSettingsOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Account Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsSettingsOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" weight="duotone" />
                          Settings
                        </button>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Invite team members
                        </button>
                        <a
                          href="/support"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Help & Support
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Settings Modal */}
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />

            {/* What's New Modal */}
            {showWhatsNew && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#343a40] border-2 border-coral-500/50 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-coral-500/20 to-purple-500/20 border-b border-coral-500/30 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-coral-400" weight="duotone" />
                        <h2 className="text-2xl font-bold text-white">What's New</h2>
                        <span className="text-xs px-2 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300">
                          November 5, 2025
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWhatsNew(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close What's New modal"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="overflow-y-auto p-6 space-y-6">
                    {/* Signal Tracking Feature */}
                    <div className="bg-[#2b2b2b] border border-gray-700/50 rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">📡</span>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Real-Time Signal Tracking</h3>
                          <p className="text-gray-300 text-sm mb-3">
                            XELORA monitors emerging signals across 6+ platforms to identify trends before they peak. Predictive momentum detection in real-time.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Multi-platform signal analysis</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Emerging trend identification</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Momentum prediction algorithms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Viral Content Optimization */}
                    <div className="bg-[#2b2b2b] border border-gray-700/50 rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Virality Engineering</h3>
                          <p className="text-gray-300 text-sm mb-3">
                            Optimize content for maximum engagement. XELORA analyzes what makes content viral and helps you engineer your next breakthrough moment.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Viral score prediction</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Content optimization suggestions</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">✓</span>
                              <span className="text-sm text-gray-300">Timing intelligence for maximum reach</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Platform Publishing */}
                    <div className="bg-[#2b2b2b] border border-gray-700/50 rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">6+ Platform Integration</h3>
                          <p className="text-gray-300 text-sm">
                            Publish your optimized content across Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit from a single dashboard.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Beta Status */}
                    <div className="bg-[#2b2b2b] border border-gray-700/50 rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Now in Beta</h3>
                          <p className="text-gray-300 text-sm mb-3">
                            XELORA is actively being enhanced with advanced features and signal analysis improvements. Your feedback shapes the future.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="border-t border-gray-700/50 p-4 bg-[#2b2b2b]">
                    <button
                      type="button"
                      onClick={() => setShowWhatsNew(false)}
                      className="w-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <main className="min-h-[calc(100vh-73px)] pb-20 md:pb-0">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav onLogout={handleLogout} />
          
          {/* Helix AI Global Widget */}
          <HelixWidget subscriptionTier={profile?.subscription_tier || 'free'} />
        </div>
        </ErrorBoundary>
      </HelixProvider>
    </ToastProvider>
  );
}
