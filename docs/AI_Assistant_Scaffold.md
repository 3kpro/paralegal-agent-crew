# 🤖 Dashboard AI Assistant - Feature Scaffold

**Created:** October 5, 2025 (Late Night)  
**Status:** Planning Phase  
**Inspiration:** Supabase-style embedded AI assistant  
**Goal:** Give every user a personal AI assistant in their dashboard

---

## 🎯 Vision

Every user gets an **intelligent AI assistant** embedded in their portal dashboard that can:
- Answer questions about their campaigns
- Make changes to campaigns based on natural language requests
- Generate content on demand
- Analyze performance and suggest optimizations
- Configure AI tools and settings
- Provide onboarding guidance

**Think:** Supabase AI Assistant, but for content marketing campaigns.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Portal Dashboard (User Interface)              │
│  ┌──────────────────────────────────────────┐   │
│  │  Floating Assistant Button (bottom-right) │   │
│  │  ↓                                        │   │
│  │  Slide-in Chat Panel                     │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │ Conversation History               │  │   │
│  │  │ - Past conversations list          │  │   │
│  │  │ - "New Conversation" button        │  │   │
│  │  ├────────────────────────────────────┤  │   │
│  │  │ Message Thread                     │  │   │
│  │  │ - User messages (right)            │  │   │
│  │  │ - Assistant messages (left)        │  │   │
│  │  │ - Action execution feedback        │  │   │
│  │  │ - Typing indicator                 │  │   │
│  │  ├────────────────────────────────────┤  │   │
│  │  │ Input Field                        │  │   │
│  │  │ [Type your message...] [Send]      │  │   │
│  │  └────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  API Layer (/api/assistant/chat)                │
│  1. Receive user message                        │
│  2. Load user context (campaigns, settings)     │
│  3. Call AI provider (OpenAI/Anthropic)         │
│  4. Parse function calls (actions)              │
│  5. Execute actions (if requested)              │
│  6. Return response (streaming)                 │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Action Execution Layer                         │
│  - createCampaign(name, platforms, schedule)    │
│  - editCampaign(id, updates)                    │
│  - generateContent(topic, format)               │
│  - schedulePosts(campaignId, times)             │
│  - updateAITools(providerId, apiKey)            │
│  - analyzePerformance(campaignId)               │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Database (Supabase)                            │
│  - assistant_conversations                      │
│  - assistant_messages                           │
│  - assistant_actions (audit log)                │
│  - campaigns (modified by assistant)            │
│  - user_ai_tools (configured by assistant)      │
└─────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### `assistant_conversations`
```sql
CREATE TABLE assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON assistant_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON assistant_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### `assistant_messages`
```sql
CREATE TABLE assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store function calls, action results, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast conversation loading
CREATE INDEX idx_messages_conversation ON assistant_messages(conversation_id, created_at);

-- RLS Policies
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON assistant_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assistant_conversations
      WHERE id = assistant_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add messages to own conversations"
  ON assistant_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assistant_conversations
      WHERE id = assistant_messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

### `assistant_actions`
```sql
CREATE TABLE assistant_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES assistant_messages(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'create_campaign', 'edit_campaign', etc.
  parameters JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE assistant_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions"
  ON assistant_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assistant_conversations
      WHERE id = assistant_actions.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## 🎨 UI Components

### 1. `components/assistant/AssistantButton.tsx`
```typescript
'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import AssistantPanel from './AssistantPanel'

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating button (bottom-right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Slide-in panel */}
      {isOpen && (
        <AssistantPanel onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
```

### 2. `components/assistant/AssistantPanel.tsx`
```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Plus } from 'lucide-react'
import { useAssistant } from '@/hooks/useAssistant'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: Action[]
}

interface Action {
  type: string
  status: 'pending' | 'success' | 'failed'
  result?: any
}

