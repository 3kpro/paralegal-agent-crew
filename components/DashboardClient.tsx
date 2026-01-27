"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { DashboardSkeleton } from "./SkeletonLoader";
import { motion } from "framer-motion";
import UsageMeter from "./UsageMeter";
import {
  Megaphone,
  Timer,
  Share2,
  DollarSign,
  Plus,
  ArrowRight,
  Sparkles,
  FileStack,
  Layers,
} from "lucide-react";
import { FirstTimeHelpBanner } from "./FirstTimeTooltips";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import ActivityChart from "./dashboard/ActivityChart";
import QuickWins from "./dashboard/QuickWins";
import ProgressTracker from "./dashboard/ProgressTracker";
// import CalendarView from "./dashboard/CalendarView";

interface Campaign {
  id: string;
  name: string;
  target_platforms: string[];
  status: string;
  created_at: string;
}

interface StatCard {
  icon: any;
  value: number | string;
  label: string;
  subtitle?: string;
  color: string;
  bg: string;
  border: string;
}

interface Profile {
  full_name: string;
}

interface DashboardData {
  profile: Profile | null;
  campaigns: Campaign[];
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const { data: analyticsData, loading: analyticsLoading } = useDashboardStats();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Get user profile and campaigns in parallel
      const [profileResponse, campaignResponse] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("campaigns")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setData({
        profile: profileResponse.data,
        campaigns: campaignResponse.data || [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <motion.div
        className="p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-red-900/20 backdrop-blur-xl border-2 border-red-500/30 text-red-400 px-6 py-4 rounded-2xl">
          Error loading dashboard: {error}
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const { profile, campaigns } = data;

  // Calculate content metrics
  const totalPlatformPosts = campaigns.reduce((acc, c) => acc + (c.target_platforms?.length || 0), 0);
  const estimatedContentPieces = campaigns.length * 4;
  const estimatedTimeSaved = campaigns.length > 0 ? `${campaigns.length * 2}h saved` : "Ready to save time";

  const stats = [
    {
      icon: Megaphone,
      value: campaigns.length,
      label: "Campaigns Created",
      subtitle: campaigns.length === 0 ? "Create your first!" : "Building momentum",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      icon: FileStack,
      value: estimatedContentPieces,
      label: "Content Pieces",
      subtitle: campaigns.length > 0 ? `~$${estimatedContentPieces * 10} value` : "AI-generated",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      icon: Share2,
      value: totalPlatformPosts,
      label: "Platform Posts",
      subtitle: campaigns.length > 0 ? "Multi-channel reach" : "6 platforms ready",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Timer,
      value: estimatedTimeSaved,
      label: "Time Efficiency",
      subtitle: campaigns.length > 0 ? "vs manual creation" : "Start saving today",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent p-0 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {profile?.full_name || "Welcome Back"}
              </h1>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {campaigns.length === 0 ? (
                  "Ready to create your first campaign?"
                ) : campaigns.length === 1 ? (
                  "1 active campaign"
                ) : (
                  `${campaigns.length} active campaigns`
                )}
              </p>
            </div>

            <Link href="/campaigns/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-3 text-lg shadow-lg border-2 border-transparent hover:border-indigo-400/50"
              >
                <Plus className="w-6 h-6" />
                New Campaign
              </motion.button>
            </Link>
          </motion.div>

          {/* First-Time Help Banner */}
          <FirstTimeHelpBanner />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  {/* Gradient glow effect on hover */}
                  {/* Gradient glow effect on hover - Removed for cleaner look, handled by card hover states */}
                  
                  <div className={`relative p-6 bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-${stat.color.split('-')[1]}-500/30 transition-all duration-300 group-hover:shadow-lg hover:shadow-${stat.color.split('-')[1]}-500/10`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {/* New Minimal Header Layout */}
                        <div className="text-sm text-gray-400 font-medium mb-1">
                          {stat.label}
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                          {stat.value}
                        </div>
                      </div>
                      
                      {/* Modern Icon Container */}
                      <div
                        className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}
                      >
                        <Icon className={`w-6 h-6 ${stat.color}`} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {/* Subtle Progress Bar or Trend Metric could go here, for now just subtitle */}
                       {stat.subtitle && (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                           <div className={`w-1.5 h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                           {stat.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Usage Meter and Recent Campaigns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage Meter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="lg:col-span-1"
            >
              <UsageMeter />
            </motion.div>

            {/* Recent Campaigns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="lg:col-span-2 p-8 bg-[#343a40] backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl"
            >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                Recent Campaigns
              </h2>
              {campaigns && campaigns.length > 0 && (
                <Link href="/campaigns">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              )}
            </div>

            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="group"
                  >
                    <Link href={`/campaigns/${campaign.id}`}>
                      <div className="p-6 bg-slate-800 backdrop-blur border-2 border-slate-700/50 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 flex items-center justify-between hover:shadow-xl hover:shadow-indigo-500/20">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-300 flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full capitalize text-xs font-medium ${
                              campaign.status === 'published'
                                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                : campaign.status === 'scheduled'
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                : 'bg-slate-500/10 border border-slate-500/30 text-slate-400'
                            }`}>
                              {campaign.status}
                            </span>
                            {campaign.target_platforms && campaign.target_platforms.length > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  {campaign.target_platforms.length} {campaign.target_platforms.length === 1 ? 'platform' : 'platforms'}
                                </span>
                              </>
                            )}
                            <span className="text-gray-600">•</span>
                            <span className="text-xs">
                              {new Date(campaign.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          className="p-2 bg-indigo-500/10 rounded-full"
                        >
                          <ArrowRight className="w-5 h-5 text-indigo-500" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="py-8"
              >
                {/* Getting Started Checklist */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-coral-400" />
                    Getting Started
                  </h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, label: "Create your first campaign", done: false, href: "/campaigns/create" },
                      { step: 2, label: "Discover trending topics", done: false, href: "/campaigns/create" },
                      { step: 3, label: "Generate AI content", done: false, href: "/campaigns/create" },
                      { step: 4, label: "Schedule or publish", done: false, href: "/campaigns" },
                    ].map((item, idx) => (
                      <Link key={item.step} href={item.href}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-coral-500/30 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            item.done
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-coral-500/20 text-coral-400 border border-coral-500/30'
                          }`}>
                            {item.step}
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors flex-1">
                            {item.label}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-coral-400 transition-colors" />
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Link href="/campaigns/create">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-coral-500 text-white font-bold rounded-xl hover:bg-coral-600 transition-colors flex items-center gap-3 mx-auto text-lg shadow-xl border-2 border-transparent hover:border-coral-400/50"
                    >
                      <Plus className="w-6 h-6" />
                      Create First Campaign
                    </motion.button>
                  </Link>
                  <p className="text-gray-500 text-sm mt-4">
                    Takes less than 2 minutes with AI assistance
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
          </div>

          {/* Analytics Section - Activity Chart, Quick Wins, Progress */}
          {!analyticsLoading && analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="lg:col-span-2">
                <ActivityChart />
              </div>

              {/* Quick Wins */}
              {analyticsData.quick_wins && analyticsData.quick_wins.length > 0 && (
                <QuickWins wins={analyticsData.quick_wins} />
              )}

              {/* Progress Tracker */}
              <ProgressTracker progress={analyticsData.progress} />
            </div>
          )}

          {/* Smart Scheduling Calendar - Hidden until implemented */
/*
          <div className="mt-8">
            <CalendarView />
          </div>
*/
}
        </div>
      </div>
  );
}
