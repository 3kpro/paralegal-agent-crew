"use client";
// Cache bust: 2025-10-22 - Force rebuild for Delete button text update

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  target_platforms?: string[];
  metadata?: any;
}

interface Content {
  id: string;
  platform: string;
  content: string;
  created_at: string;
  metadata?: any;
}

export default function CampaignDetailClient({
  campaign,
  content,
}: {
  campaign: Campaign;
  content: Content[] | null;
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  function copyContent(content: string, platform: string) {
    if (!content) {
      showToast("No content to copy", "error");
      return;
    }

    navigator.clipboard.writeText(content)
      .then(() => {
        showToast(`${platform} content copied!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        showToast("Failed to copy content", "error");
      });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Campaign deleted successfully!", "success");
        setTimeout(() => {
          router.push("/campaigns");
          router.refresh();
        }, 1500);
      } else {
        showToast(`Failed to delete campaign: ${data.error}`, "error");
      }
    } catch (error: any) {
      showToast(`Error deleting campaign: ${error.message}`, "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  function handleEdit() {
    // Navigate to edit page which redirects to /campaigns/new?edit=id
    router.push(`/campaigns/${campaign.id}/edit`);
  }

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-tron-grid border-2 border-red-500/50 rounded-xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-tron-text mb-4">
              Delete Campaign?
            </h3>
            <p className="text-tron-text-muted mb-6">
              Are you sure you want to delete "
              <span className="text-tron-cyan">{campaign.name}</span>"? This
              action cannot be undone and will delete all generated content.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-text hover:border-tron-cyan rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tron-cyan/20 border border-tron-cyan text-tron-cyan hover:bg-tron-cyan/30 rounded-lg transition-colors"
          >
            ✏️ Continue Editing
          </button>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 text-tron-cyan hover:text-tron-cyan/80 transition-colors"
          >
            📋 View All Campaigns
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-tron-text mb-2">
              {campaign.name}
            </h1>
            <div className="flex items-center gap-4 text-tron-text-muted">
              <span>
                Status:{" "}
                <span className="text-tron-cyan">{campaign.status}</span>
              </span>
              <span>•</span>
              <span>
                Created: {new Date(campaign.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-cyan hover:border-tron-cyan hover:bg-tron-cyan/10 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-tron-grid border border-red-500/30 text-red-400 hover:border-red-500 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">
            Target Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {campaign.target_platforms?.map((platform: string) => (
              <span
                key={platform}
                className="px-3 py-1 bg-tron-cyan/20 text-tron-cyan rounded-full text-sm"
              >
                {platform}
              </span>
            )) || (
              <span className="text-tron-text-muted">
                No platforms selected
              </span>
            )}
          </div>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">
            Trend Topic
          </h3>
          <p className="text-tron-text">
            {campaign.metadata?.trend?.title || "No trend selected"}
          </p>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">
            AI Provider
          </h3>
          <p className="text-tron-text">
            {campaign.metadata?.ai_provider || "Not specified"}
          </p>
        </div>
      </div>

      {/* Generated Content */}
      <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-6">
        <h2 className="text-xl font-bold text-tron-text mb-6">
          Generated Content
        </h2>

        {content && content.length > 0 ? (
          <div className="space-y-6">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-tron-dark rounded-lg p-6 border border-tron-grid"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-tron-cyan capitalize">
                    {item.platform}
                  </h3>
                  <span className="text-sm text-tron-text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {item.content && (
                    <div>
                      <p className="text-sm text-tron-text-muted mb-1">
                        Content:
                      </p>
                      <p className="text-tron-text whitespace-pre-wrap">
                        {item.content}
                      </p>
                    </div>
                  )}

                  {item.metadata?.subject && (
                    <div>
                      <p className="text-sm text-tron-text-muted mb-1">
                        Subject:
                      </p>
                      <p className="text-tron-text">{item.metadata.subject}</p>
                    </div>
                  )}

                  {item.metadata?.hashtags &&
                    item.metadata.hashtags.length > 0 && (
                      <div>
                        <p className="text-sm text-tron-text-muted mb-1">
                          Hashtags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.metadata.hashtags.map(
                            (tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-tron-cyan text-sm"
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {item.metadata?.characterCount && (
                    <p className="text-xs text-tron-text-muted">
                      Character count: {item.metadata.characterCount}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-tron-grid flex gap-3">
                  <button
                    onClick={() => copyContent(item.content, item.platform)}
                    className="px-4 py-2 bg-tron-grid border border-green-500/30 text-green-400 hover:border-green-500 hover:bg-green-500/10 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Content
                  </button>
                  <button
                    className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-text-muted rounded-lg transition-colors text-sm cursor-not-allowed"
                    disabled
                  >
                    Publish (Coming Soon)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-tron-text-muted">No content generated yet</p>
            <p className="text-sm text-tron-text-muted mt-2">
              Content will appear here after generation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
