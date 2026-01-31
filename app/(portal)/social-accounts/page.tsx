"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function SocialAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Settings page with Connections tab
    router.replace("/settings?tab=connections");
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <OrbitalLoader className="w-10 h-10 text-tron-cyan" />
        <p className="text-tron-text-muted">Redirecting to Settings...</p>
      </div>
    </div>
  );
}
