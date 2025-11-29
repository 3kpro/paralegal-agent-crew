"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    // Redirect to new campaign page with edit mode
    router.push(`/campaigns/new?edit=${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-tron-dark flex items-center justify-center">
      <div className="text-tron-text-muted">Loading campaign editor...</div>
    </div>
  );
}
