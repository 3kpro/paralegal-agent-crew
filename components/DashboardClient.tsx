"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { DashboardSkeleton } from "./SkeletonLoader";
import { motion } from "framer-motion";
import WelcomeAnimation from "./WelcomeAnimation";
import {
  Zap,
  TrendingUp,
  Target,
  DollarSign,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  target_platforms: string[];
  status: string;
  created_at: string;
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
        <div className="bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-magenta text-tron-magenta px-6 py-4 rounded-2xl">
          Error loading dashboard: {error}
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const { profile, campaigns } = data;

  const stats = [
    {
      icon: Zap,
      value: campaigns.length,
      label: "Campaigns",
      gradient: "from-tron-cyan to-blue-500",
    },
    {
      icon: TrendingUp,
      value: "0",
      label: "Views",
      gradient: "from-tron-magenta to-purple-500",
    },
    {
      icon: Target,
      value: "0%",
      label: "Engagement",
      gradient: "from-tron-cyan to-tron-magenta",
    },
    {
      icon: DollarSign,
      value: "$0",
      label: "AI Credits Saved",
      gradient: "from-green-400 to-tron-cyan",
    },
  ];

  return (
    <>
      {/* Welcome Animation */}
      <WelcomeAnimation />

      <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-tron-text via-tron-cyan to-tron-magenta bg-clip-text text-transparent mb-2">
                {profile?.full_name || "Welcome Back"}
              </h1>
              <p className="text-tron-text-muted text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tron-cyan" />
                {campaigns.length === 0 ? (
                  "Ready to create your first campaign?"
                ) : campaigns.length === 1 ? (
                  "1 active campaign"
                ) : (
                  `${campaigns.length} active campaigns`
                )}
              </p>
            </div>

            <Link href="/campaigns/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-xl shadow-tron-cyan/30 flex items-center gap-3 text-lg group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                New Campaign
              </motion.button>
            </Link>
          </motion.div>

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
                  
                  <div className="relative p-6 bg-gradient-to-br from-tron-dark/80 to-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl group-hover:border-tron-cyan group-hover:shadow-xl group-hover:shadow-tron-cyan/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {/* Trend indicator */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-xs text-green-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>+0%</span>
                      </motion.div>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-tron-text to-tron-cyan bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-tron-text-muted font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="p-8 bg-gradient-to-br from-tron-dark/80 to-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-tron-text flex items-center gap-3">
                <div className="p-2 bg-tron-cyan/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-tron-cyan" />
                </div>
                Recent Campaigns
              </h2>
              {campaigns && campaigns.length > 0 && (
                <Link href="/campaigns">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-tron-cyan hover:text-tron-magenta transition-colors flex items-center gap-2"
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
                      <div className="p-6 bg-gradient-to-br from-tron-grid/50 to-tron-dark/30 backdrop-blur border-2 border-tron-grid hover:border-tron-cyan rounded-2xl transition-all duration-300 flex items-center justify-between hover:shadow-xl hover:shadow-tron-cyan/20">
                        <div className="flex-1">
                          <div className="font-semibold text-tron-text text-lg mb-2 group-hover:text-tron-cyan transition-colors">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-tron-text-muted flex items-center gap-3">
                            <span className="px-3 py-1 bg-tron-cyan/10 border border-tron-cyan/30 rounded-full text-tron-cyan capitalize text-xs font-medium">
                              {campaign.status}
                            </span>
                            {campaign.target_platforms && campaign.target_platforms.length > 0 && (
                              <>
                                <span className="text-tron-grid">•</span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {campaign.target_platforms.length} {campaign.target_platforms.length === 1 ? 'platform' : 'platforms'}
                                </span>
                              </>
                            )}
                            <span className="text-tron-grid">•</span>
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
                          className="p-2 bg-tron-cyan/10 rounded-full"
                        >
                          <ArrowRight className="w-5 h-5 text-tron-cyan" />
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
                    className="p-6 bg-gradient-to-br from-tron-cyan/20 to-tron-magenta/20 rounded-full"
                  >
                    <Sparkles className="w-16 h-16 text-tron-cyan" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-tron-text mb-3">
                  No campaigns yet
                </h3>
                <p className="text-tron-text-muted mb-8 max-w-md mx-auto leading-relaxed">
                  Start creating amazing content campaigns with AI-powered
                  generation. Your first campaign is just a click away!
                </p>
                <Link href="/campaigns/new">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-2xl shadow-tron-cyan/50 flex items-center gap-2 mx-auto text-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Campaign
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
