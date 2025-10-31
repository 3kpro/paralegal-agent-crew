"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2 } from "lucide-react";

interface CampaignActionsProps {
  campaignId: string;
  campaignName: string;
}

export function CampaignActions({
  campaignId,
  campaignName,
}: CampaignActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  const handleEdit = () => {
    router.push(`/campaigns/${campaignId}/edit`);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      // Refresh the page to show updated campaign list
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      alert(`Failed to delete campaign: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={handleEdit}
        className="p-2 text-tron-cyan hover:bg-tron-cyan/10 rounded-lg transition-colors"
        title="Edit campaign"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-tron-magenta hover:bg-tron-magenta/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete campaign"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
