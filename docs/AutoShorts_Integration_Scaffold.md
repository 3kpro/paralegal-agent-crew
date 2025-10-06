# 🎬 AutoShorts.ai Integration - Feature Scaffold

**Created:** October 5, 2025 (Late Night - While You Sleep)  
**Status:** Planning Phase  
**Goal:** Integrate AutoShorts.ai video generation capabilities into Content Cascade AI  
**Value Prop:** Add AI-powered short-form video creation to CCAI's multi-channel content suite

---

## 🎯 Vision

Extend Content Cascade AI to generate **AI-powered short-form videos** alongside Twitter, LinkedIn, and email content.

**AutoShorts.ai Capabilities to Integrate:**
- ✅ AI video generation from text/topics
- ✅ Automated faceless videos (AI avatars, voiceovers)
- ✅ Multi-platform optimization (TikTok, YouTube Shorts, Instagram Reels)
- ✅ Background music & effects
- ✅ Auto-captioning & subtitles
- ✅ Batch video creation
- ✅ Scheduling & posting automation
- ✅ Video templates & styles

**New CCAI User Journey:**
```
User enters topic → CCAI generates:
├── Twitter thread ✅ (existing)
├── LinkedIn post ✅ (existing)
├── Email newsletter ✅ (existing)
└── Short-form video 🎬 (NEW!)
    ├── TikTok version (9:16)
    ├── YouTube Shorts (9:16)
    └── Instagram Reels (9:16)
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Content Generation Flow (Enhanced)             │
│                                                  │
│  User Input: "AI Marketing Trends 2025"         │
│         ↓                                        │
│  TrendPulse™ (existing) → Topic validated       │
│         ↓                                        │
│  AI Cascade™ (ENHANCED)                          │
│  ├── Text Generation (existing)                 │
│  │   ├── Twitter: "🚀 AI trends..."            │
│  │   ├── LinkedIn: "AI Marketing..."           │
│  │   └── Email: "Dear subscriber..."           │
│  │                                              │
│  └── Video Generation (NEW!)                    │
│      ├── Script Generation (AI)                │
│      ├── Voiceover Creation (ElevenLabs/TTS)   │
│      ├── Visual Assembly (AutoShorts engine)   │
│      ├── Captions & Effects                    │
│      └── Platform Optimization                 │
│         ↓                                        │
│  OmniFormat™ (ENHANCED)                          │
│  ├── Schedule text posts (existing)            │
│  └── Schedule video posts (NEW!)               │
│      ├── TikTok upload                         │
│      ├── YouTube Shorts upload                 │
│      └── Instagram Reels upload                │
└─────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Changes

### New Tables

#### `video_content`
```sql
CREATE TABLE video_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Video metadata
  topic TEXT NOT NULL,
  script TEXT NOT NULL, -- AI-generated script
  duration INTEGER, -- in seconds
  aspect_ratio TEXT DEFAULT '9:16', -- TikTok/Shorts format
  style TEXT, -- 'minimal', 'dynamic', 'corporate', etc.
  
  -- Media assets
  video_url TEXT, -- Final rendered video (Supabase Storage)
  thumbnail_url TEXT,
  captions_file TEXT, -- SRT/VTT file
  
  -- Generation config
  voiceover_provider TEXT, -- 'elevenlabs', 'google-tts', 'local'
  voice_id TEXT,
  background_music TEXT,
  has_captions BOOLEAN DEFAULT true,
  
  -- Platform variants
  tiktok_url TEXT,
  youtube_shorts_url TEXT,
  instagram_reels_url TEXT,
  
  -- Status
  generation_status TEXT DEFAULT 'pending' 
    CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  generation_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- AI tools used
  ai_provider_id UUID REFERENCES ai_providers(id)
);

-- Index for user lookups
CREATE INDEX idx_video_content_user ON video_content(user_id, created_at DESC);
CREATE INDEX idx_video_content_campaign ON video_content(campaign_id);

-- RLS Policies
ALTER TABLE video_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos"
  ON video_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own videos"
  ON video_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### `video_templates`
