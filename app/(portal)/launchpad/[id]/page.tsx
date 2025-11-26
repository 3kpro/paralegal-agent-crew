"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  EyeOff,
  Eye
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
  const [generating, setGenerating] = useState(false);
  const [showPosted, setShowPosted] = useState(false);
  
  // AI Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchCampaignData();
  }, [params.id]);

  async function fetchCampaignData() {
    if (!params.id) return;
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from("launch_campaigns")
        .select("*")
        .eq("id", params.id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      const { data: targetsData, error: targetsError } = await supabase
        .from("launch_targets")
        .select("*")
        .eq("campaign_id", params.id)
        .order("created_at", { ascending: true });

      if (targetsError) throw targetsError;
      setTargets(targetsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      // Only generate for targets that don't have content yet or are in draft
      const targetsToGenerate = targets.filter(t => !t.content || t.status === 'draft');
      
      if (targetsToGenerate.length === 0) {
        alert("All targets already have content!");
        setGenerating(false);
        return;
      }

      const response = await fetch('/api/launchpad/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: params.id,
          targetIds: targetsToGenerate.map(t => t.id)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const { results } = await response.json();

      // Update local state
      const updatedTargets = targets.map(t => {
        const result = results.find((r: any) => r.id === t.id);
        return result ? { ...t, content: result.content, status: result.status } : t;
      });

      setTargets(updatedTargets as LaunchTarget[]);
      alert("Content generated successfully!");

    } catch (error: any) {
      console.error("Generation error:", error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPosted = async (targetId: string) => {
    try {
      const { error } = await supabase
        .from("launch_targets")
        .update({ status: 'posted' })
        .eq("id", targetId);

      if (error) throw error;

      setTargets(targets.map(t => t.id === targetId ? { ...t, status: 'posted' } : t));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    // TODO: Connect to a real chat endpoint. For now, mock it.
    setTimeout(() => {
      setAiResponse(`Here is a suggestion for "${aiQuery}": \n\nTry focusing on the unique value proposition of Content Cascade AI. Mention how it saves 20+ hours a week.`);
      setAiLoading(false);
    }, 1000);
  };

  // Group targets by platform
  const groupedTargets = targets.reduce((acc, target) => {
    if (!showPosted && target.status === 'posted') return acc;
    if (!acc[target.platform]) acc[target.platform] = [];
    acc[target.platform].push(target);
    return acc;
  }, {} as Record<string, LaunchTarget[]>);

  if (loading) return <div className="text-white p-8">Loading mission data...</div>;
  if (!campaign) return <div className="text-white p-8">Campaign not found.</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/launchpad" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
              <p className="text-gray-400 text-sm">Protocol: Content Cascade AI Launch</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setShowPosted(!showPosted)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showPosted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPosted ? "Hide Completed" : "Show Completed"}
            </button>
            <button 
              onClick={handleGenerateAll}
              disabled={generating}
              className="px-6 py-2 bg-gradient-to-r from-coral-500 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generating..." : "Generate All Content"}
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-coral-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Sections */}
        <div className="space-y-8">
          {Object.entries(groupedTargets).map(([platform, platformTargets]) => (
            <div key={platform} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                  {platform.replace('_', ' ')}
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {platformTargets.length}
                  </span>
                </h2>
              </div>
              
              <div className="divide-y divide-gray-800">
                {platformTargets.map(target => (
                  <div key={target.id} className="p-6 hover:bg-gray-800/30 transition-colors group">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-coral-400">{target.community_name}</h3>
                          {target.status === 'posted' && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Posted
                            </span>
                          )}
                        </div>
                        
                        {target.content ? (
                          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700/50 text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {target.content.title && <div className="font-bold mb-2">{target.content.title}</div>}
                            {target.content.text || target.content.body || target.content.caption || (target.content.thread && target.content.thread.join('\n\n---\n\n'))}
                            {target.content.image_prompt && (
                              <div className="mt-4 pt-4 border-t border-gray-800">
                                <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Image Prompt</span>
                                <span className="text-purple-200">{target.content.image_prompt}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic text-sm">Content pending generation...</div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 min-w-[140px]">
                        {target.content && (
                          <button
                            onClick={() => {
                              const text = target.content.title 
                                ? `${target.content.title}\n\n${target.content.body}`
                                : target.content.text || target.content.caption || target.content.thread?.join('\n\n');
                              navigator.clipboard.writeText(text);
                              alert("Copied to clipboard!");
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                        )}
                        
                        {target.status !== 'posted' && (
                          <button
                            onClick={() => handleMarkPosted(target.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-600/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedTargets).length === 0 && (
            <div className="text-center py-20 text-gray-500">
              {showPosted ? "No targets found." : "All targets posted! Great job."}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20"
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-500" />
                AI Assistant
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="bg-gray-800/50 p-3 rounded-lg text-sm text-gray-300">
                I'm here to help! Ask me for extra hooks, reply suggestions, or strategy advice.
              </div>
              {aiResponse && (
                <div className="bg-coral-500/10 border border-coral-500/20 p-3 rounded-lg text-sm text-coral-200 whitespace-pre-wrap">
                  {aiResponse}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleAskAI}>
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask for help..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white outline-none focus:border-coral-500 resize-none h-24 mb-2"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="w-full bg-coral-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-coral-600 disabled:opacity-50"
                >
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
