"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Plus, Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CampaignActions } from "@/components/CampaignActions";

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  target_platforms?: string[];
  archived?: boolean;
}

interface CampaignsClientProps {
  campaigns: Campaign[];
}

export default function CampaignsClient({ campaigns }: CampaignsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(
    new Set(),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Filter campaigns based on archived toggle
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) =>
      showArchived ? c.archived === true : c.archived !== true
    );
  }, [campaigns, showArchived]);

  const archivedCount = campaigns.filter((c) => c.archived === true).length;

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  // Check for success message from campaign save/publish
  useEffect(() => {
    const action = searchParams.get("action");
    const name = searchParams.get("name");

    if (action && name) {
      const message =
        action === "published"
          ? `"${decodeURIComponent(name)}" published successfully!`
          : `"${decodeURIComponent(name)}" saved as draft!`;

      showToast(message, "success");

      // Clean up URL
      router.replace("/campaigns");
    }
  }, [searchParams, router]);

  const toggleSelectAll = () => {
    if (selectedCampaigns.size === filteredCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filteredCampaigns.map((c) => c.id)));
    }
  };

  const toggleSelectCampaign = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedCampaigns.size === 0) return;

    const count = selectedCampaigns.size;
    const campaignWord = count === 1 ? "campaign" : "campaigns";

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .in("id", Array.from(selectedCampaigns));

      if (error) throw error;

      showToast(`Successfully deleted ${count} ${campaignWord}!`, "success");
      setSelectedCampaigns(new Set());

      // Refresh the page after a brief delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      showToast(`Failed to delete campaigns: ${error.message}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected =
    filteredCampaigns.length > 0 && selectedCampaigns.size === filteredCampaigns.length;
  const someSelected = selectedCampaigns.size > 0 && !allSelected;

  return (
    <div className="p-8 bg-transparent min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 flex items-center gap-3 ${
                toast.type === "success"
                  ? "bg-green-900/20 border-green-500/50 text-green-100"
                  : "bg-red-900/20 border-red-500/50 text-red-100"
              }`}
            >
              {toast.type === "success" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <span className="text-red-400 text-xl">⚠️</span>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">
            {showArchived ? "Archived Campaigns" : "My Campaigns"}
          </h1>
          {selectedCampaigns.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border-2 border-red-500 text-red-400 hover:bg-red-900/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting
                ? "Deleting..."
                : `Delete ${selectedCampaigns.size} ${selectedCampaigns.size === 1 ? "Campaign" : "Campaigns"}`}
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {archivedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-900/30 font-semibold rounded-lg transition-colors"
            >
              <Archive className="w-4 h-4" />
              {showArchived ? "Show Active" : `Show Archived (${archivedCount})`}
            </button>
          )}
          <Link
            href="/campaigns/create"
            className="px-8 py-4 bg-coral-500 text-white font-bold rounded-xl hover:bg-coral-600 transition-colors flex items-center gap-3 text-lg shadow-xl border-2 border-transparent hover:border-coral-400/50"
          >
            <Plus className="w-6 h-6" />
            New Campaign
          </Link>
        </div>
      </div>

      {filteredCampaigns && filteredCampaigns.length > 0 ? (
        <div className="bg-[#343a40] rounded-xl border-2 border-gray-700/50">
          <table className="w-full">
            <thead className="border-b border-gray-700/50">
              <tr>
                <th className="p-4 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-2 border-coral-500 bg-[#2b2b2b] text-coral-500 focus:ring-2 focus:ring-coral-500 focus:ring-offset-0 cursor-pointer"
                      title={
                        allSelected ? "Deselect all" : "Select all campaigns"
                      }
                    />
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-white">
                  Campaign
                </th>
                <th className="text-left p-4 font-semibold text-white">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-white">
                  Created
                </th>
                <th className="text-right p-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`border-b border-gray-700/50 last:border-0 transition-colors ${
                    selectedCampaigns.has(campaign.id)
                      ? "bg-coral-500/10"
                      : "hover:bg-coral-500/5"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={() => toggleSelectCampaign(campaign.id)}
                      className="w-5 h-5 rounded border-2 border-coral-500 bg-[#2b2b2b] text-coral-500 focus:ring-2 focus:ring-coral-500 focus:ring-offset-0 cursor-pointer"
                      aria-label={`Select ${campaign.name}`}
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">
                      {campaign.name}
                    </div>
                    <div className="text-sm text-gray-300">
                      {campaign.target_platforms?.join(", ")}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-coral-500/20 border border-coral-500/30 text-coral-400 rounded-full text-sm">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-coral-500 hover:text-coral-400 font-medium"
                      >
                        View
                      </Link>
                      <CampaignActions
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                        archived={campaign.archived}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#343a40] rounded-xl p-12 text-center border-2 border-gray-700/50">
          <div className="text-6xl mb-4">{showArchived ? "📦" : "📝"}</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {showArchived ? "No archived campaigns" : "No campaigns yet"}
          </h3>
          <p className="text-gray-300 mb-6">
            {showArchived
              ? "Archived campaigns will appear here"
              : "Create your first campaign to get started"}
          </p>
          {!showArchived && (
            <Link
              href="/campaigns/create"
              className="inline-block px-6 py-3 bg-coral-500 text-white hover:bg-coral-600 font-semibold rounded-lg transition-colors shadow-xl border-2 border-transparent hover:border-coral-400/50"
            >
              Create First Campaign
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
