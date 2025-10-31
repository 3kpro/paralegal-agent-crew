"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Zap,
  Shield,
  HelpCircle,
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
  token_expires_at: string | null;
  metadata: {
    name?: string;
    followers?: number;
    profile_image?: string;
  };
}

export default function SocialAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectedAccounts();

    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth-success') {
        fetchConnectedAccounts();
        setConnectingPlatform(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please log in to view connected accounts');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConnectedAccounts(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platformId: string) => {
    setConnectingPlatform(platformId);
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/api/auth/connect/${platformId}?redirect=/social-accounts`,
      `${platformId}_auth`,
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );

    // Check if popup was blocked
    if (!popup) {
      alert('Popup was blocked. Please allow popups for this site to connect social accounts.');
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      await fetchConnectedAccounts();
    } catch (err: any) {
      alert(`Failed to disconnect: ${err.message}`);
    }
  };

  const platforms = [
    { id: "twitter", name: "Twitter", Icon: Twitter, bgClass: "bg-black" },
    { id: "linkedin", name: "LinkedIn", Icon: Linkedin, bgClass: "bg-[#0077B5]" },
    { id: "facebook", name: "Facebook", Icon: Facebook, bgClass: "bg-[#1877F2]" },
    { id: "instagram", name: "Instagram", Icon: Instagram, bgClass: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]" }
  ];

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(acc => acc.platform === platformId && acc.is_active);
  };

  const getAccountForPlatform = (platformId: string) => {
    return connectedAccounts.find(acc => acc.platform === platformId && acc.is_active);
  };

  return (
    <div className="min-h-screen bg-tron-dark">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="py-8 text-center">
          <h1 className="text-3xl font-bold text-tron-text mb-3">Social Accounts</h1>
          <p className="text-tron-text-muted text-lg">
            Connect your social media accounts to publish campaigns directly
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Main Grid and Sidebar Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Grid Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-tron-cyan animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-10 max-w-xl mx-auto py-12">
                {platforms.map((platform, index) => {
                  const connected = isConnected(platform.id);
                  const account = getAccountForPlatform(platform.id);
                  const connecting = connectingPlatform === platform.id;

                  return (
                    <motion.div
                      key={platform.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <button
                        onClick={() => !connected && !connecting && handleConnect(platform.id)}
                        disabled={connected || connecting}
                        className={`relative group aspect-square rounded-xl p-6 flex flex-col items-center justify-center gap-3 overflow-hidden w-full
                          ${platform.bgClass}
                          ${connected ? 'cursor-default' : 'hover:transform hover:scale-105'}
                          ${connecting ? 'opacity-75' : ''}
                          transition-all duration-300`}
                      >
                        {/* Platform Icon */}
                        <div className="text-white w-16 h-16 flex items-center justify-center">
                          <platform.Icon className="w-full h-full" />
                        </div>

                        {/* Platform Name */}
                        <span className="text-white text-xl font-bold">{platform.name}</span>

                        {/* Status Badge */}
                        {connected && account && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          </div>
                        )}

                        {/* Connecting Indicator */}
                        {connecting && (
                          <motion.div
                            className="absolute inset-0 bg-black/60 flex items-center justify-center"
                          >
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </motion.div>
                        )}

                        {/* Connect Button */}
                        {!connected && !connecting && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white font-medium">
                              Connect
                            </div>
                          </motion.div>
                        )}

                        {/* Connected Info */}
                        {connected && account && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                            <p className="text-white text-sm font-medium truncate">
                              @{account.platform_username}
                            </p>
                            {account.metadata?.followers !== undefined && (
                              <p className="text-white/70 text-xs">
                                {account.metadata.followers.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        {!connected && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </button>

                      {/* Disconnect Button */}
                      {connected && account && (
                        <button
                          onClick={() => handleDisconnect(account.id, platform.name)}
                          className="mt-3 w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Info & Status */}
          <div className="space-y-6">
            {/* Publishing Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-tron-cyan" />
                Publishing Status
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tron-text-muted">
                    Connected Accounts
                  </span>
                  <span className="text-sm font-semibold text-tron-text">
                    {connectedAccounts.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-tron-text-muted">
                    Active Accounts
                  </span>
                  <span className="text-sm font-semibold text-green-400">
                    {
                      connectedAccounts.filter((acc: any) => acc.is_active)
                        .length
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-tron-text-muted">
                    Ready to Publish
                  </span>
                  <span className="text-sm font-semibold text-tron-cyan">
                    {
                      connectedAccounts.filter(
                        (acc: any) => acc.is_active && acc.is_verified,
                      ).length
                    }
                  </span>
                </div>
              </div>

              {connectedAccounts.length > 0 && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Ready for Publishing</span>
                  </div>
                  <p className="text-xs text-green-300 mt-1">
                    Your campaigns can now be published to connected social
                    accounts
                  </p>
                </div>
              )}
            </motion.div>

            {/* Security & Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-tron-cyan" />
                Security & Privacy
              </h3>

              <div className="space-y-3 text-sm text-tron-text-muted">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-tron-cyan rounded-full mt-2 flex-shrink-0"></div>
                  <p>All account tokens are encrypted and stored securely</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-tron-cyan rounded-full mt-2 flex-shrink-0"></div>
                  <p>We only request minimum required permissions</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-tron-cyan rounded-full mt-2 flex-shrink-0"></div>
                  <p>You can revoke access at any time</p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-tron-cyan rounded-full mt-2 flex-shrink-0"></div>
                  <p>No content is stored beyond publishing queue</p>
                </div>
              </div>
            </motion.div>

            {/* Help & Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-tron-cyan" />
                Need Help?
              </h3>

              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-tron-text">
                      Connection Troubleshooting
                    </span>
                    <ExternalLink className="w-4 h-4 text-tron-text-muted" />
                  </div>
                  <p className="text-xs text-tron-text-muted mt-1">
                    Having trouble connecting accounts?
                  </p>
                </button>

                <button className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-tron-text">
                      Publishing Guidelines
                    </span>
                    <ExternalLink className="w-4 h-4 text-tron-text-muted" />
                  </div>
                  <p className="text-xs text-tron-text-muted mt-1">
                    Best practices for social media publishing
                  </p>
                </button>

                <button className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-tron-text">
                      Platform Limitations
                    </span>
                    <ExternalLink className="w-4 h-4 text-tron-text-muted" />
                  </div>
                  <p className="text-xs text-tron-text-muted mt-1">
                    Understanding API limits and restrictions
                  </p>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
