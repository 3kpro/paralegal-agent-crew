"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash as Trash2, Plus, Archive, MagnifyingGlass, Funnel, XCircle, TwitterLogo, FacebookLogo, LinkedinLogo, InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { CampaignActions } from "@/components/CampaignActions";

// Platform icon mapping
const platformIcons: Record<string, React.ElementType> = {
  twitter: TwitterLogo,
  x: TwitterLogo,
  facebook: FacebookLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  tiktok: TiktokLogo,
  youtube: YoutubeLogo,
};

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
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Filter campaigns based on archived toggle, search, and filters
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter((c) =>
      showArchived ? c.archived === true : c.archived !== true
    );

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter((c) =>
        c.target_platforms?.includes(platformFilter)
      );
    }

    return filtered;
  }, [campaigns, showArchived, searchQuery, statusFilter, platformFilter]);

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

  const handleBulkArchive = async () => {
    if (selectedCampaigns.size === 0) return;

    const count = selectedCampaigns.size;
    const campaignWord = count === 1 ? "campaign" : "campaigns";
    const action = showArchived ? "unarchived" : "archived";

    setIsArchiving(true);

    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ archived: !showArchived })
        .in("id", Array.from(selectedCampaigns));

      if (error) throw error;

      showToast(`Successfully ${action} ${count} ${campaignWord}!`, "success");
      setSelectedCampaigns(new Set());

      // Refresh the page after a brief delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      showToast(`Failed to ${showArchived ? "restore" : "archive"} campaigns: ${error.message}`, "error");
    } finally {
      setIsArchiving(false);
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
                <Check className="w-5 h-5 text-green-400" weight="duotone" />
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
              disabled={isDeleting || isArchiving}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border-2 border-red-500 text-red-400 hover:bg-red-900/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" weight="duotone" />
              {isDeleting
                ? "Deleting..."
                : `Delete ${selectedCampaigns.size} ${selectedCampaigns.size === 1 ? "Campaign" : "Campaigns"}`}
            </motion.button>
          )}

          {selectedCampaigns.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleBulkArchive}
              disabled={isDeleting || isArchiving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-900/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="w-4 h-4" weight="duotone" />
              {isArchiving
                ? (showArchived ? "Restoring..." : "Archiving...")
                : `${showArchived ? "Restore" : "Archive"} ${selectedCampaigns.size} ${selectedCampaigns.size === 1 ? "Campaign" : "Campaigns"}`}
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
              <Archive className="w-4 h-4" weight="duotone" />
              {showArchived ? "Show Active" : `Show Archived (${archivedCount})`}
            </button>
          )}
          <Link
            href="/campaigns/create"
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-3 text-lg shadow-lg border-2 border-transparent hover:border-indigo-400/50"
          >
            <Plus className="w-6 h-6" weight="duotone" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            weight="duotone"
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-800 border-2 border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" weight="fill" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[180px]">
          <Funnel
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            weight="duotone"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700/50 rounded-lg text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Platform Filter */}
        <div className="relative min-w-[180px]">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700/50 rounded-lg text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter/X</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || statusFilter !== "all" || platformFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPlatformFilter("all");
            }}
            className="px-4 py-3 bg-red-900/20 border-2 border-red-500/50 text-red-400 hover:bg-red-900/30 font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredCampaigns && filteredCampaigns.length > 0 ? (
        <>
          {/* Select All Bar */}
          {selectedCampaigns.size === 0 && (
            <div className="mb-4 flex items-center gap-3 p-4 bg-slate-800/50 border border-gray-700/30 rounded-xl">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded border-2 border-indigo-500 bg-slate-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                title={allSelected ? "Deselect all" : "Select all campaigns"}
              />
              <span className="text-sm text-gray-400">
                Select all campaigns
              </span>
            </div>
          )}

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col min-h-[280px] ${
                  selectedCampaigns.has(campaign.id)
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "border-slate-700/50 hover:border-indigo-500/50 hover:shadow-lg"
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-5 left-5 z-10">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.has(campaign.id)}
                    onChange={() => toggleSelectCampaign(campaign.id)}
                    className="w-5 h-5 rounded border-2 border-indigo-500 bg-slate-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    aria-label={`Select ${campaign.name}`}
                  />
                </div>

                {/* Card Content */}
                <div className="flex-1 p-8 pt-12 flex flex-col">
                  {/* Campaign Name */}
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="block mb-4 group-hover:text-indigo-400 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-white line-clamp-2 leading-snug">
                      {campaign.name}
                    </h3>
                  </Link>

                  {/* Status & Date Row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      campaign.status === 'published'
                        ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                        : campaign.status === 'scheduled'
                        ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                        : 'bg-slate-600/20 border border-slate-500/30 text-slate-400'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(campaign.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Platforms - Icon Only */}
                  <div className="flex items-center gap-3 mb-6">
                    {campaign.target_platforms?.slice(0, 4).map((platform) => {
                      const Icon = platformIcons[platform.toLowerCase()];
                      return Icon ? (
                        <div
                          key={platform}
                          className="w-9 h-9 rounded-lg bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center transition-colors group/icon"
                          title={platform}
                        >
                          <Icon className="w-5 h-5 text-indigo-400 group-hover/icon:scale-110 transition-transform" weight="duotone" />
                        </div>
                      ) : null;
                    })}
                    {campaign.target_platforms && campaign.target_platforms.length > 4 && (
                      <div className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center text-xs text-gray-400 font-semibold">
                        +{campaign.target_platforms.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-3">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-semibold text-sm transition-all text-center shadow-lg shadow-indigo-500/20"
                    >
                      View Campaign
                    </Link>
                    <CampaignActions
                      campaignId={campaign.id}
                      campaignName={campaign.name}
                      archived={campaign.archived}
                    />
                  </div>
                </div>

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-slate-800 rounded-xl p-12 text-center border-2 border-slate-700/50">
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
              className="inline-block px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-lg transition-colors shadow-lg border-2 border-transparent hover:border-indigo-400/50"
            >
              Create First Campaign
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
