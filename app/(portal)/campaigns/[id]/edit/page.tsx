"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new campaign page with edit mode
    router.push(`/campaigns/new?edit=${params.id}`);
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-tron-dark flex items-center justify-center">
      <div className="text-tron-text-muted">Loading campaign editor...</div>
    </div>
  );
}
