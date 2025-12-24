"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocialAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Settings page with Connections tab
    router.replace("/settings?tab=connections");
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-tron-text-muted">Redirecting to Settings...</p>
      </div>
    </div>
  );
}
