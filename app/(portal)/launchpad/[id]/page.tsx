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
  EyeOff,
  Eye
} from "lucide-react";
import Link from "next/link";
import { CCAI_TARGETS } from "@/lib/data/ccai-targets";

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
  target_url?: string;
  status: 'draft' | 'review' | 'ready' | 'posted';
  content: any;
  posted_url?: string;
}

function CopyButton({ text, label = "Copy", className = "" }: { text: string, label?: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 px-4 py-2 transition-all ${
        copied 
          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
          : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
      } border rounded-lg text-sm font-medium ${className}`}
    >
      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [targets, setTargets] = useState<LaunchTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPosted, setShowPosted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const TOTAL_DAYS = 4;
  
  // ... (No AI State)

  useEffect(() => {
    fetchCampaignData();
  }, [params.id]);

  // ... (fetchCampaignData remains same)

  // ... (handleMarkPosted remains same)

  // ... (handleCompleteDay remains same)

  // ... (handleAskAI REMOVED)

  // ... (groupedTargets remains same)

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
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>Protocol: Content Cascade AI Launch</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-coral-400 font-bold">Day {currentDay} of {TOTAL_DAYS}</span>
              </div>
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
              onClick={handleCompleteDay}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {currentDay < TOTAL_DAYS ? `Complete Day ${currentDay}` : "Finish Mission"}
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
                        
                        {(() => {
                          // Use DB content if valid, otherwise fallback to static content
                          const content = (target.content && !target.content.error) 
                            ? target.content 
                            : CCAI_TARGETS.find((t: any) => t.platform === target.platform && t.community_name === target.community_name)?.content;

                          if (content) {
                            return (
                              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700/50 text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                {content.title && <div className="font-bold mb-2">{content.title}</div>}
                                {content.text || content.body || content.caption || (content.thread && content.thread.join('\n\n---\n\n'))}
                                {content.image_prompt && (
                                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-start justify-between gap-4">
                                    <div>
                                      <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Image Prompt</span>
                                      <span className="text-purple-200">{content.image_prompt}</span>
                                    </div>
                                    <CopyButton 
                                      text={content.image_prompt} 
                                      label="Copy Prompt" 
                                      className="shrink-0 !px-3 !py-1 !text-xs" 
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return <div className="text-gray-500 italic text-sm">No content available.</div>;
                          }
                        })()}
                      </div>

                      <div className="flex flex-col gap-2 min-w-[140px]">
                        {(() => {
                          const targetUrl = target.target_url || CCAI_TARGETS.find((t: any) => t.platform === target.platform && t.community_name === target.community_name)?.url;
                          
                          if (targetUrl) {
                            return (
                              <a
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-600/30"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                              </a>
                            );
                          }
                          return null;
                        })()}

                        {(() => {
                          const content = (target.content && !target.content.error) 
                            ? target.content 
                            : CCAI_TARGETS.find((t: any) => t.platform === target.platform && t.community_name === target.community_name)?.content;

                          if (!content) return null;

                          if (content.title) {
                            return (
                              <>
                                <CopyButton text={content.title} label="Copy Title" />
                                <CopyButton text={content.body} label="Copy Body" />
                              </>
                            );
                          }

                          return (
                            <CopyButton 
                              text={content.text || content.caption || content.thread?.join('\n\n')}
                            />
                          );
                        })()}
                        
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
              <h3 className="text-xl font-bold text-white mb-2">Day {currentDay} Complete!</h3>
              <p className="text-gray-400">You've finished all tasks for today. Click "Complete Day" to advance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
