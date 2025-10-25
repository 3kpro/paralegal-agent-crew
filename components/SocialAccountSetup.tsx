'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Settings, 
  Check, 
  X, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  Shield,
  Zap,
  Users,
  Camera,
  Video,
  RefreshCw,
  Trash2,
  Edit3
} from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  account_name: string
  account_handle?: string
  is_active: boolean
  is_verified: boolean
  connected_at: string
  last_used_at?: string
  account_metadata: any
}

interface SocialPlatform {
  id: string
  name: string
  icon: string
  color: string
  description: string
  features: string[]
  isAvailable: boolean
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'bg-black',
    description: 'Share tweets and threads',
    features: ['Text posts', 'Images', 'Threads', 'Polls'],
    isAvailable: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-600',
    description: 'Professional networking',
    features: ['Articles', 'Posts', 'Company updates', 'Events'],
    isAvailable: true
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-500',
    description: 'Social media posting',
    features: ['Posts', 'Photos', 'Videos', 'Stories'],
    isAvailable: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Visual content sharing',
    features: ['Photos', 'Stories', 'Reels', 'IGTV'],
    isAvailable: true
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    description: 'Short-form videos',
    features: ['Videos', 'Effects', 'Sounds', 'Trends'],
    isAvailable: false
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-600',
    description: 'Video content platform',
    features: ['Videos', 'Shorts', 'Community posts', 'Live streams'],
    isAvailable: false
  }
]

interface SocialAccountSetupProps {
  onAccountsUpdate?: (accounts: SocialAccount[]) => void
  showHeader?: boolean
  compact?: boolean
}

