'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SocialAccountSetup from '@/components/SocialAccountSetup'
import { 
  Settings, 
  Users, 
  Zap, 
  Shield, 
  HelpCircle,
  ExternalLink
} from 'lucide-react'

export default function SocialAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState([])

  return (
    <div className="min-h-screen bg-tron-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tron-text flex items-center gap-3">
                <Users className="w-8 h-8 text-tron-cyan" />
                Social Account Management
              </h1>
              <p className="text-tron-text-muted mt-2">
                Connect and manage your social media accounts for seamless campaign publishing
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <SocialAccountSetup 
              onAccountsUpdate={setConnectedAccounts}
              showHeader={false}
            />
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
                  <span className="text-sm text-tron-text-muted">Connected Accounts</span>
                  <span className="text-sm font-semibold text-tron-text">{connectedAccounts.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tron-text-muted">Active Accounts</span>
                  <span className="text-sm font-semibold text-green-400">
                    {connectedAccounts.filter((acc: any) => acc.is_active).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tron-text-muted">Ready to Publish</span>
                  <span className="text-sm font-semibold text-tron-cyan">
                    {connectedAccounts.filter((acc: any) => acc.is_active && acc.is_verified).length}
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
                    Your campaigns can now be published to connected social accounts
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
                    <span className="text-sm font-medium text-tron-text">Connection Troubleshooting</span>
                    <ExternalLink className="w-4 h-4 text-tron-text-muted" />
                  </div>
                  <p className="text-xs text-tron-text-muted mt-1">
                    Having trouble connecting accounts?
                  </p>
                </button>
                
                <button className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-tron-text">Publishing Guidelines</span>
                    <ExternalLink className="w-4 h-4 text-tron-text-muted" />
                  </div>
                  <p className="text-xs text-tron-text-muted mt-1">
                    Best practices for social media publishing
                  </p>
                </button>
                
                <button className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-tron-text">Platform Limitations</span>
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
  )
}