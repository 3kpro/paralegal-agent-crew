"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CampaignActions } from "@/components/CampaignActions";

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  target_platforms?: string[];
}

interface CampaignsClientProps {
  campaigns: Campaign[];
}

export default function CampaignsClient({ campaigns }: CampaignsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(
    new Set(),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

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

  const toggleSelectAll = () => {
    if (selectedCampaigns.size === campaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(campaigns.map((c) => c.id)));
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
    campaigns.length > 0 && selectedCampaigns.size === campaigns.length;
  const someSelected = selectedCampaigns.size > 0 && !allSelected;

  return (
    <div className="p-8 bg-tron-dark min-h-screen">
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
                  ? "bg-green-500/20 border-green-500/50 text-green-100"
                  : "bg-red-500/20 border-red-500/50 text-red-100"
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
          <h1 className="text-3xl font-bold text-tron-text">My Campaigns</h1>
          {selectedCampaigns.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting
                ? "Deleting..."
                : `Delete ${selectedCampaigns.size} ${selectedCampaigns.size === 1 ? "Campaign" : "Campaigns"}`}
            </motion.button>
          )}
        </div>
        <Link
          href="/campaigns/new"
          className="px-8 py-4 bg-tron-cyan text-tron-dark font-bold rounded-xl hover:bg-tron-cyan/90 transition-colors flex items-center gap-3 text-lg"
        >
          <Plus className="w-6 h-6" />
          New Campaign
        </Link>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="bg-tron-grid rounded-xl border border-tron-cyan/30">
          <table className="w-full">
            <thead className="border-b border-tron-cyan/30">
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
                      className="w-5 h-5 rounded border-2 border-tron-cyan bg-tron-dark text-tron-cyan focus:ring-2 focus:ring-tron-cyan focus:ring-offset-0 cursor-pointer"
                      title={
                        allSelected ? "Deselect all" : "Select all campaigns"
                      }
                    />
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-tron-text">
                  Campaign
                </th>
                <th className="text-left p-4 font-semibold text-tron-text">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-tron-text">
                  Created
                </th>
                <th className="text-right p-4 font-semibold text-tron-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`border-b border-tron-grid last:border-0 transition-colors ${
                    selectedCampaigns.has(campaign.id)
                      ? "bg-tron-cyan/10"
                      : "hover:bg-tron-cyan/5"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={() => toggleSelectCampaign(campaign.id)}
                      className="w-5 h-5 rounded border-2 border-tron-cyan bg-tron-dark text-tron-cyan focus:ring-2 focus:ring-tron-cyan focus:ring-offset-0 cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-tron-text">
                      {campaign.name}
                    </div>
                    <div className="text-sm text-tron-text-muted">
                      {campaign.target_platforms?.join(", ")}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-tron-cyan/20 text-tron-text-muted rounded-full text-sm">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-tron-text-muted">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-tron-cyan hover:text-tron-cyan/80 font-medium"
                      >
                        View
                      </Link>
                      <CampaignActions
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-tron-grid rounded-xl p-12 text-center border border-tron-cyan/30">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-tron-text mb-2">
            No campaigns yet
          </h3>
          <p className="text-tron-text-muted mb-6">
            Create your first campaign to get started
          </p>
          <Link
            href="/campaigns/new"
            className="inline-block px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors"
          >
            Create First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
