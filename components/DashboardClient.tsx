"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { DashboardSkeleton } from "./SkeletonLoader";
import { motion } from "framer-motion";
import UsageMeter from "./UsageMeter";
import {
  RocketLaunch,
  TrendUp as TrendingUp,
  ChartLineUp,
  CurrencyDollar as DollarSign,
  Plus,
  ArrowRight,
  Sparkle as Sparkles,
  Files,
} from "@phosphor-icons/react";
import { FirstTimeHelpBanner } from "./FirstTimeTooltips";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import ActivityChart from "./dashboard/ActivityChart";
import QuickWins from "./dashboard/QuickWins";
import ProgressTracker from "./dashboard/ProgressTracker";
import CalendarView from "./dashboard/CalendarView";

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
  gradient: string;
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

  const stats = [
    {
      icon: RocketLaunch,
      value: campaigns.length,
      label: "Campaigns Created",
      subtitle: campaigns.length === 0 ? "Start creating!" : campaigns.length === 1 ? "First one done!" : "Building momentum",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Files,
      value: campaigns.length * 4, // Estimate 4 content pieces per campaign
      label: "Content Pieces",
      subtitle: campaigns.length > 0 ? `$${campaigns.length * 4 * 10} saved` : "AI-powered content",
      gradient: "from-violet-500 to-violet-600",
    },
    {
      icon: ChartLineUp,
      value: campaigns.reduce((acc, c) => acc + (c.target_platforms?.length || 0), 0),
      label: "Platform Posts",
      subtitle: campaigns.length > 0 ? "Multi-channel reach" : "Cross-platform ready",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: TrendingUp,
      value: "Day 1+",
      label: "Building Your Brand",
      subtitle: campaigns.length > 0 ? "Keep going!" : "Just getting started",
      gradient: "from-blue-500 to-blue-600",
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
                <Sparkles className="w-4 h-4 text-indigo-400" weight="duotone" />
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
                <Plus className="w-6 h-6" weight="duotone" />
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
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`} />
                  
                  <div className="relative p-6 bg-slate-800 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl group-hover:border-indigo-500/50 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" weight="fill" />
                      </div>
                      {/* Trend indicator */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-xs text-green-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrendingUp className="w-3 h-3" weight="duotone" />
                        <span>+0%</span>
                      </motion.div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-300 font-medium">
                      {stat.label}
                    </div>
                    {stat.subtitle && (
                      <div className="text-xs text-gray-400 mt-1">
                        {stat.subtitle}
                      </div>
                    )}
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
                  <Sparkles className="w-6 h-6 text-indigo-500" weight="duotone" />
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
                    <ArrowRight className="w-4 h-4" weight="duotone" />
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
                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 capitalize text-xs font-medium">
                              {campaign.status}
                            </span>
                            {campaign.target_platforms && campaign.target_platforms.length > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" weight="duotone" />
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
                          <ArrowRight className="w-5 h-5 text-indigo-500" weight="duotone" />
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
                className="text-center py-16"
              >
                <div className="mb-6 flex justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="p-6 bg-coral-500/20 rounded-full"
                  >
                    <Sparkles className="w-16 h-16 text-indigo-500" weight="duotone" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No campaigns yet
                </h3>
                <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                  Start creating amazing content campaigns with AI-powered
                  generation. Your first campaign is just a click away!
                </p>
                <Link href="/campaigns/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-coral-500 text-white font-bold rounded-xl hover:bg-coral-600 transition-colors flex items-center gap-3 mx-auto text-lg shadow-xl border-2 border-transparent hover:border-coral-400/50"
                  >
                    <Plus className="w-6 h-6" weight="duotone" />
                    Create First Campaign
                  </motion.button>
                </Link>
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

          {/* Smart Scheduling Calendar */}
          <div className="mt-8">
            <CalendarView />
          </div>
        </div>
      </div>
  );
}
