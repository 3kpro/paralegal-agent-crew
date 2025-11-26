"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Target, 
  PenTool, 
  CheckCircle, 
  Share2, 
  Plus, 
  RefreshCw,
  ExternalLink,
  Copy
} from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  product_name: string;
  product_description: string;
  status: string;
}

interface LaunchTarget {
  id: string;
  platform: string;
  community_name: string;
  status: 'draft' | 'review' | 'ready' | 'posted';
  content: any;
  posted_url?: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [targets, setTargets] = useState<LaunchTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrix' | 'content' | 'tracking'>('matrix');
  
  // Add Target Modal State
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({
    platform: 'reddit',
    community_name: ''
  });
  const [addingTarget, setAddingTarget] = useState(false);

  // Generation State
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchCampaignData() {
      if (!params.id) return;

      try {
        // Fetch campaign details
        const { data: campaignData, error: campaignError } = await supabase
          .from("launch_campaigns")
          .select("*")
          .eq("id", params.id)
          .single();

        if (campaignError) throw campaignError;
        setCampaign(campaignData);

        // Fetch targets
        const { data: targetsData, error: targetsError } = await supabase
          .from("launch_targets")
          .select("*")
          .eq("campaign_id", params.id)
          .order("created_at", { ascending: true });

        if (targetsError) throw targetsError;
        setTargets(targetsData || []);

      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignData();
  }, [params.id, supabase]);

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTarget(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("launch_targets")
        .insert({
          campaign_id: params.id,
          user_id: user.id,
          platform: newTarget.platform,
          community_name: newTarget.community_name,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setTargets([...targets, data]);
      setIsAddTargetOpen(false);
      setNewTarget({ platform: 'reddit', community_name: '' });
    } catch (error) {
      console.error("Error adding target:", error);
      alert("Failed to add target");
    } finally {
      setAddingTarget(false);
    }
  };

  const handleGenerateContent = async () => {
    setGenerating(true);
    try {
      const targetIds = targets.map(t => t.id);
      
      const response = await fetch('/api/launchpad/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: params.id,
          targetIds
        })
      });

      if (!response.ok) throw new Error("Generation failed");

      const { results } = await response.json();

      // Update local state with generated content
      const updatedTargets = targets.map(t => {
        const result = results.find((r: any) => r.id === t.id);
        return result ? { ...t, content: result.content, status: result.status } : t;
      });

      setTargets(updatedTargets as LaunchTarget[]);
      setActiveTab('tracking'); // Switch to tracking tab to see results
      alert("Content generated successfully!");

    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading mission data...</div>;
  }

  if (!campaign) {
    return <div className="text-white p-8">Campaign not found.</div>;
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/launchpad"
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {campaign.name}
              <span className="text-xs px-2 py-1 bg-coral-500/20 text-coral-300 rounded-full border border-coral-500/30">
                {campaign.status}
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Product: {campaign.product_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddTargetOpen(true)}
            className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Target
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-coral-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Target Matrix
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-coral-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Content Factory
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tracking'
                ? 'border-coral-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Command Center
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Target Cards */}
            {targets.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No targets defined yet. Add a subreddit or platform to start.
              </div>
            ) : (
              targets.map((target) => (
                <div
                  key={target.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-coral-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Platform Icon Placeholder */}
                      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {target.platform.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{target.community_name}</h3>
                        <p className="text-xs text-gray-400 capitalize">{target.platform}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      target.status === 'posted' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      target.status === 'ready' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      'bg-gray-700 text-gray-400 border-gray-600'
                    }`}>
                      {target.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                    <button className="text-xs text-coral-400 hover:text-coral-300 flex items-center gap-1">
                      <PenTool className="w-3 h-3" />
                      Generate Content
                    </button>
                    {target.posted_url && (
                      <a 
                        href={target.posted_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Live
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Add Target Card */}
            <button 
              onClick={() => setIsAddTargetOpen(true)}
              className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-gray-500 transition-colors min-h-[140px]"
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add Target</span>
            </button>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Content Factory</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Select targets to generate tailored content using AI.
            </p>
            <button 
              onClick={handleGenerateContent}
              disabled={generating || targets.length === 0}
              className="px-6 py-3 bg-coral-500 text-white rounded-lg font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "Start Generation"}
            </button>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="grid grid-cols-4 gap-4 h-[600px]">
            {['Draft', 'Review', 'Ready', 'Posted'].map((status) => (
              <div key={status} className="bg-gray-800/30 rounded-xl p-4 flex flex-col">
                <h3 className="font-bold text-gray-400 mb-4 flex items-center justify-between">
                  {status}
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">
                    {targets.filter(t => t.status === status.toLowerCase()).length}
                  </span>
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {targets
                    .filter(t => t.status === status.toLowerCase())
                    .map(target => (
                      <div key={target.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
                        <div className="text-sm font-medium text-white mb-1">{target.community_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{target.platform}</div>
                        {target.content && (
                          <div className="mt-2 text-xs text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700/50 relative group">
                            <div className="line-clamp-3 mb-2">
                              {target.content.title || target.content.text || target.content.caption || (target.content.thread && target.content.thread[0])}
                            </div>
                            {target.content.image_prompt && (
                              <div className="text-xs bg-purple-900/30 border border-purple-500/30 p-2 rounded text-purple-200 mb-1">
                                <span className="font-bold text-purple-400 block text-[10px] uppercase mb-1">AI Image Prompt:</span>
                                {target.content.image_prompt}
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const text = target.content.title 
                                  ? `${target.content.title}\n\n${target.content.body}`
                                  : target.content.text || target.content.thread?.join('\n\n');
                                navigator.clipboard.writeText(text);
                                alert("Copied to clipboard!");
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-gray-800 rounded-md text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Target Modal */}
      {isAddTargetOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Target</h3>
            <form onSubmit={handleAddTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Platform</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-coral-500"
                  value={newTarget.platform}
                  onChange={(e) => setNewTarget({...newTarget, platform: e.target.value})}
                >
                  <option value="reddit">Reddit</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="product_hunt">Product Hunt</option>
                  <option value="indie_hackers">Indie Hackers</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Community / Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. r/SideProject or @trendpulse"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-coral-500"
                  value={newTarget.community_name}
                  onChange={(e) => setNewTarget({...newTarget, community_name: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTargetOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTarget}
                  className="flex-1 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {addingTarget ? "Adding..." : "Add Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
