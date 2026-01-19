# 🚀 Handoff: Campaign Creation UI/UX Overhaul

**Context:** The current campaign creation flow functions like a standard form.
**Objective:** Transform the UI into a **"Viral Prediction Command Center."** The user must feel like they are engineering virality, not just filling out text boxes.

---

## 1. High-Level Layout: The "Command Center" (3-Column)

**Grid Architecture:**
Refactor the main page layout (`app/(portal)/dashboard/campaigns/create/page.tsx`) to use a 3-column grid on desktop (stack on mobile).

| Column | Width | Role | Key Components |
| :--- | :--- | :--- | :--- |
| **Left** | ~20% | **Context & Config** | Platform select, Topic/Niche, Goal setting (Leads/Followers). |
| **Center** | ~45% | **The Lab (Editor)** | Main input area, "Supercharge" button, Media upload. |
| **Right** | ~35% | **The Crystal Ball** | Live Platform Preview + **Real-time Viral Score**. |

---

## 2. Key Component Specifications

### A. The "Viral Gauge" (Hero Component)
**Location:** Top of Right Column (Sticky).
**Behavior:**
*   **Reactive:** Updates in real-time as the user types in the Center column.
*   **Visuals:**
    *   **Circular Progress Ring:** 0-100 Score.
    *   **Color Coding:**
        *   🔴 **0-40:** "Low Reach" (Muted/Red)
        *   🟡 **41-70:** "Good Start" (Yellow)
        *   🟢 **71-100:** "Viral Potential" (Neon Green)
*   **Dev Note:** For now, mock the logic (e.g., `score = length * 0.5 + 20`). We will connect real AI prediction later.

### B. Live Platform Preview
**Location:** Right Column, below the Gauge.
**Behavior:**
*   **WYSIWYG:** Must render the content *exactly* as it looks on the selected platform (Twitter/X Card, LinkedIn Post).
*   **State:** Binds directly to the Center Column inputs. Zero latency updates.

### C. The "Supercharge" Action (Replacing "Generate")
**Location:** Center Column, below text area.
**Change:**
*   **Rename Button:** "Generate" -> **"⚡ Supercharge this Post"**
*   **Interaction:**
    *   Instead of auto-filling the box, open a **"Variations Modal"** or expandable section.
    *   **Display 3 Options:**
        1.  *The Provocative Hook* (Score: 92)
        2.  *The Data-Backed Insight* (Score: 85)
        3.  *The Storyteller* (Score: 78)
    *   User clicks a variation to apply it to the editor.

---

## 3. Implementation Checklist (Shadcn/Tailwind)

- [ ] **Scaffold Layout:** Create the 3-col grid wrapper.
- [ ] **Component: `ViralScoreGauge`:** Build the circular progress UI.
- [ ] **Component: `TwitterPreviewCard`:** Build the mock Twitter UI container.
- [ ] **State Management:** Lift state up so Editor inputs drive the Preview and Score components simultaneously.
- [ ] **Micro-Interactions:** Add simple animations (e.g., the gauge needle moving) to create a "live" feel.

---

# 🛠️ Technical Implementation Specifications

## 1. Hybrid Scoring Engine (Performance & Cost Guardrail)

**Critical Constraint:** The Viral Gauge must react instantly, but we **CANNOT** call the LLM API on every keystroke.

### Implementation Strategy:

#### Layer 1: Local Heuristic Scoring (Immediate - $0 cost)
Run this on every `onChange` event in the browser:

```typescript
/**
 * Local heuristic scoring - runs instantly without API calls
 * Provides immediate feedback while user types
 */
const getMockScore = (text: string): number => {
  let score = 30; // Base score

  // Length bonus
  if (text.length > 50) score += 15;
  if (text.length > 100) score += 10;

  // Emotional punctuation (? and !)
  if (text.match(/[?!]/)) score += 10;

  // Direct address (you/your)
  const directAddress = text.match(/\b(you|your)\b/gi);
  if (directAddress) score += 10;

  // Data/numbers (credibility signals)
  if (text.match(/\d+%|\$\d+|#?\d+[KkMm]?/)) score += 15;

  // Substantial content
  if (text.split(' ').length > 20) score += 10;

  // Add slight randomness for realism
  score += Math.random() * 5;

  return Math.min(100, Math.max(0, Math.round(score)));
};
```

