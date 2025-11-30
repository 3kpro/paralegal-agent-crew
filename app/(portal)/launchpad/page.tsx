"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles,
  ChevronRight,
  EyeOff,
  Eye,
  Rocket,
  Twitter,
  MessageSquare,
  Hash,
  Linkedin,
  Instagram,
  Youtube,
  TrendingUp,
  X,
  Zap
} from "lucide-react";
import { LAUNCH_TEMPLATES } from "@/lib/data/launch-templates";
import Toast from "@/app/(portal)/campaigns/new/components/Toast";

interface ToastState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
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

// Platform icon mapping
const PLATFORM_ICONS: Record<string, any> = {
  twitter: X,
  reddit: MessageSquare,
  product_hunt: Hash,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  indie_hackers: Sparkles,
  dev_to: Zap,
  hackernews: TrendingUp
};

// Viral score predictor (simulated based on platform + day)
const getViralScore = (platform: string, day: number): number => {
  const baseScores: Record<string, number> = {
    twitter: 75,
    reddit: 82,
    product_hunt: 88,
    linkedin: 70,
    indie_hackers: 85,
    dev_to: 78,
    hackernews: 90
  };
  const dayBonus = day * 3; // Later days = more traction
  return Math.min(100, (baseScores[platform] || 70) + dayBonus);
};

