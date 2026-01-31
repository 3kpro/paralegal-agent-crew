# Campaign Command Center - Implementation Plan

**Status:** Ready for Development
**Estimated Effort:** 3-5 days (single developer)
**Priority:** High - Core Product Differentiator

---

## Overview

Transform `app/(portal)/dashboard/campaigns/create/page.tsx` from a basic form into a "Viral Prediction Command Center" with real-time scoring, live previews, and AI-powered content variations.

**Reference:** See [New_UI_UX.md](./New_UI_UX.md) for complete design specifications.

---

## Phase 1: Foundation & Dependencies

### Step 1.1: Install Required Packages

```bash
# Run these commands in the project root
cd C:\DEV\3K-Pro-Services\landing-page

# State management
npm install zustand

# Utilities
npm install lodash
npm install -D @types/lodash

# Platform previews
npm install react-tweet

# Animations
npm install framer-motion

# Charts (choose one)
npm install recharts
# OR rely on shadcn/ui Progress component (already installed)
```

**Files Created:** None (package.json updated)

**Verification:**
```bash
npm list zustand lodash react-tweet framer-motion
```

---

### Step 1.2: Create Zustand Store

**File:** `stores/campaign-store.ts`

**Location:** Create new file at root level (next to `app/`, `lib/`, etc.)

**Content:**
```typescript
import { create } from 'zustand';

export type Platform = 'twitter' | 'linkedin' | 'facebook';
export type Goal = 'leads' | 'followers' | 'engagement';

interface CampaignState {
  // Content
  content: string;
  platform: Platform;
  topic: string;
  goal: Goal;

  // Scoring
  localScore: number;
  aiScore: number | null;
  isAIScoring: boolean;

  // Media
  mediaFiles: File[];

  // Actions
  updateContent: (content: string) => void;
  setPlatform: (platform: Platform) => void;
  setTopic: (topic: string) => void;
  setGoal: (goal: Goal) => void;
  updateLocalScore: (score: number) => void;
  updateAIScore: (score: number) => void;
  setIsAIScoring: (isScoring: boolean) => void;
  addMedia: (files: File[]) => void;
  removeMedia: (index: number) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  // Initial state
  content: '',
  platform: 'twitter',
  topic: '',
  goal: 'engagement',
  localScore: 30,
  aiScore: null,
  isAIScoring: false,
  mediaFiles: [],

  // Actions
  updateContent: (content) => set({ content }),
  setPlatform: (platform) => set({ platform }),
  setTopic: (topic) => set({ topic }),
  setGoal: (goal) => set({ goal }),
  updateLocalScore: (score) => set({ localScore: score }),
  updateAIScore: (score) => set({ aiScore: score }),
  setIsAIScoring: (isScoring) => set({ isAIScoring: isScoring }),
  addMedia: (files) => set((state) => ({
    mediaFiles: [...state.mediaFiles, ...files]
  })),
  removeMedia: (index) => set((state) => ({
    mediaFiles: state.mediaFiles.filter((_, i) => i !== index)
  })),
  reset: () => set({
    content: '',
    topic: '',
    localScore: 30,
    aiScore: null,
    mediaFiles: [],
  }),
}));
```

**Checklist:**
- [ ] Create `stores/` directory
- [ ] Create `campaign-store.ts` file
- [ ] Copy store implementation
- [ ] Test import: `import { useCampaignStore } from '@/stores/campaign-store'`

---

### Step 1.3: Create Scoring Utility

**File:** `lib/viral-score-heuristic.ts`

**Location:** Add to existing `lib/` directory

