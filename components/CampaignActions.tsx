"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PencilSimple as Pencil, Trash as Trash2, Archive, ArrowCounterClockwise as ArchiveRestore } from "@phosphor-icons/react";

interface CampaignActionsProps {
  campaignId: string;
  campaignName: string;
  archived?: boolean;
}

export function CampaignActions({
  campaignId,
  campaignName,
  archived = false,
}: CampaignActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const supabase = createClient();

  const handleEdit = () => {
    router.push(`/campaigns/${campaignId}/edit`);
  };

  const handleArchiveToggle = async () => {
    const action = archived ? "restore" : "archive";
    const confirmMessage = archived
      ? `Restore "${campaignName}" to active campaigns?`
      : `Archive "${campaignName}"? You can restore it later from archived campaigns.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsArchiving(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update campaign");
      }

      // Refresh the page to show updated campaign list
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${action}ing campaign:`, error);
      alert(`Failed to ${action} campaign: ${error.message}`);
    } finally {
      setIsArchiving(false);
    }
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
      {!archived && (
        <button
          onClick={handleEdit}
          className="p-2 text-tron-cyan hover:bg-tron-cyan/10 rounded-lg transition-colors"
          title="Edit campaign"
        >
          <Pencil className="w-4 h-4" weight="duotone" />
        </button>
      )}
      <button
        onClick={handleArchiveToggle}
        disabled={isArchiving}
        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={archived ? "Restore campaign" : "Archive campaign"}
      >
        {archived ? (
          <ArchiveRestore className="w-4 h-4" weight="duotone" />
        ) : (
          <Archive className="w-4 h-4" weight="duotone" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-tron-magenta hover:bg-tron-magenta/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete campaign"
      >
        <Trash2 className="w-4 h-4" weight="duotone" />
      </button>
    </div>
  );
}
