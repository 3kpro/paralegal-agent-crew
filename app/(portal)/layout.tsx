"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";
import { FloatingNav } from "@/components/ui/floating-nav";
import SettingsModal from "@/components/SettingsModal";
import { Settings, Sparkles, ChevronDown } from "lucide-react";

interface Profile {
  email?: string;
  full_name?: string;
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
    // Clean up remember me preferences and session storage
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("tempSession");

    // Sign out via API
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signout";
    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#2b2b2b] flex">
        {/* New Floating Navigation */}
        <FloatingNav />
        
        {/* Old Sidebar - Hidden */}
        <aside className="w-64 bg-[#343a40] text-white fixed h-full border-r border-gray-700/50 hidden">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-coral-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">3K</span>
              </div>
              <span className="font-bold text-lg">Content Cascade</span>
            </Link>
          </div>

          <nav className="mt-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/campaigns"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">⚡</span>
              <span>Campaigns</span>
            </Link>
            <Link
              href="/campaigns/new"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">🎨</span>
              <span>Create</span>
            </Link>
            <Link
              href="/contentflow"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">📅</span>
              <span>ContentFlow</span>
            </Link>
            <Link
              href="/ai-studio"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">🧠</span>
              <span>AI Studio</span>
            </Link>
            <Link
              href="/social-accounts"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">🔗</span>
              <span>Social Accounts</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">📈</span>
              <span>Analytics</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 hover:border-l-4 hover:border-coral-500 transition-all"
            >
              <span className="text-xl">🔧</span>
              <span>Settings</span>
            </Link>
          </nav>

          <div className="absolute bottom-0 w-64 border-t border-gray-700/50">
            <Link
              href="/help"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-xl">💡</span>
              <span>Help</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-6 py-3 hover:bg-red-500/20 transition-colors w-full text-left"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <header className="bg-[#343a40] border-b border-gray-700/50 px-4 md:px-8 py-3 md:pl-32">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Content Cascade AI
              </h2>
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* What's New Button */}
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                  <Sparkles className="w-4 h-4" />
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
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
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
                        <Settings className="w-4 h-4" />
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

          {/* Page Content */}
          <main className="min-h-[calc(100vh-73px)] pb-16 md:pb-0 md:pl-32">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#343a40] border-t border-gray-700/50 px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            <Link
              href="/dashboard"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-lg">📊</span>
              <span className="text-xs text-white mt-1">Dashboard</span>
            </Link>
            <Link
              href="/campaigns"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-lg">⚡</span>
              <span className="text-xs text-white mt-1">Campaigns</span>
            </Link>
            <Link
              href="/campaigns/new"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-lg">🎨</span>
              <span className="text-xs text-white mt-1">Create</span>
            </Link>
            <Link
              href="/ai-studio"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-lg">🧠</span>
              <span className="text-xs text-white mt-1">AI Studio</span>
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-coral-500/20 transition-colors"
            >
              <span className="text-lg">🔧</span>
              <span className="text-xs text-white mt-1">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