**Content:**
```typescript
/**
 * Local heuristic scoring algorithm
 * Runs instantly in browser without API calls
 * Provides immediate feedback while user types
 */
export function calculateLocalViralScore(text: string): number {
  if (!text || text.trim().length === 0) return 30;

  let score = 30; // Base score

  // Length bonus
  if (text.length > 50) score += 15;
  if (text.length > 100) score += 10;

  // Emotional punctuation (? and !)
  const emotionalPunctuation = text.match(/[?!]/g);
  if (emotionalPunctuation) {
    score += Math.min(emotionalPunctuation.length * 5, 10);
  }

  // Direct address (you/your)
  const directAddress = text.match(/\b(you|your)\b/gi);
  if (directAddress) {
    score += Math.min(directAddress.length * 3, 10);
  }

  // Data/numbers (credibility signals)
  const dataPoints = text.match(/\d+%|\$\d+|#?\d+[KkMm]?/g);
  if (dataPoints) {
    score += Math.min(dataPoints.length * 8, 15);
  }

  // Substantial content (word count)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 20) score += 10;
  if (wordCount > 50) score += 5;

  // Add slight randomness for realism
  score += Math.random() * 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get breakdown of score factors for tooltip display
 */
export function getScoreBreakdown(text: string): Array<{
  label: string;
  points: number;
  status: 'positive' | 'warning' | 'neutral';
}> {
  const breakdown = [];

  // Length check
  if (text.length > 100) {
    breakdown.push({
      label: 'Substantial content',
      points: 25,
      status: 'positive' as const,
    });
  } else if (text.length > 50) {
    breakdown.push({
      label: 'Good length',
      points: 15,
      status: 'positive' as const,
    });
  } else {
    breakdown.push({
      label: 'Content too short',
      points: 0,
      status: 'warning' as const,
    });
  }

  // Emotional hooks
  if (text.match(/[?!]/)) {
    breakdown.push({
      label: 'Emotional hooks detected',
      points: 10,
      status: 'positive' as const,
    });
  }

  // Direct address
  if (text.match(/\b(you|your)\b/gi)) {
    breakdown.push({
      label: 'Direct address (you/your)',
      points: 10,
      status: 'positive' as const,
    });
  }

  // Data points
  if (text.match(/\d+%|\$\d+|#?\d+[KkMm]?/)) {
    breakdown.push({
      label: 'Data/numbers included',
      points: 15,
      status: 'positive' as const,
    });
  } else {
    breakdown.push({
      label: 'Consider adding statistics',
      points: 0,
      status: 'warning' as const,
    });
  }

  return breakdown;
}
```

**Checklist:**
- [ ] Create `lib/viral-score-heuristic.ts` file
- [ ] Copy utility functions
- [ ] Test import and basic functionality

---

## Phase 2: Core Components

### Component Architecture

```
app/(portal)/dashboard/campaigns/create/page.tsx
└── CommandCenterLayout (new component)
    ├── LeftColumn: ConfigPanel
    │   ├── PlatformSelector
    │   ├── TopicInput
    │   └── GoalSelector
    │
    ├── CenterColumn: ContentLab
    │   ├── ContentEditor (textarea)
    │   ├── MediaUploader
    │   └── SuperchargeButton
    │
    └── RightColumn: CrystalBall
        ├── ViralScoreGauge (sticky)
        │   ├── CircularProgress
        │   ├── ScoreBadge
        │   └── ScoreBreakdownTooltip
        │
        └── PlatformPreview
            ├── TwitterPreviewCard (react-tweet)
            ├── LinkedInPreviewCard (custom)
            └── FacebookPreviewCard (custom)
```

---

### Step 2.1: Create Base Layout Component

**File:** `components/campaign/command-center-layout.tsx`

**Location:** Create new directory structure

