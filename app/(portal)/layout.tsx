"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import HelixWidget from "@/components/helix/HelixWidget";
import { BGPattern } from "@/components/ui/bg-pattern";
import { HelixProvider } from "@/context/HelixContext";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { WhatsNewModal } from "@/components/portal/WhatsNewModal";

// Constants
const THEME = {
  bg: "bg-background dark",
};

const DEFAULT_USER_NAME = "User";

interface Profile {
  email?: string;
  full_name?: string;
  subscription_tier?: string;
}

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { error: toastError } = useToast();
  
  // Memoize supabase client to avoid dependency issues
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Non-blocking error, user can still use basic features, 
      // but maybe show a subtle toast or just log it
      toastError("Could not load user profile details");
    }
  }, [supabase, toastError]);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) router.push("/login");
          return;
        }

        if (mounted) await fetchUserProfile(user.id);
      } catch (err) {
         console.error("Auth check failed:", err);
         if (mounted) router.push("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router, supabase, fetchUserProfile]);

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

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      toastError("Logout encountered an issue, redirecting...");
      // Force redirect even if API call fails
      setTimeout(() => {
         window.location.href = "/login";
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${THEME.bg} flex items-center justify-center relative overflow-hidden`}>
        <BGPattern variant="grid" mask="fade-center" size={24} fill="rgba(255,255,255,0.05)" className="z-0" style={{ zIndex: 0 }} />
        <div className="text-foreground z-10 relative flex flex-col items-center gap-3">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             <span className="text-sm text-muted-foreground">Loading XELORA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${THEME.bg} flex relative overflow-hidden`}>
      <BGPattern
        variant="grid"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.05)"
        className="z-0 fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Desktop Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col min-w-0 overflow-hidden">
        <PortalHeader
           user={profile}
           showUserMenu={showUserMenu}
           onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
           onLogout={handleLogout}
           onSettingsOpen={() => setIsSettingsOpen(true)}
           onWhatsNewOpen={() => setShowWhatsNew(true)}
        />

        {/* Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <WhatsNewModal
          isOpen={showWhatsNew}
          onClose={() => setShowWhatsNew(false)}
        />

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0 relative overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onLogout={handleLogout} />

      {/* Helix AI Global Widget */}
      <HelixWidget subscriptionTier={profile?.subscription_tier || 'free'} />
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <HelixProvider>
        <ErrorBoundary>
           <PortalLayoutContent>{children}</PortalLayoutContent>
        </ErrorBoundary>
      </HelixProvider>
    </ToastProvider>
  );
}
