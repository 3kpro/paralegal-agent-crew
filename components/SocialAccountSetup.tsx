"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Plus, Check, X, Loader2, Users, Trash2, Twitter, Linkedin, Facebook, Instagram, Music, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  platform_user_id: string;
  platform_username?: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  features: string[];
  isAvailable: boolean;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "bg-black",
    description: "Share tweets and threads",
    features: ["Text posts", "Images", "Threads", "Polls"],
    isAvailable: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600",
    description: "Professional networking",
    features: ["Articles", "Posts", "Company updates"],
    isAvailable: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500",
    description: "Social media posting",
    features: ["Posts", "Photos", "Videos"],
    isAvailable: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Visual content sharing",
    features: ["Photos", "Stories", "Reels"],
    isAvailable: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music,
    color: "bg-black",
    description: "Short-form videos",
    features: ["Videos", "Effects", "Sounds"],
    isAvailable: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    description: "Video content platform",
    features: ["Videos", "Shorts", "Community posts"],
    isAvailable: true,
  },
];

interface SocialAccountSetupProps {
  onAccountsUpdate?: (accounts: SocialAccount[]) => void;
  showHeader?: boolean;
  compact?: boolean;
}

export function SocialAccountSetup({
  onAccountsUpdate,
  showHeader = true,
  compact = false,
}: {
  onAccountsUpdate: (accounts: any[]) => void;
  showHeader?: boolean;
  compact?: boolean;
}) {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadSocialAccounts();
  }, []);

  useEffect(() => {
    if (onAccountsUpdate) {
      onAccountsUpdate(accounts);
    }
  }, [accounts, onAccountsUpdate]);

  async function loadSocialAccounts() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load social accounts:", error);
        return;
      }

      setAccounts(data || []);
    } catch (error) {
      console.error("Error loading social accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function connectAccount(platform: SocialPlatform) {
    setConnecting(platform.id);
    try {
      // Redirect to OAuth flow
      const currentPath = window.location.pathname;
      window.location.href = `/api/auth/connect/${platform.id}?redirect=${encodeURIComponent(currentPath)}`;
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to start authentication. Please try again.");
      setConnecting(null);
    }
  }

  async function disconnectAccount(accountId: string) {
    try {
      const { error } = await supabase
        .from("social_accounts")
        .delete()
        .eq("id", accountId);

      if (error) {
        console.error("Failed to disconnect account:", error);
        return;
      }

      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    } catch (error) {
      console.error("Error disconnecting account:", error);
    }
  }

  async function toggleAccountStatus(accountId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from("social_accounts")
        .update({ is_active: isActive })
        .eq("id", accountId);

      if (error) {
        console.error("Failed to update account status:", error);
        return;
      }

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, is_active: isActive } : acc,
        ),
      );
    } catch (error) {
      console.error("Error updating account status:", error);
    }
  }

  const connectedPlatforms = accounts.map((acc) => acc.platform);
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (platform) =>
      platform.isAvailable && !connectedPlatforms.includes(platform.id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-tron-cyan" />
          <p className="text-tron-text-muted">Loading social accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${compact ? "space-y-4" : "space-y-6"}`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-tron-text flex items-center gap-3">
              <Users className="w-6 h-6 text-tron-cyan" />
              Social Accounts
            </h2>
            <p className="text-tron-text-muted mt-2">
              Connect your social media accounts to publish campaigns directly
            </p>
          </div>

          <div className="flex items-center gap-3">
            {availablePlatforms.map((platform) => (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => connectAccount(platform)}
                disabled={connecting === platform.id}
                className={`${platform.color} hover:opacity-90 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <platform.icon className="w-4 h-4" />
                Connect {platform.name}
                {connecting === platform.id && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold text-tron-text mb-3">
                Connect Your Social Networks
              </h3>
              <p className="text-tron-text-muted text-lg max-w-2xl">
                Choose your preferred platforms to start creating and scheduling content
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {SOCIAL_PLATFORMS.filter(p => p.isAvailable).map((platform, index) => (
                <motion.button
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => connectAccount(platform)}
                  disabled={connecting === platform.id}
                  className={`relative group p-8 ${platform.color} rounded-2xl transition-all duration-300
                    flex flex-col items-center justify-center gap-4
                    overflow-hidden cursor-pointer
                    before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-black/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:transform hover:-translate-y-1`}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  </div>

                  {/* Platform Icon */}
                  <div className="relative z-10">
                    <platform.icon className="w-20 h-20 text-white" />
                  </div>

                  {/* Platform Name */}
                  <div className="relative z-10 text-center">
                    <h4 className="text-xl font-bold text-white mb-1">
                      {platform.name}
                    </h4>
                    <p className="text-white/80 text-sm">
                      {platform.description}
                    </p>
                  </div>

                  {/* Connect Button */}
                  <motion.div
                    className="relative z-10 mt-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {connecting === platform.id ? (
                      <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      </div>
                    ) : (
                      <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white font-medium hover:bg-white/30 transition-colors">
                        Connect
                      </div>
                    )}
                  </motion.div>

                  {/* Features Tags */}
                  <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-2">
                    {platform.features.slice(0, 2).map((feature) => (
                      <span key={feature} className="text-xs bg-black/30 text-white px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          accounts.map((account) => {
            const platform = SOCIAL_PLATFORMS.find(
              (p) => p.id === account.platform,
            );
            if (!platform) return null;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-tron-darker/50 backdrop-blur-sm rounded-xl p-4 ${compact ? 'max-w-md mx-auto' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Profile Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-tron-cyan/20">
                    {account.metadata?.profile_image_url ? (
                      <img 
                        src={account.metadata.profile_image_url}
                        alt={account.platform_username || platform.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Account Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {account.metadata?.name || account.platform_username || platform.name}
                      </h3>
                      <span className="text-tron-cyan">
                        @{account.platform_username}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className={`${account.is_active ? 'text-emerald-400' : 'text-yellow-400'} font-medium`}>
                        {account.is_active ? 'Connected & Active' : 'Connected'}
                      </span>
                      {account.metadata?.followers_count && (
                        <span className="text-gray-400">
                          {account.metadata.followers_count.toLocaleString()} followers
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platform Icon & Actions */}
                  <div className="flex items-center gap-3">
                    <div className={`${platform.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                      <platform.icon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAccountStatus(account.id, !account.is_active)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          account.is_active 
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                        title={account.is_active ? 'Deactivate account' : 'Activate account'}
                      >
                        {account.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => disconnectAccount(account.id)}
                        className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Disconnect account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-tron-text">
                Connect Social Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-tron-text-muted hover:text-tron-text transition-colors"
                title="Close dialog"
                aria-label="Close social account connection dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlatforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connectAccount(platform)}
                  disabled={connecting === platform.id}
                  className="text-left p-4 bg-tron-dark/50 border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                    >
                      <platform.icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-tron-text">
                          {platform.name}
                        </h4>
                        {connecting === platform.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-tron-cyan" />
                        )}
                      </div>

                      <p className="text-sm text-tron-text-muted mb-2">
                        {platform.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {platform.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="text-xs bg-tron-cyan/20 text-tron-cyan px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {availablePlatforms.length === 0 && (
              <div className="text-center py-8">
                <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-tron-text mb-2">
                  All Available Platforms Connected
                </h4>
                <p className="text-tron-text-muted">
                  You've connected all currently available social media
                  platforms.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
