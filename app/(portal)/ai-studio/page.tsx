'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Brain,
  Wand2,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  Copy,
  Download,
  BarChart3,
  Zap,
  Target,
  Layers,
  Shuffle,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit3,
  Trash2,
  Star
} from 'lucide-react'

interface AIProvider {
  id: string
  name: string
  type: string
  enabled: boolean
  priority: number
  icon: string
  description: string
  costPer1kTokens?: number
}

interface PromptTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  usage_count: number
  average_quality: number
}

interface GenerationRequest {
  id: string
  provider: string
  model: string
  prompt: string
  content: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processingTime: number
  qualityScore: number
  tokensUsed: number
  cost: number
  timestamp: Date
}

export default function AIStudioPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'variations' | 'analytics'>('generate')
  
  // AI Providers state
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'gemini',
      name: 'Google Gemini',
      type: 'text_generation',
      enabled: true,
      priority: 1,
      icon: '🤖',
      description: 'High-quality content generation with excellent reasoning',
      costPer1kTokens: 0.002
    },
    {
      id: 'lm_studio',
      name: 'LM Studio',
      type: 'text_generation',
      enabled: true,
      priority: 2,
      icon: '💻',
      description: 'Local AI models with no API costs',
      costPer1kTokens: 0
    }
  ])

  // Generation state
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['gemini'])
  const [generationMode, setGenerationMode] = useState<'single' | 'multiple' | 'comparison'>('single')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResults, setGenerationResults] = useState<GenerationRequest[]>([])

  // Templates state
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAuth()
    loadTemplates()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadTemplates() {
    try {
      const response = await fetch('/api/ai-studio/templates')
      const result = await response.json()
      if (result.success) {
        setTemplates(result.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  async function generateContent() {
    if (!currentPrompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    const newResults: GenerationRequest[] = []

    try {
      for (const providerId of selectedProviders) {
        const provider = providers.find(p => p.id === providerId)
        if (!provider?.enabled) continue

        const startTime = Date.now()
        const requestId = crypto.randomUUID()

        // Add pending request
        const pendingRequest: GenerationRequest = {
          id: requestId,
          provider: provider.name,
          model: provider.id === 'gemini' ? 'gemini-pro' : 'local-model',
          prompt: currentPrompt,
          content: '',
          status: 'processing',
          processingTime: 0,
          qualityScore: 0,
          tokensUsed: 0,
          cost: 0,
          timestamp: new Date()
        }
        
        newResults.push(pendingRequest)
        setGenerationResults(prev => [...prev, pendingRequest])

        try {
          // Make API call to generate content
          const response = await fetch('/api/ai-studio/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: provider.id,
              model: pendingRequest.model,
              prompt: currentPrompt,
              session_id: 'default' // TODO: Implement session management
            })
          })

          const result = await response.json()
          const processingTime = Date.now() - startTime

          if (result.success) {
            // Update with successful result
            const updatedRequest: GenerationRequest = {
              ...pendingRequest,
              content: result.content,
              status: 'completed',
              processingTime,
              qualityScore: result.quality_score || 4.0,
              tokensUsed: result.tokens_used || 0,
              cost: result.cost_estimate || 0
            }

            setGenerationResults(prev => 
              prev.map(r => r.id === requestId ? updatedRequest : r)
            )
          } else {
            // Update with error
            setGenerationResults(prev => 
              prev.map(r => r.id === requestId ? {
                ...r,
                status: 'failed',
                processingTime,
                content: result.error || 'Generation failed'
              } : r)
            )
          }
        } catch (error) {
          // Handle individual provider error
          console.error(`Generation failed for ${provider.name}:`, error)
          setGenerationResults(prev => 
            prev.map(r => r.id === requestId ? {
              ...r,
              status: 'failed',
              processingTime: Date.now() - startTime,
              content: 'Network error or provider unavailable'
            } : r)
          )
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  function applyTemplate(template: PromptTemplate) {
    setSelectedTemplate(template)
    
    // Initialize template variables
    const variables: Record<string, string> = {}
    template.variables.forEach(variable => {
      variables[variable] = ''
    })
    setTemplateVariables(variables)
  }

  function buildPromptFromTemplate() {
    if (!selectedTemplate) return

    let prompt = selectedTemplate.template
    Object.entries(templateVariables).forEach(([variable, value]) => {
      prompt = prompt.replace(new RegExp(`{${variable}}`, 'g'), value)
    })
    setCurrentPrompt(prompt)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tron-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tron-text-muted">Loading AI Studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tron-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tron-text flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                AI Studio
              </h1>
              <p className="text-tron-text-muted mt-2">
                Advanced content generation with multiple AI providers orchestration
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure Providers
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Provider Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4 mb-6"
        >
          <h3 className="text-sm font-semibold text-tron-text mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-tron-cyan" />
            Active AI Providers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between bg-tron-dark/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{provider.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-tron-text">{provider.name}</div>
                    <div className="text-xs text-tron-text-muted">
                      {provider.costPer1kTokens === 0 ? 'Free' : `$${provider.costPer1kTokens}/1k tokens`}
                    </div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-tron-grid rounded-lg p-1 mb-6">
          {[
            { key: 'generate', label: 'Generate', icon: Wand2 },
            { key: 'templates', label: 'Templates', icon: Layers },
            { key: 'variations', label: 'Variations', icon: Shuffle },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-tron-cyan text-tron-dark font-semibold'
                  : 'text-tron-text-muted hover:text-tron-text hover:bg-tron-dark/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'generate' && (
            <GenerateView
              currentPrompt={currentPrompt}
              setCurrentPrompt={setCurrentPrompt}
              selectedProviders={selectedProviders}
              setSelectedProviders={setSelectedProviders}
              providers={providers}
              generationMode={generationMode}
              setGenerationMode={setGenerationMode}
              isGenerating={isGenerating}
              generateContent={generateContent}
              generationResults={generationResults}
              templates={templates}
              applyTemplate={applyTemplate}
              selectedTemplate={selectedTemplate}
              templateVariables={templateVariables}
              setTemplateVariables={setTemplateVariables}
              buildPromptFromTemplate={buildPromptFromTemplate}
            />
          )}
          {activeTab === 'templates' && <TemplatesView templates={templates} onTemplateUpdate={loadTemplates} />}
          {activeTab === 'variations' && <VariationsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </motion.div>
      </div>
    </div>
  )
}

// Generate View Component
function GenerateView({
  currentPrompt,
  setCurrentPrompt,
  selectedProviders,
  setSelectedProviders,
  providers,
  generationMode,
  setGenerationMode,
  isGenerating,
  generateContent,
  generationResults,
  templates,
  applyTemplate,
  selectedTemplate,
  templateVariables,
  setTemplateVariables,
  buildPromptFromTemplate
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Input */}
      <div className="lg:col-span-1 space-y-6">
        {/* Template Selection */}
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-tron-cyan" />
            Quick Templates
          </h3>
          <div className="space-y-2">
            {templates.slice(0, 5).map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full text-left p-3 bg-tron-dark/50 rounded-lg hover:bg-tron-dark/70 transition-colors border border-tron-cyan/20"
              >
                <div className="font-medium text-sm text-tron-text">{template.name}</div>
                <div className="text-xs text-tron-text-muted">{template.category}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-tron-text-muted">{template.average_quality.toFixed(1)}</span>
                  <span className="text-xs text-tron-text-muted">•</span>
                  <span className="text-xs text-tron-text-muted">{template.usage_count} uses</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Variables */}
        {selectedTemplate && (
          <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-tron-text mb-4">Template Variables</h3>
            <div className="space-y-3">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable}>
                  <label className="text-sm font-medium text-tron-text mb-1 block">{variable}</label>
                  <input
                    type="text"
                    value={templateVariables[variable] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full p-3 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder:text-tron-text-muted focus:border-tron-cyan focus:outline-none"
                    placeholder={`Enter ${variable}...`}
                  />
                </div>
              ))}
              <button
                onClick={buildPromptFromTemplate}
                className="w-full bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Apply Template
              </button>
            </div>
          </div>
        )}

        {/* Provider Selection */}
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4">AI Providers</h3>
          <div className="space-y-3">
            {providers.filter(p => p.enabled).map((provider) => (
              <label key={provider.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedProviders.includes(provider.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProviders(prev => [...prev, provider.id])
                    } else {
                      setSelectedProviders(prev => prev.filter(id => id !== provider.id))
                    }
                  }}
                  className="w-4 h-4 text-tron-cyan bg-tron-dark border-tron-cyan/30 rounded focus:ring-tron-cyan"
                />
                <span className="text-lg">{provider.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tron-text">{provider.name}</div>
                  <div className="text-xs text-tron-text-muted">{provider.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Column - Prompt Input */}
      <div className="lg:col-span-1">
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 h-full">
          <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-tron-cyan" />
            Prompt Input
          </h3>
          
          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Enter your prompt here... Use templates or write custom prompts for content generation."
            rows={12}
            className="w-full p-4 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder:text-tron-text-muted focus:border-tron-cyan focus:outline-none resize-none"
          />
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-tron-text-muted">
              {currentPrompt.length} characters
            </div>
            <button
              onClick={generateContent}
              disabled={isGenerating || !currentPrompt.trim() || selectedProviders.length === 0}
              className="bg-tron-cyan hover:bg-tron-cyan/80 disabled:bg-tron-cyan/30 disabled:cursor-not-allowed text-tron-dark px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-1">
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-tron-cyan" />
            Generation Results
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generationResults.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-tron-cyan/50 mx-auto mb-3" />
                <p className="text-tron-text-muted">Generated content will appear here</p>
              </div>
            ) : (
              generationResults.map((result) => (
                <div key={result.id} className="bg-tron-dark/50 rounded-lg p-4 border border-tron-cyan/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-tron-text">{result.provider}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        result.status === 'completed' ? 'bg-green-400' :
                        result.status === 'failed' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`}></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'completed' && (
                        <>
                          <button 
                            className="text-tron-cyan hover:text-tron-cyan/80"
                            title="Copy content"
                            aria-label="Copy content"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-tron-cyan hover:text-tron-cyan/80"
                            title="Save content"
                            aria-label="Save content"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {result.status === 'processing' ? (
                    <div className="flex items-center gap-2 text-tron-text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating content...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-tron-text-muted mb-3 max-h-32 overflow-y-auto">
                      {result.content}
                    </div>
                  )}
                  
                  {result.status === 'completed' && (
                    <div className="flex items-center gap-4 text-xs text-tron-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.processingTime}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {result.qualityScore.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${result.cost.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function TemplatesView({ templates, onTemplateUpdate }: any) {
  return (
    <div className="text-center py-12">
      <Layers className="w-16 h-16 text-tron-cyan/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-tron-text mb-2">Template Management</h3>
      <p className="text-tron-text-muted">Create and manage your prompt templates</p>
    </div>
  )
}

function VariationsView() {
  return (
    <div className="text-center py-12">
      <Shuffle className="w-16 h-16 text-tron-cyan/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-tron-text mb-2">Content Variations</h3>
      <p className="text-tron-text-muted">A/B testing and content optimization tools</p>
    </div>
  )
}

function AnalyticsView() {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 text-tron-cyan/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-tron-text mb-2">AI Analytics</h3>
      <p className="text-tron-text-muted">Performance insights and usage statistics</p>
    </div>
  )
}