**Content:**
```typescript
'use client';

import { cn } from '@/lib/utils';

interface CommandCenterLayoutProps {
  leftColumn: React.ReactNode;
  centerColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export function CommandCenterLayout({
  leftColumn,
  centerColumn,
  rightColumn,
}: CommandCenterLayoutProps) {
  return (
    <div className="container mx-auto p-4 lg:p-6">
      {/* Desktop: 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config (20%) */}
        <aside className="lg:col-span-2">
          <div className="space-y-4">
            {leftColumn}
          </div>
        </aside>

        {/* Center Column: Editor (45%) */}
        <main className="lg:col-span-5">
          <div className="space-y-4">
            {centerColumn}
          </div>
        </main>

        {/* Right Column: Preview + Score (35%) */}
        <aside className="lg:col-span-5">
          <div className="space-y-4 lg:sticky lg:top-6">
            {rightColumn}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Create `components/campaign/` directory
- [ ] Create `command-center-layout.tsx`
- [ ] Test responsive behavior at different breakpoints

---

### Step 2.2: Create Viral Score Gauge Component

**File:** `components/campaign/viral-score-gauge.tsx`

**Content:**
```typescript
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, Zap, Sparkles } from 'lucide-react';
import { useCampaignStore } from '@/stores/campaign-store';
import { getScoreBreakdown } from '@/lib/viral-score-heuristic';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function ViralScoreGauge() {
  const { content, localScore, aiScore, isAIScoring } = useCampaignStore();
  const displayScore = aiScore ?? localScore;

  const scoreBreakdown = useMemo(
    () => getScoreBreakdown(content),
    [content]
  );

  // Color coding based on score
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-500';
    if (score >= 41) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Viral Potential';
    if (score >= 41) return 'Good Start';
    return 'Low Reach';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 71) return 'from-green-500 to-emerald-500';
    if (score >= 41) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Viral Score</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Score Breakdown:</p>
                  <ul className="text-sm space-y-1">
                    {scoreBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>
                          {item.status === 'positive' ? '✓' : '⚠️'}
                        </span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Circular Gauge */}
        <div className="flex flex-col items-center space-y-4">
          {/* Score Display */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 70 * (1 - displayScore / 100),
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    className={displayScore >= 71 ? 'text-green-500' : displayScore >= 41 ? 'text-yellow-500' : 'text-red-500'}
                    stopColor="currentColor"
                  />
                  <stop
                    offset="100%"
                    className={displayScore >= 71 ? 'text-emerald-500' : displayScore >= 41 ? 'text-orange-500' : 'text-rose-500'}
                    stopColor="currentColor"
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Text (centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={cn('text-5xl font-bold', getScoreColor(displayScore))}
                key={displayScore}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {displayScore}
              </motion.span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>

          {/* Score Label */}
          <div className="text-center">
            <p className={cn('text-lg font-semibold', getScoreColor(displayScore))}>
              {getScoreLabel(displayScore)}
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap justify-center">
            {isAIScoring && (
              <Badge variant="outline" className="animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                AI Validating...
              </Badge>
            )}

            {aiScore && !isAIScoring && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}

            {!aiScore && !isAIScoring && (
              <Badge variant="secondary">
                Local Analysis
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Checklist:**
- [ ] Create `viral-score-gauge.tsx`
- [ ] Test gauge animation at different score values
- [ ] Verify tooltip displays score breakdown
- [ ] Test badge states (local, AI validating, AI enhanced)

---

### Step 2.3: Create Content Editor Component

**File:** `components/campaign/content-editor.tsx`

**Content:**
```typescript
'use client';

import { useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCampaignStore } from '@/stores/campaign-store';
import { calculateLocalViralScore } from '@/lib/viral-score-heuristic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ContentEditor() {
  const { content, updateContent, updateLocalScore, setIsAIScoring, updateAIScore } = useCampaignStore();

  // Update local score immediately on content change
  useEffect(() => {
    const score = calculateLocalViralScore(content);
    updateLocalScore(score);
  }, [content, updateLocalScore]);

  // Debounced AI scoring (2 seconds after user stops typing)
  const debouncedAIScore = useMemo(
    () => debounce(async (text: string) => {
      if (text.length < 10) return;

      setIsAIScoring(true);
      try {
        // TODO: Replace with actual API call
        // const aiScore = await getViralScoreFromAPI(text);

        // Mock: Simulate AI call with delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockAIScore = calculateLocalViralScore(text) + Math.floor(Math.random() * 10);
        updateAIScore(Math.min(100, mockAIScore));
      } catch (error) {
        console.error('AI scoring failed:', error);
        // Silently fail - keep using local score
      } finally {
        setIsAIScoring(false);
      }
    }, 2000),
    [setIsAIScoring, updateAIScore]
  );

  // Trigger debounced AI scoring on content change
  useEffect(() => {
    debouncedAIScore(content);

    // Cleanup
    return () => {
      debouncedAIScore.cancel();
    };
  }, [content, debouncedAIScore]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  const characterCount = content.length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Lab</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="content">Your Post</Label>
          <Textarea
            id="content"
            placeholder="Start typing your post here... Watch the Viral Score update in real-time!"
            value={content}
            onChange={handleChange}
            className="min-h-[200px] mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Checklist:**
- [ ] Create `content-editor.tsx`
- [ ] Test real-time score updates
- [ ] Verify debouncing works (AI call after 2s pause)
- [ ] Test character and word count display

---

### Step 2.4: Create Platform Preview Components

**File:** `components/campaign/platform-preview.tsx`

**Content:**
```typescript
'use client';

import { useCampaignStore } from '@/stores/campaign-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tweet } from 'react-tweet';

function TwitterPreview({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <p>Your Twitter/X post preview will appear here</p>
      </div>
    );
  }

  // Mock Twitter card (simplified)
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">You</span>
            <span className="text-gray-500">@yourhandle · now</span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap break-words">
            {content}
          </p>
          <div className="flex gap-16 mt-4 text-gray-500">
            <button className="hover:text-blue-500">💬</button>
            <button className="hover:text-green-500">🔁</button>
            <button className="hover:text-red-500">❤️</button>
            <button className="hover:text-blue-500">📊</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <p>Your LinkedIn post preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="flex-1">
          <div className="mb-2">
            <p className="font-semibold text-gray-900">Your Name</p>
            <p className="text-sm text-gray-500">Your Title • 1st</p>
            <p className="text-xs text-gray-400">Just now • 🌎</p>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap break-words">
            {content}
          </p>
          <div className="flex gap-6 mt-4 pt-3 border-t text-gray-600 text-sm">
            <button className="hover:bg-gray-100 px-3 py-1 rounded">👍 Like</button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded">💬 Comment</button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded">🔄 Repost</button>
            <button className="hover:bg-gray-100 px-3 py-1 rounded">📤 Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  const { content, platform } = useCampaignStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Preview</CardTitle>
        <p className="text-sm text-gray-500">See how your post will look</p>
      </CardHeader>
      <CardContent>
        {platform === 'twitter' && <TwitterPreview content={content} />}
        {platform === 'linkedin' && <LinkedInPreview content={content} />}
        {platform === 'facebook' && <LinkedInPreview content={content} />}
      </CardContent>
    </Card>
  );
}
```

**Checklist:**
- [ ] Create `platform-preview.tsx`
- [ ] Test Twitter preview rendering
- [ ] Test LinkedIn preview rendering
- [ ] Verify real-time content updates

---

### Step 2.5: Create Config Panel Components

**File:** `components/campaign/config-panel.tsx`

**Content:**
```typescript
'use client';

import { useCampaignStore, type Platform, type Goal } from '@/stores/campaign-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ConfigPanel() {
  const { platform, setPlatform, topic, setTopic, goal, setGoal } = useCampaignStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selector */}
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
            <SelectTrigger id="platform" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic Input */}
        <div>
          <Label htmlFor="topic">Topic/Niche</Label>
          <Input
            id="topic"
            placeholder="e.g., SaaS Marketing"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Goal Selector */}
        <div>
          <Label htmlFor="goal">Campaign Goal</Label>
          <Select value={goal} onValueChange={(value) => setGoal(value as Goal)}>
            <SelectTrigger id="goal" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leads">Generate Leads</SelectItem>
              <SelectItem value="followers">Grow Followers</SelectItem>
              <SelectItem value="engagement">Boost Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Checklist:**
