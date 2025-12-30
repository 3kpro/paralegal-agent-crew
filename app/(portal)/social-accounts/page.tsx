"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BouncingDots } from "@/components/ui/bouncing-dots";

export default function SocialAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Settings page with Connections tab
    router.replace("/settings?tab=connections");
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <BouncingDots className="bg-tron-cyan" />
        <p className="text-tron-text-muted">Redirecting to Settings...</p>
      </div>
    </div>
  );
}