export default function SocialAccountSetup({ 
  onAccountsUpdate, 
  showHeader = true, 
  compact = false 
}: SocialAccountSetupProps) {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCredentialSetup, setShowCredentialSetup] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null)

  useEffect(() => {
    loadSocialAccounts()
  }, [])

  useEffect(() => {
    if (onAccountsUpdate) {
      onAccountsUpdate(accounts)
    }
  }, [accounts, onAccountsUpdate])

  async function loadSocialAccounts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load social accounts:', error)
        return
      }

      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading social accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function connectAccount(platform: SocialPlatform) {
    setConnecting(platform.id)
    try {
      // First, check if the table exists by trying to query it
      const { data: tableCheck, error: tableError } = await supabase
        .from('social_accounts')
        .select('id')
        .limit(1)

      if (tableError) {
        console.error('Table check failed:', tableError)
        alert(`Database table not found. Please run the social accounts migration first. Error: ${tableError.message}`)
        return
      }

      // Show credential setup modal instead of fake OAuth
      setSelectedPlatform(platform)
      setShowCredentialSetup(true)
      
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to open account setup. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  async function saveAccountCredentials(platform: SocialPlatform, credentials: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create account with real credentials
      const accountData = {
        user_id: user.id,
        platform: platform.id,
        account_name: credentials.accountName,
        account_handle: credentials.accountHandle,
        account_id: credentials.accountId || `${platform.id}_${Date.now()}`,
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        is_active: true,
        is_verified: false, // Will be verified when first successful post is made
        account_metadata: {
          api_endpoint: credentials.apiEndpoint,
          rate_limit: credentials.rateLimit,
          setup_date: new Date().toISOString()
        }
      }

      console.log('Saving account credentials for:', platform.name)

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(accountData)
        .select()
        .single()

      if (error) {
        console.error('Failed to save account:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Failed to save account: ${error.message}. Please check the database setup.`)
        throw error
      }

      setAccounts(prev => [data, ...prev])
      alert(`Successfully connected ${platform.name} account!`)
      
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect account. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  async function disconnectAccount(accountId: string) {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId)

      if (error) {
        console.error('Failed to disconnect account:', error)
        return
      }

      setAccounts(prev => prev.filter(acc => acc.id !== accountId))
    } catch (error) {
      console.error('Error disconnecting account:', error)
    }
  }

  async function toggleAccountStatus(accountId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: isActive })
        .eq('id', accountId)

      if (error) {
        console.error('Failed to update account status:', error)
        return
      }

      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, is_active: isActive } : acc
      ))
    } catch (error) {
      console.error('Error updating account status:', error)
    }
  }

  const connectedPlatforms = accounts.map(acc => acc.platform)
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => platform.isAvailable && !connectedPlatforms.includes(platform.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-tron-cyan" />
          <p className="text-tron-text-muted">Loading social accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'}`}>
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
          
          {availablePlatforms.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Connect Account
            </motion.button>
          )}
        </div>
      )}

      {/* Connected Accounts */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 bg-tron-grid border border-tron-cyan/30 rounded-lg">
            <Users className="w-16 h-16 text-tron-cyan/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-tron-text mb-2">No Social Accounts Connected</h3>
            <p className="text-tron-text-muted mb-6">
              Connect your social media accounts to start publishing campaigns
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Connect Your First Account
            </button>
          </div>
        ) : (
          accounts.map((account) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.id === account.platform)
            if (!platform) return null

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {platform.icon}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-tron-text">{account.account_name}</h3>
                        {account.is_verified && (
                          <div className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-tron-text-muted">
                        {account.account_handle} • {platform.name}
                      </p>
                      
                      {account.account_metadata && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-tron-text-muted">
                          {account.account_metadata.followers && (
                            <span>{account.account_metadata.followers.toLocaleString()} followers</span>
                          )}
                          {account.account_metadata.posts && (
                            <span>{account.account_metadata.posts} posts</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={account.is_active}
                        onChange={(e) => toggleAccountStatus(account.id, e.target.checked)}
                        className="w-4 h-4 text-tron-cyan bg-tron-dark border-tron-cyan/30 rounded focus:ring-tron-cyan"
                      />
                      <span className="text-sm text-tron-text-muted">Active</span>
                    </label>

                    <button
                      onClick={() => disconnectAccount(account.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Disconnect account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
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
              <h3 className="text-xl font-semibold text-tron-text">Connect Social Account</h3>
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
                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
                      {platform.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-tron-text">{platform.name}</h4>
                        {connecting === platform.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-tron-cyan" />
                        )}
                      </div>
                      
                      <p className="text-sm text-tron-text-muted mb-2">{platform.description}</p>
                      
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
                <h4 className="text-lg font-semibold text-tron-text mb-2">All Available Platforms Connected</h4>
                <p className="text-tron-text-muted">
                  You've connected all currently available social media platforms.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Credential Setup Modal */}
      {showCredentialSetup && selectedPlatform && (
        <CredentialSetupModal
          platform={selectedPlatform}
          onSave={(credentials) => {
            saveAccountCredentials(selectedPlatform, credentials)
            setShowCredentialSetup(false)
            setSelectedPlatform(null)
          }}
          onCancel={() => {
            setShowCredentialSetup(false)
            setSelectedPlatform(null)
          }}
        />
      )}
    </div>
  )
}

// Credential Setup Modal Component
function CredentialSetupModal({
  platform,
  onSave,
  onCancel
}: {
  platform: SocialPlatform
  onSave: (credentials: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    accountName: '',
    accountHandle: '',
    accessToken: '',
    refreshToken: '',
    apiEndpoint: '',
    additionalData: ''
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save credentials:', error)
      alert('Failed to save account credentials. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getSetupInstructions = () => {
    switch (platform.id) {
      case 'twitter':
        return {
          title: 'Twitter/X API Setup',
          instructions: [
            '1. Go to developer.twitter.com and create an app',
            '2. Generate API keys and tokens',
            '3. Copy your Bearer Token or Access Token',
            '4. Enter your account handle (e.g., @username)'
          ],
          fields: {
            accessToken: 'Bearer Token or Access Token',
            accountHandle: 'Your Twitter handle (e.g., @username)',
            accountName: 'Display name for this account'
          }
        }
      case 'linkedin':
        return {
          title: 'LinkedIn API Setup',
          instructions: [
            '1. Create a LinkedIn app at developers.linkedin.com',
            '2. Get your Access Token',
            '3. Note your company/personal page ID',
            '4. Ensure posting permissions are enabled'
          ],
          fields: {
            accessToken: 'LinkedIn Access Token',
            accountHandle: 'LinkedIn profile URL or handle',
            accountName: 'Display name for this account'
          }
        }
      default:
        return {
          title: `${platform.name} Setup`,
          instructions: [
            '1. Visit the developer console for this platform',
            '2. Create an application and get API credentials',
            '3. Copy the access token or API key',
            '4. Enter your account information'
          ],
          fields: {
            accessToken: 'API Key or Access Token',
            accountHandle: 'Account handle or username',
            accountName: 'Display name for this account'
          }
        }
    }
  }

  const setupInfo = getSetupInstructions()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg font-bold`}>
              {platform.icon}
            </div>
            <h3 className="text-xl font-semibold text-tron-text">{setupInfo.title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-tron-text-muted hover:text-tron-text transition-colors"
            title="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Setup Instructions:</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            {setupInfo.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tron-text mb-2">
              {setupInfo.fields.accountName}
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              className="w-full px-3 py-2 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text-muted focus:border-tron-cyan focus:outline-none"
              placeholder="My Business Account"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tron-text mb-2">
              {setupInfo.fields.accountHandle}
            </label>
            <input
              type="text"
              value={formData.accountHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, accountHandle: e.target.value }))}
              className="w-full px-3 py-2 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text-muted focus:border-tron-cyan focus:outline-none"
              placeholder={platform.id === 'twitter' ? '@username' : 'account-handle'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tron-text mb-2">
              {setupInfo.fields.accessToken}
            </label>
            <textarea
              value={formData.accessToken}
              onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
              className="w-full px-3 py-2 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text-muted focus:border-tron-cyan focus:outline-none h-24"
              placeholder="Paste your API token here..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-tron-grid text-tron-text-muted rounded-lg hover:bg-tron-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-tron-cyan text-black rounded-lg hover:bg-tron-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}