- [ ] Create `config-panel.tsx`
- [ ] Test platform selection updates
- [ ] Verify topic input works
- [ ] Test goal selection

---

## Phase 3: Integration & Main Page Update

### Step 3.1: Update Main Campaign Create Page

**File:** `app/(portal)/dashboard/campaigns/create/page.tsx`

**Action:** Replace existing content with new Command Center layout

**Content:**
```typescript
import { CommandCenterLayout } from '@/components/campaign/command-center-layout';
import { ConfigPanel } from '@/components/campaign/config-panel';
import { ContentEditor } from '@/components/campaign/content-editor';
import { ViralScoreGauge } from '@/components/campaign/viral-score-gauge';
import { PlatformPreview } from '@/components/campaign/platform-preview';

export default function CreateCampaignPage() {
  return (
    <CommandCenterLayout
      leftColumn={<ConfigPanel />}
      centerColumn={
        <>
          <ContentEditor />
          {/* TODO: Add SuperchargeButton component */}
        </>
      }
      rightColumn={
        <>
          <ViralScoreGauge />
          <PlatformPreview />
        </>
      }
    />
  );
}
```

**Checklist:**
- [ ] Update page.tsx with new layout
- [ ] Test full page renders without errors
- [ ] Verify 3-column layout on desktop
- [ ] Test responsive behavior on mobile

---

## Phase 4: Mobile Experience (FAB)

### Step 4.1: Create Mobile Viral Score FAB

**File:** `components/campaign/mobile-viral-score.tsx`