export default function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { sendMessage, conversations, createConversation } = useAssistant()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(input)
      
      setMessages(prev => [...prev, {
        id: response.id,
        role: 'assistant',
        content: response.content,
        actions: response.actions
      }])
    } catch (error) {
      console.error('Assistant error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={createConversation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Hi! I'm your AI assistant.</p>
            <p className="text-sm mt-2">I can help you:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Create and edit campaigns</li>
              <li>• Generate content</li>
              <li>• Analyze performance</li>
              <li>• Configure AI tools</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Show action results */}
              {message.actions?.map((action, idx) => (
                <div key={idx} className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <p className="text-xs opacity-75">
                    {action.type}: {action.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3. `hooks/useAssistant.ts`
```typescript
'use client'

import { useState, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: any[]
}

export function useAssistant() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])

  const sendMessage = useCallback(async (content: string) => {
    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: currentConversationId,
        message: content
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const data = await response.json()
    return data
  }, [currentConversationId])

  const createConversation = useCallback(async () => {
    const response = await fetch('/api/assistant/conversations', {
      method: 'POST'
    })

    const data = await response.json()
    setCurrentConversationId(data.id)
    return data
  }, [])

  return {
    sendMessage,
    conversations,
    createConversation
  }
}
```

---

## 🔧 API Routes

### `app/api/assistant/chat/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Function definitions for AI to call
const functions = [
  {
    name: 'create_campaign',
    description: 'Create a new content campaign',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        platforms: { type: 'array', items: { type: 'string' } },
        schedule: { type: 'string' }
      },
      required: ['name', 'platforms']
    }
  },
  {
    name: 'generate_content',
    description: 'Generate content for a topic',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        format: { type: 'string', enum: ['twitter', 'linkedin', 'email'] }
      },
      required: ['topic', 'format']
    }
  },
  // Add more functions...
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, message } = await request.json()

    // Load user context
    const context = await loadUserContext(supabase, user.id)

    // Get conversation history
    const { data: messages } = await supabase
      .from('assistant_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    // Build system prompt with context
    const systemPrompt = `You are an AI assistant for Content Cascade AI. 
User context:
- Subscription: ${context.tier}
- Campaigns: ${context.campaigns.length}
- AI Tools: ${context.aiTools.map(t => t.name).join(', ')}

You can help with:
- Creating and managing campaigns
- Generating content
- Analyzing performance
- Configuring AI tools

Be conversational and helpful. When making changes, confirm with the user first.`

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
        { role: 'user', content: message }
      ],
      functions,
      function_call: 'auto'
    })

    const assistantMessage = response.choices[0].message

    // Execute function calls if requested
    let functionResults = []
    if (assistantMessage.function_call) {
      const result = await executeAction(
        supabase,
        user.id,
        assistantMessage.function_call.name,
        JSON.parse(assistantMessage.function_call.arguments)
      )
      functionResults.push(result)
    }

    // Save messages to database
    await supabase.from('assistant_messages').insert([
      {
        conversation_id: conversationId,
        role: 'user',
        content: message
      },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage.content,
        metadata: { functionResults }
      }
    ])

    return NextResponse.json({
      id: crypto.randomUUID(),
      content: assistantMessage.content,
      actions: functionResults
    })

  } catch (error) {
    console.error('Assistant error:', error)
    return NextResponse.json({ error: 'Assistant error' }, { status: 500 })
  }
}

async function loadUserContext(supabase: any, userId: string) {
  const [profile, campaigns, aiTools] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('campaigns').select('*').eq('user_id', userId),
    supabase.from('user_ai_tools').select('*, ai_providers(*)').eq('user_id', userId)
  ])

  return {
    tier: profile.data?.subscription_tier || 'free',
    campaigns: campaigns.data || [],
    aiTools: aiTools.data || []
  }
}

async function executeAction(supabase: any, userId: string, action: string, params: any) {
  // Execute the action based on type
  switch (action) {
    case 'create_campaign':
      // Insert campaign
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          name: params.name,
          platforms: params.platforms,
          schedule: params.schedule
        })
        .select()
        .single()
      
      return {
        type: 'create_campaign',
        status: error ? 'failed' : 'success',
        result: data,
        error: error?.message
      }

    case 'generate_content':
      // Call content generation API
      // ... implementation
      break

    // Add more action handlers...
  }
}
```

---

## 🛡️ Safety & Security

### 1. Rate Limiting
```typescript
// lib/assistant/rate-limit.ts
export const RATE_LIMITS = {
  free: { messages: 10, period: 'day' },
  pro: { messages: 100, period: 'day' },
  premium: { messages: -1, period: 'unlimited' } // unlimited
}

export async function checkRateLimit(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limit = RATE_LIMITS[tier]

  if (limit.messages === -1) return true // unlimited

  const { count } = await supabase
    .from('assistant_messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000))

  return count < limit.messages
}
```

### 2. Action Confirmation
```typescript
// For destructive actions, require confirmation
const REQUIRES_CONFIRMATION = [
  'delete_campaign',
  'update_tier',
  'remove_ai_tool'
]

if (REQUIRES_CONFIRMATION.includes(action)) {
  return {
    type: 'confirmation_required',
    action,
    params,
    message: `Are you sure you want to ${action}?`
  }
}
```

### 3. Audit Logging
```typescript
// Log all actions to assistant_actions table
await supabase.from('assistant_actions').insert({
  conversation_id,
  message_id,
  action_type: action,
  parameters: params,
  status: 'success',
  result: actionResult
})
```

---

## 🎯 Example Conversations

### Example 1: Create Campaign
```
User: "Create a new campaign for my product launch on Twitter and LinkedIn"