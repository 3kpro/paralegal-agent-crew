# Reactor Landing Page Redesign

## Task: Build a Minimalistic "Coming Soon" Landing Page

**Assigned to:** Gemini
**Priority:** High
**Branch:** `feature/reactor-landing`

---

## Current Problem

The current `/ai-studio` page uses a dark transparent overlay on top of a full feature page. This looks unprofessional and cluttered. We need a dedicated, clean landing page that builds anticipation.

**Current file:** `app/(portal)/ai-studio/page.tsx`

---

## Design Requirements

### Visual Style
- **Minimalistic** - Clean, focused, no clutter
- **Dark theme** - Match XELORA aesthetic (#0a0a0a base)
- **Professional** - Subtle animations, not flashy
- **Use BGPattern** - Dots pattern like other pages

### Key Elements

#### 1. Hero Section (Top 60% of viewport)
```
┌────────────────────────────────────────────────┐
│                                                │
│              [Brain Icon - Animated]           │
│                                                │
│                   REACTOR                      │
│           (gradient text: coral → purple)      │
│                                                │
│     "50+ AI Models. One Interface."            │
│                                                │
│          [Coming Soon Badge - Pill]            │
│                                                │
│   "The AI orchestration layer for creators"   │
│                                                │
└────────────────────────────────────────────────┘
```

#### 2. AI Provider Logos (Horizontal Strip)
```
┌────────────────────────────────────────────────┐
│   Powered by the best AI providers             │
│                                                │
│   [OpenAI] [Anthropic] [Google] [Meta]        │
│   [Mistral] [Cohere]   [Groq]   [Perplexity]  │
│                                                │
│   (Grayscale logos, subtle hover glow)         │
└────────────────────────────────────────────────┘
```

#### 3. Feature Teaser (3 columns, minimal)
```
┌──────────────┬──────────────┬──────────────┐
│  Multi-Model │  Smart       │  Cost        │
│  Switching   │  Routing     │  Control     │
│              │              │              │
│  Best AI for │  Auto-select │  Track usage │
│  each task   │  by prompt   │  & optimize  │
└──────────────┴──────────────┴──────────────┘
```

#### 4. Email Capture (Optional - Simple)
```
┌────────────────────────────────────────────────┐
│        Get notified when Reactor launches      │
│                                                │
│   [Email input............] [Notify Me]        │
│                                                │
└────────────────────────────────────────────────┘
```

#### 5. Footer Tagline
```
┌────────────────────────────────────────────────┐
│      "Unlimited creativity. Controlled cost."  │
└────────────────────────────────────────────────┘
```

---

## Technical Specifications

### File Structure
- Keep in `app/(portal)/ai-studio/page.tsx` (same route)
- Remove all the current overlay code
- Remove the detailed provider cards (keep data for future)

### Components to Use
- `BGPattern` from `@/components/ui/bg-pattern`
- `motion` from `framer-motion` (subtle animations only)
- `Brain` icon from `@phosphor-icons/react`
- `Image` from `next/image` for provider logos

### Provider Logos (Already Exist)
```
/public/brands/openai.png
/public/brands/anthropic.png
/public/brands/google.png
/public/brands/meta.png
/public/brands/mistral.png
/public/brands/cohere.png
/public/brands/groq.png
/public/brands/perplexity.png
```

### Colors
```css
--background: #0a0a0a
--coral: #FF6B6B (coral-500)
--purple: #A17CF9
--cyan: #00C7F2
--text: #F5F7FA
--muted: #6B7280
```

### Animations (Subtle)
- Brain icon: Slow pulse (2s, infinite)
- Provider logos: Slight scale on hover (1.05)
- Page load: Fade in from opacity 0 to 1 (0.6s)
- No bouncing, no flying in, no flashy effects

---

## Code Template

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Brain, Lightning as Zap, Target, CurrencyDollar as DollarSign } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";

const AI_PROVIDERS = [
  { name: "OpenAI", logo: "/brands/openai.png" },
  { name: "Anthropic", logo: "/brands/anthropic.png" },
  { name: "Google", logo: "/brands/google.png" },
  { name: "Meta", logo: "/brands/meta.png" },
  { name: "Mistral", logo: "/brands/mistral.png" },
  { name: "Cohere", logo: "/brands/cohere.png" },
  { name: "Groq", logo: "/brands/groq.png" },
  { name: "Perplexity", logo: "/brands/perplexity.png" },
];

const FEATURES = [
  { icon: Zap, title: "Multi-Model", desc: "Best AI for each task" },
  { icon: Target, title: "Smart Routing", desc: "Auto-select by prompt" },
  { icon: DollarSign, title: "Cost Control", desc: "Track & optimize spend" },
];

export default function ReactorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background */}
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.1)"
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Brain Icon */}
          <Brain
            className="w-20 h-20 mx-auto mb-6 text-coral-400 animate-pulse"
            weight="duotone"
          />

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-coral-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Reactor
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-gray-300 mb-6">
            50+ AI Models. One Interface.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-coral-500/10 border border-coral-500/30 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
            </span>
            <span className="text-coral-300 font-medium">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
            The AI orchestration layer for creators. Mix and match providers for optimal results, speed, and cost.
          </p>
        </motion.div>

        {/* Provider Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
            Powered by leading AI providers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {AI_PROVIDERS.map((provider) => (
              <div
                key={provider.name}
                className="relative w-10 h-10 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white/5 border border-white/10 rounded-xl"
            >
              <feature.icon className="w-8 h-8 text-coral-400 mb-3 mx-auto" weight="duotone" />
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-gray-500 text-sm italic"
        >
          "Unlimited creativity. Controlled cost."
        </motion.p>
      </div>
    </div>
  );
}
```

---

## What to Remove

From current page, DELETE:
- The dark overlay (`bg-black/60 backdrop-blur-sm`)
- All the detailed provider cards with models/speed/cost
- The AI_CAPABILITIES array and cards
- The "What You'll Create" section
- The Coming Soon Features section at bottom
- All the complex state management

---

## What to Keep

- Auth check (redirect to login if not authenticated)
- Loading state with OrbitalLoader
- BGPattern component usage
- Provider logo images (just display them simpler)

---

## Success Criteria

1. Page loads clean, no overlay
2. Centered, focused hero section
3. Provider logos visible and professional
4. Works on mobile (responsive)
5. Matches XELORA brand aesthetic
6. User understands "Coming Soon" immediately
7. Page feels premium, not rushed

---

## Reference

Look at these for inspiration:
- Linear.app "Coming Soon" pages
- Vercel feature announcement pages
- Stripe product pages (minimal, focused)

---

## Deadline

Complete before next deploy cycle.

---

*Created: January 2026*
*Author: Claude (for Gemini handoff)*