**Content:**
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCampaignStore } from '@/stores/campaign-store';
import { ViralScoreGauge } from './viral-score-gauge';

export function MobileViralScore() {
  const [isOpen, setIsOpen] = useState(false);
  const { localScore, aiScore } = useCampaignStore();
  const score = aiScore ?? localScore;

  return (
    <>
      {/* Floating Action Button - Only show on mobile */}
      <motion.button
        className="lg:hidden fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
                   bg-gradient-to-br from-purple-600 to-pink-600
                   shadow-lg flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white font-bold text-xl">{score}</span>
      </motion.button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white
                         rounded-t-3xl p-6 max-h-[70vh] overflow-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>

              <ViralScoreGauge />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Checklist:**
- [ ] Create `mobile-viral-score.tsx`
- [ ] Test FAB appears only on mobile
- [ ] Verify bottom sheet animation
- [ ] Test close button functionality

---

### Step 4.2: Add Mobile FAB to Page

Update `app/(portal)/dashboard/campaigns/create/page.tsx`:

```typescript
import { MobileViralScore } from '@/components/campaign/mobile-viral-score';

export default function CreateCampaignPage() {
  return (
    <>
      <CommandCenterLayout
        // ... existing props
      />
      <MobileViralScore />
    </>
  );
}
```

**Checklist:**
- [ ] Add MobileViralScore to page
- [ ] Test on mobile viewport (<768px)
- [ ] Verify FAB hidden on desktop

---

## Phase 5: "Supercharge" Button & Variations Modal

### Step 5.1: Create Supercharge Button Component

**File:** `components/campaign/supercharge-button.tsx`

**Content:**
```typescript
'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaignStore } from '@/stores/campaign-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Variation {
  title: string;
  content: string;
  score: number;
  style: string;
}

export function SuperchargeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { content, updateContent } = useCampaignStore();

  const handleSupercharge = async () => {
    setIsOpen(true);
    setIsGenerating(true);

    try {
      // TODO: Replace with actual AI API call
      // const variations = await generateVariations(content);

      // Mock: Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVariations([
        {
          title: 'The Provocative Hook',
          content: `🔥 ${content}\n\nThis version adds urgency and contrast.`,
          score: 92,
          style: 'Uses emotional triggers and controversy'
        },
        {
          title: 'The Data-Backed Insight',
          content: `📊 Did you know? ${content}\n\nBacked by recent studies.`,
          score: 85,
          style: 'Leverages credibility and statistics'
        },
        {
          title: 'The Storyteller',
          content: `Here's what I learned: ${content}\n\nA personal narrative.`,
          score: 78,
          style: 'Personal connection and relatability'
        },
      ]);
    } catch (error) {
      console.error('Failed to generate variations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyVariation = (variation: Variation) => {
    updateContent(variation.content);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        onClick={handleSupercharge}
        disabled={content.length < 10}
      >
        <Zap className="w-5 h-5 mr-2" />
        Supercharge this Post
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>AI-Powered Variations</DialogTitle>
            <DialogDescription>
              Choose a variation optimized for maximum engagement
            </DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className="py-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Generating variations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variations.map((variation, idx) => (
                <button
                  key={idx}
                  className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  onClick={() => applyVariation(variation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{variation.title}</h3>
                      <p className="text-sm text-gray-500">{variation.style}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Score: {variation.score}
                    </Badge>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mt-3">
                    {variation.content}
                  </p>
                </button>
              ))}

              <button
                className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <h3 className="font-semibold text-lg">Keep Original</h3>
                <p className="text-sm text-gray-500">Continue with your current version</p>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Checklist:**
- [ ] Create `supercharge-button.tsx`
- [ ] Test variations modal opens
- [ ] Verify variation selection updates content
- [ ] Test "Keep Original" option

---

### Step 5.2: Add Supercharge Button to Content Editor

Update `components/campaign/content-editor.tsx`:

```typescript
import { SuperchargeButton } from './supercharge-button';

// In the CardContent, after the Textarea:
<SuperchargeButton />
```

**Checklist:**
- [ ] Add button to ContentEditor
- [ ] Test full flow: type content → click Supercharge → select variation
- [ ] Verify button disabled when content too short

---

## Phase 6: Testing & Polish

### Testing Checklist

**Functional Tests:**
- [ ] Real-time score updates as user types
- [ ] Debounced AI scoring after 2s pause
- [ ] Platform selection changes preview
- [ ] Content updates reflect in preview immediately
- [ ] Variations modal generates and applies content
- [ ] Mobile FAB works correctly
- [ ] Score breakdown tooltip displays correctly

**Responsive Tests:**
- [ ] Desktop (≥1024px): 3-column layout works
- [ ] Tablet (768-1023px): 2-column layout works
- [ ] Mobile (<768px): Single column + FAB works
- [ ] Gauge stickiness works on desktop/tablet
- [ ] Bottom sheet animation smooth on mobile

**Performance Tests:**
- [ ] No lag when typing (local scoring is instant)
- [ ] Debounced API calls fire correctly
- [ ] No excessive re-renders (check React DevTools)
- [ ] Smooth animations at 60fps

**Edge Cases:**
- [ ] Empty content shows appropriate placeholders
- [ ] Very long content (>1000 chars) handles well
- [ ] Network failure for AI scoring degrades gracefully
- [ ] Score never goes below 0 or above 100

---

### Polish Tasks

- [ ] Add loading skeleton for initial page load
- [ ] Add confetti animation when score hits 90+
- [ ] Add sound effect (optional, toggleable) for score milestones
- [ ] Add keyboard shortcut (Cmd/Ctrl + K) for Supercharge
- [ ] Add "First time here?" onboarding tour
- [ ] Add analytics tracking for key interactions

---

## Phase 7: API Integration (Post-MVP)

**Note:** Initially use mock functions. Replace with real APIs when backend is ready.

### Files to Update:

1. **`lib/api/viral-score.ts`** (create new)
   - Replace mock AI scoring with real API call
   - Implement caching strategy with localStorage

2. **`lib/api/generate-variations.ts`** (create new)
   - Replace mock variations with real AI generation
   - Handle rate limiting and errors

3. **Environment Variables:**
   - Add API endpoint URLs to `.env.local`
   - Add API keys for AI services

---

## File Structure Summary

After implementation, your file structure should look like:

```
landing-page/
├── stores/
│   └── campaign-store.ts
│
├── lib/
│   ├── viral-score-heuristic.ts
│   └── api/ (future)
│       ├── viral-score.ts
│       └── generate-variations.ts
│
├── components/
│   └── campaign/
│       ├── command-center-layout.tsx
│       ├── config-panel.tsx
│       ├── content-editor.tsx
│       ├── viral-score-gauge.tsx
│       ├── platform-preview.tsx
│       ├── supercharge-button.tsx
│       └── mobile-viral-score.tsx
│
└── app/
    └── (portal)/
        └── dashboard/
            └── campaigns/
                └── create/
                    └── page.tsx
```

---

## Implementation Timeline

**Day 1: Foundation**
- Install dependencies (Step 1.1)
- Create Zustand store (Step 1.2)
- Create scoring utility (Step 1.3)
- Create layout component (Step 2.1)

**Day 2: Core Components**
- Create Viral Score Gauge (Step 2.2)
- Create Content Editor (Step 2.3)
- Create Platform Preview (Step 2.4)
- Create Config Panel (Step 2.5)

**Day 3: Integration**
- Update main page (Step 3.1)
- Test full integration
- Fix any layout issues

**Day 4: Mobile & Supercharge**
- Create Mobile FAB (Step 4.1-4.2)
- Create Supercharge button (Step 5.1-5.2)
- Test variations flow

**Day 5: Testing & Polish**
- Complete testing checklist (Phase 6)
- Add polish features
- Final QA pass

---

## Success Criteria

✅ **User types in editor, score updates instantly**
✅ **After 2s pause, AI validation kicks in**
✅ **Platform preview updates in real-time**
✅ **Supercharge generates 3 variations with scores**
✅ **Mobile FAB works smoothly**
✅ **All responsive breakpoints work correctly**
✅ **"Xelora Rule" upheld: Every keystroke changes something**

---

## Questions / Issues

If you encounter any issues during implementation:

1. Check that all dependencies are installed
2. Verify imports are correct (use `@/` aliases)
3. Check console for TypeScript errors
4. Test in isolation before integrating

For questions, consult:
- [New_UI_UX.md](./New_UI_UX.md) - Full design specifications
- Component code examples above
- Zustand docs: https://docs.pmnd.rs/zustand/
- Framer Motion docs: https://www.framer.com/motion/

---

**Good luck! This will be amazing. 🚀**
