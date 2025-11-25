"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function LaunchpadDashboard() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data, error } = await supabase
          .from("launch_campaigns")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [supabase]);

  if (loading) {
    return <div className="text-white p-8">Loading mission control...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Command Center</h2>
          <p className="text-gray-400 mt-1">Manage your marketing campaigns and launches.</p>
        </div>
        <Link
          href="/launchpad/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50"
        >
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No active campaigns
          </h3>
          <p className="text-gray-400 max-w-md text-center mb-6">
            Ready to launch? Create your first campaign to start generating viral content for multiple platforms.
          </p>
          <Link
            href="/launchpad/new"
            className="px-6 py-3 bg-gradient-to-r from-coral-500 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Start Mission
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/launchpad/${campaign.id}`}
              className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-coral-500/50 transition-all hover:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-coral-500/20 to-purple-500/20 flex items-center justify-center border border-coral-500/30">
                  <span className="text-xl">🚀</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  campaign.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-gray-700 text-gray-400 border-gray-600'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-coral-400 transition-colors">
                {campaign.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                {campaign.product_description}
              </p>
              <div className="flex items-center text-xs text-gray-500 gap-4">
                <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
