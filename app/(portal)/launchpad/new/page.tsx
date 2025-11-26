"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import { CCAI_TARGETS } from "@/lib/data/ccai-targets";

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    product_name: "Content Cascade AI",
    product_url: "https://contentcascade.ai",
    product_description: "The first AI-powered content repurposing engine that turns one video into a month of viral social posts. It analyzes your content, extracts the best clips, writes viral hooks, and schedules them across Twitter, LinkedIn, and TikTok automatically.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data: campaign, error } = await supabase.from("launch_campaigns").insert({
        user_id: user.id,
        name: formData.name,
        product_name: formData.product_name,
        product_url: formData.product_url,
        product_description: formData.product_description,
        status: "active",
      }).select().single();

      if (error) throw error;

      // Auto-seed Targets
      const targetsToInsert = CCAI_TARGETS.map((t: any) => ({
        campaign_id: campaign.id,
        user_id: user.id,
        platform: t.platform,
        community_name: t.community_name,
        // target_url: t.url, // Removed to bypass schema cache error
        content: t.content, // Pre-fill content
        status: 'review'    // Set to review immediately
      }));

      const { error: seedError } = await supabase
        .from("launch_targets")
        .insert(targetsToInsert);

      if (seedError) console.error("Error seeding targets:", seedError);

      router.push(`/launchpad/${campaign.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/launchpad"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Command Center
        </Link>
        <h1 className="text-3xl font-bold text-white">Initialize Mission</h1>
        <p className="text-gray-400 mt-2">
          Define your product details to start the launch sequence.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Campaign Focus / Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Product Hunt Launch, Viral Twitter Thread, LinkedIn Thought Leadership"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Target Product</h3>
            <span className="text-xs text-coral-400">Content Cascade AI</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Product Name
              </label>
              <input
                type="text"
                readOnly
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                value={formData.product_name}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Product URL
              </label>
              <input
                type="url"
                readOnly
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                value={formData.product_url}
              />
            </div>
          </div>

          <div className="space-y-2 opacity-75">
            <label className="text-xs font-medium text-gray-500">
              Core Value Proposition
            </label>
            <textarea
              readOnly
              rows={3}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed resize-none"
              value={formData.product_description}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coral-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Initializing..."
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Launch Mission
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