**UI Behavior:**
- Updates gauge immediately on every keystroke
- Shows local score with subtle indicator
- No loading state needed

#### Layer 2: AI Validation (Debounced/On-Demand)
Trigger full AI scoring only when:
1. User clicks **"⚡ Supercharge this Post"** button
2. User stops typing for **2000ms** (2 seconds)

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

// In your component:
const debouncedAIScore = useMemo(
  () => debounce(async (content: string) => {
    if (content.length < 10) return; // Don't score empty content

    setIsAIScoring(true);
    try {
      const aiScore = await getViralScoreFromAPI(content);
      setAIScore(aiScore);
    } catch (error) {
      console.error('AI scoring failed:', error);
      // Degrade gracefully - keep using local heuristic
    } finally {
      setIsAIScoring(false);
    }
  }, 2000),
  []
);
```

**UI States:**
- **Local Score Active:** Default state, updates instantly
- **AI Validating:** Show small "⚡ AI Validating..." badge
- **AI Score Available:** Replace local score with AI score, show "AI Enhanced" badge
- **AI Failed:** Silently fall back to local score

---

## 2. State Management Architecture

**Problem:** The Center Column (Input) drives the Right Column (Preview + Gauge) without prop-drilling hell.

**Solution:** Use **Zustand** for clean, performant state management.

### Store Setup:

Create `stores/campaign-store.ts`:

```typescript
import { create } from 'zustand';

interface CampaignState {
  // Content
  content: string;
  platform: 'twitter' | 'linkedin' | 'facebook';
  topic: string;
  goal: 'leads' | 'followers' | 'engagement';

  // Scoring
  localScore: number;
  aiScore: number | null;
  isAIScoring: boolean;

  // Media
  mediaFiles: File[];