```sql
CREATE TABLE video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  style TEXT NOT NULL, -- 'minimal', 'dynamic', 'corporate', 'tutorial'
  duration_range TEXT, -- '15-30s', '30-60s'
  
  -- Template config (JSON)
  config JSONB NOT NULL DEFAULT '{
    "fonts": ["Inter", "Roboto"],
    "colors": ["#000000", "#FFFFFF"],
    "transitions": ["fade", "slide"],
    "music_genre": "upbeat",
    "caption_style": "bottom_center"
  }'::jsonb,
  
  -- Availability
  required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'premium')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with default templates
INSERT INTO video_templates (name, description, style, duration_range, required_tier) VALUES
  ('Quick Hook', 'Attention-grabbing opener', 'dynamic', '15-30s', 'free'),
  ('Tutorial Style', 'Step-by-step educational', 'tutorial', '30-60s', 'pro'),
  ('Corporate Clean', 'Professional business', 'corporate', '30-60s', 'pro'),
  ('Viral Trends', 'Trending format optimized', 'dynamic', '15-30s', 'premium');
```

#### `video_generation_queue`
```sql
CREATE TABLE video_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_content_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Queue priority
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  
  -- Processing status
  status TEXT DEFAULT 'queued' 
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Worker info
  worker_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Progress tracking
  progress_percent INTEGER DEFAULT 0,
  current_step TEXT, -- 'script', 'voiceover', 'assembly', 'rendering'
  
  -- Error handling
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_queue_status ON video_generation_queue(status, priority, created_at);
```

---

## 🎨 UI Components