export default function LaunchpadPage() {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showPosted, setShowPosted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });
  const TOTAL_DAYS = 4;

  // Load state from local storage on mount
  useEffect(() => {
    const savedDay = localStorage.getItem('launchpad_day');
    const savedTasks = localStorage.getItem('launchpad_tasks');
    const hasSeenIntro = localStorage.getItem('launchpad_intro_seen');

    if (savedDay) setCurrentDay(parseInt(savedDay));
    if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    if (!hasSeenIntro) {
      setShowIntro(true);
      localStorage.setItem('launchpad_intro_seen', 'true');
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem('launchpad_day', currentDay.toString());
    localStorage.setItem('launchpad_tasks', JSON.stringify(completedTasks));
  }, [currentDay, completedTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCompleteDay = () => {
    if (currentDay < TOTAL_DAYS) {
      setCurrentDay(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setToast({
        show: true,
        type: 'success',
        message: `Day ${currentDay} Completed! Unlocking Day ${currentDay + 1}...`
      });
    } else {
      setToast({
        show: true,
        type: 'success',
        message: 'Mission Accomplished! All days completed.'
      });
    }
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress?")) {
      setCurrentDay(1);
      setCompletedTasks([]);
      localStorage.removeItem('launchpad_day');
      localStorage.removeItem('launchpad_tasks');
      window.location.reload();
    }
  };

  // Filter templates for current day
  const dayTemplates = LAUNCH_TEMPLATES.filter(t => t.day === currentDay);

  // Group by platform
  const groupedTemplates = dayTemplates.reduce((acc, template) => {
    if (!acc[template.platform]) acc[template.platform] = [];
    acc[template.platform].push(template);
    return acc;
  }, {} as Record<string, typeof LAUNCH_TEMPLATES>);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#2b2b2b]">
      <Toast toast={toast} />

      {/* Intro Modal */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIntro(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border-2 border-coral-500/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-10 h-10 text-coral-500" />
                <h2 className="text-3xl font-bold text-white">Welcome to Launch Command Center</h2>
              </div>

              <div className="space-y-4 text-gray-300 mb-8">
                <p className="text-lg">
                  <span className="font-bold text-white">Your 4-day viral launch protocol</span> to build momentum and attract your first 1000 users.
                </p>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white">Viral Score Predictions</h3>
                      <p className="text-sm text-gray-400">Each post shows predicted engagement based on platform and timing</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white">Pre-Written Templates</h3>
                      <p className="text-sm text-gray-400">Copy/paste proven content that drives signups</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-coral-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white">Track Your Progress</h3>
                      <p className="text-sm text-gray-400">Check off posts as you publish to stay on schedule</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-200">
                  <strong>Pro Tip:</strong> Post consistently across all platforms each day for maximum reach. The algorithm rewards momentum!
                </p>
              </div>

              <button
                onClick={() => setShowIntro(false)}
                className="w-full py-3 bg-gradient-to-r from-coral-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Let's Launch! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-coral-500" />
              Launch Command Center
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span>Protocol: TrendPulse Launch</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span className="text-coral-400 font-bold">Day {currentDay} of {TOTAL_DAYS}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-red-400 underline px-2"
            >
              Reset Progress
            </button>

            <button
              onClick={() => setShowPosted(!showPosted)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showPosted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPosted ? "Hide Completed" : "Show Completed"}
            </button>
            
            <button
              onClick={handleCompleteDay}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-green-900/20"
            >
              <CheckCircle className="w-4 h-4" />
              {currentDay < TOTAL_DAYS ? `Complete Day ${currentDay}` : "Finish Mission"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6">
          <div 
            className="bg-coral-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(currentDay / TOTAL_DAYS) * 100}%` }}
          ></div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([platform, templates]) => {
            const PlatformIcon = PLATFORM_ICONS[platform] || MessageSquare;
            const viralScore = getViralScore(platform, currentDay);

            return (
            <div key={platform} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-gray-800/80 px-6 py-4 border-b border-gray-800 flex items-center justify-between backdrop-blur-sm">
                <h2 className="text-lg font-bold text-white capitalize flex items-center gap-3">
                  <PlatformIcon className="w-5 h-5 text-coral-400" />
                  {platform.replace('_', ' ')}
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400">{viralScore}% Viral Score</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-800">
                {templates.map((template, idx) => {
                  const taskId = `${currentDay}-${platform}-${idx}`;
                  const isCompleted = completedTasks.includes(taskId);

                  if (!showPosted && isCompleted) return null;

                  return (
                    <div key={idx} className={`p-6 transition-colors group ${isCompleted ? 'bg-gray-900/30 opacity-60' : 'hover:bg-gray-800/30'}`}>
                      <div className="flex items-start gap-6">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(taskId)}
                          className={`mt-1 w-6 h-6 rounded border flex items-center justify-center transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-600 hover:border-coral-500 text-transparent'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-medium text-coral-400">{template.community_name}</h3>
                            {isCompleted && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                          
                          {/* Content Box */}
                          <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 text-gray-300 text-sm whitespace-pre-wrap font-mono relative group-hover:border-gray-700 transition-colors">
                            {template.content.title && <div className="font-bold mb-2 text-white">{template.content.title}</div>}
                            {template.content.text || template.content.body || template.content.caption || (template.content.thread && template.content.thread.join('\n\n---\n\n')) || template.content.tagline}
                            
                            {template.content.image_prompt && (
                              <div className="mt-4 pt-4 border-t border-gray-800 flex items-start justify-between gap-4">
                                <div>
                                  <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Image Prompt</span>
                                  <span className="text-purple-200 italic">{template.content.image_prompt}</span>
                                </div>
                                <CopyButton 
                                  text={template.content.image_prompt} 
                                  label="Copy" 
                                  className="shrink-0 !px-3 !py-1 !text-xs" 
                                />
                              </div>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="flex items-center gap-3 mt-4">
                            {template.url && (
                              <a
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-md text-xs font-medium transition-colors border border-blue-600/20"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open {platform}
                              </a>
                            )}
                            
                            <div className="flex-1"></div>

                            {/* Copy Content Button */}
                            {(() => {
                              const contentText = template.content.text || template.content.body || template.content.caption || template.content.thread?.join('\n\n') || template.content.tagline;
                              if (contentText) {
                                return <CopyButton text={contentText} label="Copy Content" className="!py-1.5 !text-xs" />;
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}

          {Object.keys(groupedTemplates).length === 0 && (
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