  // Actions
  updateContent: (content: string) => void;
  setPlatform: (platform: 'twitter' | 'linkedin' | 'facebook') => void;
  setTopic: (topic: string) => void;
  setGoal: (goal: 'leads' | 'followers' | 'engagement') => void;
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

### Usage in Components:

```typescript
// In ViralScoreGauge component
const { localScore, aiScore, isAIScoring } = useCampaignStore();
const displayScore = aiScore ?? localScore;

// In ContentEditor component
const { content, updateContent } = useCampaignStore();

// In PlatformPreview component
const { content, platform, mediaFiles } = useCampaignStore();
```

---

## 3. Component Libraries & Dependencies

### Required Packages:

```bash
# State management
npm install zustand

# Debouncing
npm install lodash
npm install -D @types/lodash

# Platform previews
npm install react-tweet        # Twitter/X preview
npm install react-linkedin-insight  # LinkedIn (or build custom)

# Charts/Gauge
npm install recharts           # For circular progress gauge
# OR use shadcn/ui Progress component

# Animations
npm install framer-motion      # Smooth gauge animations

# Icons
npm install lucide-react       # Already in your stack
```

### Component Library Strategy:

1. **Preview Components:**
   - **Twitter/X:** Use `react-tweet` library (handles all edge cases)
   - **LinkedIn:** Build custom with Tailwind (LinkedIn's layout is simpler)
   - **Facebook:** Custom with Tailwind

2. **Viral Gauge:**
   - Use `shadcn/ui` Progress component wrapped in custom circular layout
   - OR use `recharts` RadialBarChart for more control
   - Animate with `framer-motion`

3. **Icons:**
   - Use `lucide-react` (already in your stack)
   - Gauge states: `TrendingUp`, `TrendingDown`, `Zap`, `Activity`

---

## 4. Mobile Responsiveness Strategy

### Desktop (≥1024px):
- 3-column grid layout as specified
- Gauge sticky at top of right column

### Tablet (768px - 1023px):
- 2-column layout: Config (left) + Editor+Preview stacked (right)
- Gauge becomes sticky top bar

### Mobile (<768px):
- Single column, vertical stack
- **Critical:** Gauge moves to **floating action button (FAB)** at bottom right
- Tapping FAB opens bottom sheet with gauge + score breakdown

```tsx
// Mobile Gauge Component
const MobileViralScore = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { localScore, aiScore } = useCampaignStore();
  const score = aiScore ?? localScore;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
                   bg-gradient-to-br from-purple-600 to-pink-600
                   shadow-lg flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white font-bold text-lg">{score}</span>
      </motion.button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
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
              <ViralScoreGauge />
              <ScoreBreakdown />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

---

## 5. Additional UX Enhancements

### A. Score Explanation Tooltip

Add a "Why this score?" tooltip on the gauge:

```tsx
<Tooltip>
  <TooltipTrigger>
    <InfoIcon className="w-4 h-4 text-gray-400" />
  </TooltipTrigger>
  <TooltipContent>
    <div className="space-y-2">
      <p className="font-semibold">Score Breakdown:</p>
      <ul className="text-sm space-y-1">
        <li>✓ Strong hook detected</li>
        <li>✓ Direct address (you/your)</li>
        <li>⚠️ Could use more data points</li>
        <li>⚠️ Consider adding emotional trigger</li>
      </ul>
    </div>
  </TooltipContent>
</Tooltip>
```

### B. First-Time User Onboarding

Add a guided tour using `react-joyride`:

```tsx
const steps = [
  {
    target: '.content-editor',
    content: 'Start typing your post here. Watch the Viral Score update in real-time!',
  },
  {
    target: '.viral-gauge',
    content: 'This gauge predicts your post\'s viral potential based on proven patterns.',
  },
  {
    target: '.supercharge-button',
    content: 'Get AI-powered variations optimized for maximum engagement.',
  },
  {
    target: '.platform-preview',
    content: 'See exactly how your post will look on the platform.',
  },
];
```

### C. Loading States & Error Handling

```tsx
// Degrade gracefully when AI is unavailable
{isAIScoring && (
  <Badge variant="outline" className="animate-pulse">
    <Zap className="w-3 h-3 mr-1" />
    AI Validating...
  </Badge>
)}

{aiScore && (
  <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
    <Sparkles className="w-3 h-3 mr-1" />
    AI Enhanced
  </Badge>
)}

// Error state (shown only to user, not blocking)
{aiError && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <AlertCircle className="w-4 h-4 text-yellow-500" />
      </TooltipTrigger>
      <TooltipContent>
        AI scoring temporarily unavailable. Using local analysis.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

---

## 6. Performance Considerations

### Optimization Checklist:

- [ ] **Debounce AI calls** - 2000ms minimum
- [ ] **Memoize expensive calculations** - Use `useMemo` for score logic
- [ ] **Virtualize variations list** - If showing >10 variations
- [ ] **Lazy load preview components** - Use `React.lazy()` for platform previews
- [ ] **Cache AI scores** - Store in localStorage for 15 minutes
- [ ] **Optimize re-renders** - Use `React.memo` for gauge component

### Caching Strategy:

```typescript
// Cache AI scores in localStorage
const SCORE_CACHE_KEY = 'viral-score-cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const getCachedScore = (content: string): number | null => {
  const cache = localStorage.getItem(SCORE_CACHE_KEY);
  if (!cache) return null;

  const parsed = JSON.parse(cache);
  const hash = hashString(content);

  if (parsed[hash] && Date.now() - parsed[hash].timestamp < CACHE_DURATION) {
    return parsed[hash].score;
  }

  return null;
};
```

---

**"The Xelora Rule":** If the user types a character, the screen must change. Static is dead.