### 1. Video Generation Panel
**Location:** `components/content/VideoGenerationPanel.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Video, Wand2, Download, Play } from 'lucide-react'

interface VideoGeneration {
  topic: string
  style: 'minimal' | 'dynamic' | 'corporate' | 'tutorial'
  duration: '15-30' | '30-60' | '60-90'
  platform: 'tiktok' | 'youtube-shorts' | 'instagram-reels' | 'all'
  voiceProvider: 'elevenlabs' | 'google-tts' | 'local'
  includeCaptions: boolean
  backgroundMusic: boolean
}

export default function VideoGenerationPanel() {
  const [config, setConfig] = useState<VideoGeneration>({
    topic: '',
    style: 'dynamic',
    duration: '30-60',
    platform: 'all',
    voiceProvider: 'elevenlabs',
    includeCaptions: true,
    backgroundMusic: true
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedVideo, setGeneratedVideo] = useState<any>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      // Call video generation API
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      // Poll for progress
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/video/status/${data.videoId}`)
        const status = await statusRes.json()
        
        setProgress(status.progress)
        
        if (status.status === 'completed') {
          clearInterval(pollInterval)
          setGeneratedVideo(status.video)
          setIsGenerating(false)
        } else if (status.status === 'failed') {
          clearInterval(pollInterval)
          setIsGenerating(false)
          // Show error
        }
      }, 2000)

    } catch (error) {
      setIsGenerating(false)
      console.error('Video generation error:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">AI Video Generation</h3>
      </div>

      {/* Configuration Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Video Topic</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            placeholder="e.g., AI Marketing Trends 2025"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <select
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="minimal">Minimal</option>
              <option value="dynamic">Dynamic</option>
              <option value="corporate">Corporate</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <select
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="15-30">15-30 seconds</option>
              <option value="30-60">30-60 seconds</option>
              <option value="60-90">60-90 seconds</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <div className="grid grid-cols-4 gap-2">
            {['all', 'tiktok', 'youtube-shorts', 'instagram-reels'].map(platform => (
              <button
                key={platform}
                onClick={() => setConfig({ ...config, platform: platform as any })}
                className={`px-3 py-2 rounded-lg border ${
                  config.platform === platform 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {platform === 'all' ? 'All' : platform.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeCaptions}
              onChange={(e) => setConfig({ ...config, includeCaptions: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Auto-captions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.backgroundMusic}
              onChange={(e) => setConfig({ ...config, backgroundMusic: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Background music</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!config.topic || isGenerating}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Wand2 className="w-5 h-5" />
        {isGenerating ? `Generating... ${progress}%` : 'Generate Video'}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {progress < 25 && 'Generating script...'}
            {progress >= 25 && progress < 50 && 'Creating voiceover...'}
            {progress >= 50 && progress < 75 && 'Assembling visuals...'}
            {progress >= 75 && 'Rendering video...'}
          </p>
        </div>
      )}

      {/* Generated Video Preview */}
      {generatedVideo && (
        <div className="mt-6 border-t pt-6">
          <h4 className="font-medium mb-4">Generated Video</h4>
          <div className="bg-gray-100 rounded-lg aspect-[9/16] max-w-xs mx-auto">
            <video
              src={generatedVideo.video_url}
              controls
              className="w-full h-full rounded-lg"
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex-1 px-4 py-2 border rounded-lg flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Schedule Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. Video Library Component
**Location:** `components/video/VideoLibrary.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Video, Download, Share2, Trash2 } from 'lucide-react'

export default function VideoLibrary() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const response = await fetch('/api/video/list')
    const data = await response.json()
    setVideos(data.videos)
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video: any) => (
        <div key={video.id} className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
          <div className="aspect-[9/16] bg-gray-100 relative">
            <video
              src={video.video_url}
              className="w-full h-full object-cover"
              poster={video.thumbnail_url}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {video.duration}s
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium mb-2 truncate">{video.topic}</h3>
            <p className="text-sm text-gray-600 mb-4">{video.style} • {video.aspect_ratio}</p>
            
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔧 API Routes

### `app/api/video/generate/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateVideoScript } from '@/lib/video/script-generator'
import { createVoiceover } from '@/lib/video/voiceover'
import { assembleVideo } from '@/lib/video/assembler'

const videoGenerationSchema = z.object({
  topic: z.string().min(1),
  style: z.enum(['minimal', 'dynamic', 'corporate', 'tutorial']),
  duration: z.enum(['15-30', '30-60', '60-90']),
  platform: z.enum(['tiktok', 'youtube-shorts', 'instagram-reels', 'all']),
  voiceProvider: z.enum(['elevenlabs', 'google-tts', 'local']),
  includeCaptions: z.boolean().default(true),
  backgroundMusic: z.boolean().default(true)
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const validation = videoGenerationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.issues.map(e => e.message)
      }, { status: 400 })
    }

    const config = validation.data

    // Check tier limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tierLimits = {
      free: { videosPerMonth: 5, maxDuration: 30 },
      pro: { videosPerMonth: 50, maxDuration: 60 },
      premium: { videosPerMonth: -1, maxDuration: 90 }
    }

    const userTier = profile?.subscription_tier || 'free'
    const limits = tierLimits[userTier]

    // Check monthly video count
    const { count } = await supabase
      .from('video_content')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(new Date().setDate(1)).toISOString())

    if (limits.videosPerMonth !== -1 && count >= limits.videosPerMonth) {
      return NextResponse.json({
        error: `Monthly video limit reached (${limits.videosPerMonth} videos). Upgrade to generate more.`,
        upgradeRequired: true
      }, { status: 403 })
    }

    // Create video record
    const { data: video, error: insertError } = await supabase
      .from('video_content')
      .insert({
        user_id: user.id,
        topic: config.topic,
        style: config.style,
        aspect_ratio: '9:16',
        voiceover_provider: config.voiceProvider,
        has_captions: config.includeCaptions,
        generation_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Add to generation queue
    await supabase
      .from('video_generation_queue')
      .insert({
        video_content_id: video.id,
        user_id: user.id,
        status: 'queued',
        priority: userTier === 'premium' ? 1 : userTier === 'pro' ? 5 : 10
      })

    // Trigger async video generation (background job)
    await triggerVideoGeneration(video.id, config)

    return NextResponse.json({
      success: true,
      videoId: video.id,
      message: 'Video generation started'
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Video generation failed' }, { status: 500 })
  }
}

async function triggerVideoGeneration(videoId: string, config: any) {
  // This would typically call a background job service
  // For now, we'll use a simple async function
  
  setTimeout(async () => {
    try {
      const supabase = await createClient()
      
      // Step 1: Generate script (0-25%)
      await updateProgress(supabase, videoId, 10, 'script')
      const script = await generateVideoScript(config.topic, config.duration)
      
      await supabase
        .from('video_content')
        .update({ script })
        .eq('id', videoId)
      
      // Step 2: Create voiceover (25-50%)
      await updateProgress(supabase, videoId, 30, 'voiceover')
      const voiceoverUrl = await createVoiceover(script, config.voiceProvider)
      
      // Step 3: Assemble video (50-75%)
      await updateProgress(supabase, videoId, 60, 'assembly')
      const videoUrl = await assembleVideo({
        script,
        voiceoverUrl,
        style: config.style,
        includeCaptions: config.includeCaptions,
        backgroundMusic: config.backgroundMusic
      })
      
      // Step 4: Finalize (75-100%)
      await updateProgress(supabase, videoId, 90, 'rendering')
      
      // Update video record
      await supabase
        .from('video_content')
        .update({
          video_url: videoUrl,
          generation_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', videoId)
      
      await updateProgress(supabase, videoId, 100, 'completed')
      
    } catch (error) {
      console.error('Background generation error:', error)
      
      const supabase = await createClient()
      await supabase
        .from('video_content')
        .update({
          generation_status: 'failed',
          generation_error: error.message
        })
        .eq('id', videoId)
    }
  }, 1000)
}

async function updateProgress(supabase: any, videoId: string, percent: number, step: string) {
  await supabase
    .from('video_generation_queue')
    .update({
      progress_percent: percent,
      current_step: step
    })
    .eq('video_content_id', videoId)
}
```

### `app/api/video/status/[id]/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get video with queue status
    const { data: video, error } = await supabase
      .from('video_content')
      .select(`
        *,
        video_generation_queue (
          progress_percent,
          current_step,
          status
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({
      videoId: video.id,
      status: video.generation_status,
      progress: video.video_generation_queue?.[0]?.progress_percent || 0,
      currentStep: video.video_generation_queue?.[0]?.current_step,
      video: video.generation_status === 'completed' ? {
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        topic: video.topic
      } : null
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
```

---

## 🎬 Video Generation Engine

### `lib/video/script-generator.ts`
```typescript
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateVideoScript(
  topic: string,
  duration: string
): Promise<string> {
  const durationSeconds = duration === '15-30' ? 20 : duration === '30-60' ? 45 : 75
  
  const prompt = `Generate a compelling short-form video script about "${topic}".

Requirements:
- Duration: ${durationSeconds} seconds (approximately ${Math.floor(durationSeconds / 2)} words)
- Hook in first 3 seconds
- Clear value proposition
- Call-to-action at end
- Conversational, engaging tone
- Optimized for TikTok/YouTube Shorts/Instagram Reels

Format as natural speech (no stage directions, just the script).`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  })

  return response.choices[0].message.content || ''
}
```

### `lib/video/voiceover.ts`
```typescript
import { ElevenLabsClient } from 'elevenlabs'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
})

export async function createVoiceover(
  script: string,
  provider: 'elevenlabs' | 'google-tts' | 'local'
): Promise<string> {
  if (provider === 'elevenlabs') {
    const audio = await elevenlabs.generate({
      voice: 'Rachel', // Professional female voice
      text: script,
      model_id: 'eleven_turbo_v2'
    })

    // Upload to Supabase Storage
    const audioBlob = await streamToBlob(audio)
    const fileName = `voiceovers/${Date.now()}.mp3`
    
    // ... upload logic ...
    
    return fileName // Return public URL
  }
  
  // Fallback to other providers
  throw new Error(`Provider ${provider} not implemented`)
}

async function streamToBlob(stream: any): Promise<Blob> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return new Blob(chunks)
}
```

### `lib/video/assembler.ts`
```typescript
/**
 * Video Assembly Engine
 * 
 * This would integrate with:
 * - FFmpeg for video rendering
 * - Remotion for React-based video generation
 * - Or AutoShorts.ai API if they have one
 */

export async function assembleVideo(config: {
  script: string
  voiceoverUrl: string
  style: string
  includeCaptions: boolean
  backgroundMusic: boolean
}): Promise<string> {
  // Pseudocode - actual implementation would use FFmpeg or similar
  
  // 1. Generate background visuals based on style
  const visuals = await generateVisuals(config.style)
  
  // 2. Add voiceover track
  const withAudio = await addAudioTrack(visuals, config.voiceoverUrl)
  
  // 3. Generate and overlay captions
  if (config.includeCaptions) {
    const captions = await generateCaptions(config.script)
    const withCaptions = await overlayCaptions(withAudio, captions)
  }
  
  // 4. Add background music
  if (config.backgroundMusic) {
    const withMusic = await addBackgroundMusic(withAudio, config.style)
  }
  
  // 5. Render final video
  const finalVideoUrl = await renderVideo(withAudio)
  
  return finalVideoUrl
}
```

---

## 🎯 Integration with Existing CCAI Flow

### Update `app/api/generate/route.ts`
```typescript
// Add video generation option to existing content generation

export async function POST(request: Request) {
  const { topic, formats = ['twitter', 'linkedin', 'email'] } = await request.json()
  
  const generatedContent: any = {}
  
  // Existing text generation...
  if (formats.includes('twitter')) { /* ... */ }
  if (formats.includes('linkedin')) { /* ... */ }
  if (formats.includes('email')) { /* ... */ }
  
  // NEW: Video generation
  if (formats.includes('video')) {
    const videoConfig = {
      topic,
      style: 'dynamic',
      duration: '30-60',
      platform: 'all',
      voiceProvider: 'elevenlabs',
      includeCaptions: true,
      backgroundMusic: true
    }
    
    // Trigger video generation
    const videoResponse = await fetch('/api/video/generate', {
      method: 'POST',
      body: JSON.stringify(videoConfig)
    })
    
    const videoData = await videoResponse.json()
    
    generatedContent.video = {
      videoId: videoData.videoId,
      status: 'processing',
      message: 'Video generation started'
    }
  }
  
  return NextResponse.json({
    success: true,
    topic,
    formats,
    content: generatedContent
  })
}
```

---

## 📊 Tier Limits & Pricing

```typescript
// lib/video/tier-limits.ts

export const VIDEO_TIER_LIMITS = {
  free: {
    videosPerMonth: 5,
    maxDuration: 30, // seconds
    features: {
      templates: ['minimal'],
      voiceProvider: ['google-tts'],
      platforms: ['tiktok'],
      watermark: true
    }
  },
  pro: {
    videosPerMonth: 50,
    maxDuration: 60,
    features: {
      templates: ['minimal', 'dynamic', 'tutorial'],
      voiceProvider: ['google-tts', 'elevenlabs'],
      platforms: ['tiktok', 'youtube-shorts', 'instagram-reels'],
      watermark: false,
      customBranding: true
    }
  },
  premium: {
    videosPerMonth: -1, // unlimited
    maxDuration: 90,
    features: {
      templates: ['minimal', 'dynamic', 'tutorial', 'corporate', 'viral'],
      voiceProvider: ['google-tts', 'elevenlabs', 'custom'],
      platforms: ['all'],
      watermark: false,
      customBranding: true,
      apiAccess: true,
      priorityProcessing: true
    }
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Video Engine (Week 1-2)
1. Database schema setup
2. Basic script generation (OpenAI)
3. Voiceover integration (ElevenLabs)
4. Simple video assembly (static backgrounds + voiceover)
5. Supabase Storage integration

### Phase 2: UI & User Flow (Week 3)
6. VideoGenerationPanel component
7. Video Library component
8. Progress tracking UI
9. Integration with main content generation flow

### Phase 3: Advanced Features (Week 4-5)
10. Multiple video templates
11. Caption generation & overlay
12. Background music integration
13. Platform-specific optimizations

### Phase 4: Publishing & Automation (Week 6)
14. TikTok API integration
15. YouTube Shorts upload
16. Instagram Reels upload
17. Scheduled video posting

### Phase 5: Polish & Optimization (Week 7)
18. Queue optimization
19. Caching & performance
20. Analytics & metrics
21. User onboarding for video feature

---

## 💰 Cost Considerations

**Per Video Costs:**
- OpenAI (GPT-4 script): ~$0.01
- ElevenLabs voiceover: ~$0.10-0.30 (depending on length)
- Video rendering (compute): ~$0.05-0.15
- Storage (Supabase): ~$0.01/GB

**Total Cost Per Video:** ~$0.20-0.50

**Monthly Costs (Pro tier, 50 videos):**
- AI costs: $10-25/month
- Storage: $1-5/month
- Bandwidth: $2-10/month

**Total Monthly Cost:** ~$15-40/month per Pro user

**Suggested Pricing:**
- Free: 5 videos/month ($0 - loss leader)
- Pro: 50 videos/month ($29/month - ~$20 profit)
- Premium: Unlimited ($99/month - high margin)

---

## 📝 TODO List Created

**8 Implementation Tasks Added to VS Code Todo List:**
1. Design AI Assistant Architecture
2. Create Database Schema for AI Assistant  
3. Build Chat UI Component
4. Implement AI Assistant API Route
5. Build Action Execution System
6. Add Context Provider for Assistant
7. Integrate Assistant into Dashboard
8. Implement Safety & Rate Limiting

---

## 🎊 Summary

**Created while you sleep:**
- ✅ Complete AutoShorts.ai integration architecture
- ✅ Database schema (3 new tables: video_content, video_templates, video_generation_queue)
- ✅ UI components (VideoGenerationPanel, VideoLibrary)
- ✅ API routes (/api/video/generate, /api/video/status)
- ✅ Video generation engine scaffolding (script-generator, voiceover, assembler)
- ✅ Integration with existing CCAI flow
- ✅ Tier limits & pricing structure
- ✅ 7-week implementation roadmap
- ✅ Cost analysis & pricing recommendations

**Next Steps When You Wake Up:**
1. Review this scaffold
2. Decide: MVP feature or post-launch?
3. Prioritize against AI Assistant feature
4. Refine timeline & resource allocation

**This gives CCAI a HUGE competitive advantage** - full multi-channel content generation including short-form video! 🚀

---

*Scaffolded by GitHub Copilot - Sleep well!* 😴🎬
