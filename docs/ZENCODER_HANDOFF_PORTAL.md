# ZenCoder Handoff: Content Cascade AI Portal & Dashboard

## Project Overview
Build a **modern, user-friendly SaaS portal** for Content Cascade AI. Users will create multi-platform social media campaigns powered by AI.

**Priority:** Clean, bold, simple UI with large buttons and clear navigation. Think Notion meets Buffer meets Canva.

---

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Auth:** Supabase (already integrated by Claude)
- **Database:** Supabase PostgreSQL (schema complete)

---

## Design System

### Colors (From Existing Landing Page)
```css
--primary: 99 102 241      /* Indigo-500 */
--secondary: 168 85 247    /* Purple-500 */
--accent: 236 72 153       /* Pink-500 */
--success: 34 197 94       /* Green-500 */
--warning: 251 146 60      /* Orange-500 */
--danger: 239 68 68        /* Red-500 */
```

### Typography
- **Headings:** Inter, Bold
- **Body:** Inter, Regular
- **Buttons:** Inter, Semibold

### Spacing Scale
- Small: 0.5rem (8px)
- Medium: 1rem (16px)
- Large: 1.5rem (24px)
- XL: 2rem (32px)

### Component Style
- **Buttons:** Large (min 44px height), rounded-lg, bold text
- **Cards:** Shadow-sm, rounded-xl, border-gray-100
- **Inputs:** Large, rounded-lg, clear labels above
- **Modals:** Centered, max-w-2xl, backdrop blur

---

## Pages to Build

### 1. Authentication Pages

#### `/login` - Login Page
**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         🎨 Logo + Tagline           │
│                                     │
│    ┌──────────────────────────┐    │
│    │  Email                   │    │
│    │  [            ]          │    │
│    │                          │    │
│    │  Password                │    │
│    │  [            ]          │    │
│    │                          │    │
│    │  [Login Button - LARGE]  │    │
│    │                          │    │
│    │  OR                      │    │
│    │                          │    │
│    │  [🔵 Google Login]       │    │
│    │  [🐦 Twitter Login]      │    │
│    │                          │    │
│    │  Don't have account?     │    │
│    │  Sign up →               │    │
│    └──────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Email/password form
- Social logins (Google, Twitter)
- "Forgot password?" link
- Link to signup page
- Gradient background (matches landing page)

**Figma-like style:**
- Center card (max-w-md)
- Large input fields (h-12)
- Giant login button (h-14, w-full)
- Subtle animations on hover

---

#### `/signup` - Signup Page
**Same layout as login, with:**
- Full name field
- Email
- Password
- Confirm password
- Terms & Privacy checkbox
- Link to login page

---

### 2. Onboarding Flow

#### `/onboarding` - 4-Step Wizard
**Progress bar at top:**
```
Step 1: Profile  →  Step 2: Connect  →  Step 3: Brand  →  Step 4: Launch
  [██████]           [░░░░░░]           [░░░░░░]         [░░░░░░]
```

**Step 1: Complete Profile**
```
Your Profile
────────────
Full Name:     [                    ]
Company Name:  [                    ]
Industry:      [Dropdown            ]
Avatar:        [Upload Photo]

             [Next: Connect Socials →]
```

**Step 2: Connect Social Accounts**
```
Connect Your Social Accounts
─────────────────────────────
Choose platforms to publish content:

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🐦 Twitter     │  │  💼 LinkedIn    │  │  📘 Facebook    │
│  [Connect]      │  │  [Connect]      │  │  [Connect]      │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  📸 Instagram   │  │  🎵 TikTok      │  │  🤖 Reddit      │
│  [Connect]      │  │  [Connect]      │  │  [Connect]      │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Connected: 0 platforms

        [← Back]         [Next: Brand Voice →]
```

**Step 3: Create Brand Voice**
```
Define Your Brand Voice
────────────────────────
This helps AI write in your style.

Name:          [                    ]
               Example: "Professional Tech"

Tone:          [Dropdown: Professional / Casual / Humorous / Edgy]

Formality:     [Slider: 1────●────5]
               Casual         Formal

Emoji Usage:   ( ) None  (●) Minimal  ( ) Moderate  ( ) Heavy

Hashtags:      ( ) None  (●) Minimal  ( ) Trending  ( ) Branded

Example Post (Optional):
┌──────────────────────────────────────┐
│                                      │
│                                      │
└──────────────────────────────────────┘

        [← Back]         [Create First Campaign →]
```

**Step 4: Create First Campaign**
```
Let's Create Your First Campaign!
──────────────────────────────────

Campaign Name: [                    ]

What would you like to create content about?

  ( ) Discover trending topics (AI-powered)
  ( ) Enter a topic manually
  ( ) Upload existing content

[Topic: ________________]

Target Platforms:
  [✓] Twitter    [✓] LinkedIn    [ ] Email

AI Provider:
  (●) Local AI (Free)  ( ) Claude  ( ) Gemini

           [Launch Campaign →]
```

**After completion:**
→ Redirect to Dashboard

---

### 3. Main Portal Layout

#### Portal Shell (Used on all dashboard pages)
```
┌──────────────────────────────────────────────────────────┐
│  Logo    Campaigns  Analytics  Settings       👤 Profile │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│  📊      │                                               │
│  Dashboard│             PAGE CONTENT                     │
│          │                                               │
│  ⚡      │                                               │
│  Campaigns│                                              │
│          │                                               │
│  🎨      │                                               │
│  Create  │                                               │
│          │                                               │
│  📈      │                                               │
│  Analytics│                                              │
│          │                                               │
│  🔧      │                                               │
│  Settings│                                               │
│          │                                               │
│  ───────│                                               │
│          │                                               │
│  💡      │                                               │
│  Help    │                                               │
│          │                                               │
│  🚪      │                                               │
│  Logout  │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Sidebar:**
- Fixed left sidebar (240px wide)
- Dark background (bg-gray-900)
- White icons + text
- Active item: bg-indigo-600
- Hover: bg-gray-800
- Large icons (24px) with text labels

**Top Bar:**
- White background
- Logo on left
- Main nav links (center)
- User profile dropdown (right)
- Notifications bell icon
- Search bar (optional)

---

### 4. Dashboard (`/dashboard`)

```
┌────────────────────────────────────────────────────────┐
│  Welcome back, Mark! 🎉                                │
│  You have 3 campaigns in progress                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Quick Stats                                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────┐│
│  │ 12        │ │ 1.2K      │ │ 85%       │ │ $49    ││
│  │ Campaigns │ │ Views     │ │ Engage    │ │ Saved  ││
│  └───────────┘ └───────────┘ └───────────┘ └────────┘│
│                                                        │
│  Recent Campaigns                    [+ New Campaign] │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚀 "AI Tools Launch"          Published 2h ago   ││
│  │ Twitter • LinkedIn • Email                       ││
│  │ 👁 245 views  💬 12 comments  🔗 8 clicks        ││
│  │                              [View] [Analytics]  ││
│  ├──────────────────────────────────────────────────┤│
│  │ ✍️ "Content Marketing Tips"   Draft             ││
│  │ Twitter • LinkedIn                               ││
│  │                              [Edit] [Delete]     ││
│  ├──────────────────────────────────────────────────┤│
│  │ ⏱️ "Product Update"           Scheduled for 5PM  ││
│  │ All platforms                                    ││
│  │                              [Edit] [Cancel]     ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  AI Usage This Month                                   │
│  ┌──────────────────────────────────────────────────┐│
│  │ Local AI:  ████████░░  85% of limit              ││
│  │ Claude:    ████░░░░░░  40% of limit              ││
│  │                         Upgrade to get more →    ││
│  └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

**Components:**
- Stat cards (4 columns on desktop, stack on mobile)
- Campaign list (cards or table view)
- Each campaign card shows:
  - Campaign name + emoji
  - Status badge (draft/scheduled/published)
  - Platforms (icons)
  - Quick stats (views, engagement)
  - Action buttons
- AI usage progress bars

---

### 5. Create Campaign (`/campaigns/new`)

```
┌────────────────────────────────────────────────────────┐
│  ← Back to Campaigns           Create New Campaign     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Step 1: Campaign Details                              │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  Campaign Name *                                       │
│  [                                ]                    │
│                                                        │
│  Campaign Type                                         │
│  ( ) Full Campaign (Multiple posts + email)            │
│  (●) Single Post                                       │
│  ( ) Trending Topic                                    │
│                                                        │
│  ─────────────────────────────────────────────────     │
│                                                        │
│  Step 2: Content Source                                │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  How would you like to create content?                 │
│                                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────┐│
│  │ 🔥 Trending    │  │ ✍️ Write       │  │ 📤 Upload││
│  │ Topics         │  │ Manually       │  │ Content  ││
│  │ [Select]       │  │ [Select]       │  │ [Select] ││
│  └────────────────┘  └────────────────┘  └──────────┘│
│                                                        │
│  [Conditional: If "Trending" selected]                 │
│  ┌──────────────────────────────────────────────────┐│
│  │ Search trending topics:                          ││
│  │ [cooking          ] [🔍 Search]                  ││
│  │                                                  ││
│  │ Results:                                         ││
│  │ • Cooking meal prep ideas        [Select]       ││
│  │ • Cooking recipes for beginners  [Select]       ││
│  │ • Best cooking techniques 2025   [Select]       ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  ─────────────────────────────────────────────────     │
│                                                        │
│  Step 3: Target Platforms                              │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  Select platforms to publish:                          │
│                                                        │
│  [✓] 🐦 Twitter       [✓] 💼 LinkedIn                 │
│  [ ] 📘 Facebook      [ ] 📸 Instagram                │
│  [✓] 📧 Email         [ ] 🎵 TikTok                   │
│                                                        │
│  ─────────────────────────────────────────────────     │
│                                                        │
│  Step 4: AI Configuration                              │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  AI Provider:                                          │
│  (●) Local AI (Free, Fast)                             │
│  ( ) Claude Opus (Premium quality) [Requires API key]  │
│  ( ) Gemini Flash (Fast & affordable)                  │
│  ( ) Grok (Edgy, conspiracy-friendly)                  │
│                                                        │
│  Model:                                                │
│  [Dropdown: Mistral-7B-Claude-Chat]                    │
│                                                        │
│  Brand Voice:                                          │
│  [Dropdown: Professional Tech ▼]                       │
│                                                        │
│  ─────────────────────────────────────────────────     │
│                                                        │
│  Step 5: Media (Optional)                              │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  Add images or videos to your campaign:                │
│                                                        │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ 🖼️ Generate    │  │ 📤 Upload      │               │
│  │ AI Image       │  │ Your Own       │               │
│  │ [Select]       │  │ [Select]       │               │
│  └────────────────┘  └────────────────┘               │
│                                                        │
│  [If "Generate AI Image" selected]                     │
│  ┌──────────────────────────────────────────────────┐│
│  │ Image Generator:                                 ││
│  │ (●) Google Imagen   ( ) DALL-E   ( ) Midjourney  ││
│  │                                                  ││
│  │ Describe your image:                             ││
│  │ [                                 ]              ││
│  │                          [Generate Image →]      ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│            [Cancel]        [Generate Content →]        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**After clicking "Generate Content":**
→ Show loading modal with progress
→ Redirect to `/campaigns/[id]/review`

---

### 6. Review & Edit Campaign (`/campaigns/[id]/review`)

```
┌────────────────────────────────────────────────────────┐
│  ← Back to Campaigns         Review & Edit Campaign    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Campaign: "Cooking Budget-Friendly Meals" ✍️ [Edit]   │
│                                                        │
│  Generated Content:                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🐦 Twitter Post                          [Edit]  ││
│  ├──────────────────────────────────────────────────┤│
│  │                                                  ││
│  │  💡 Budget-friendly cooking hacks! 🍳            ││
│  │                                                  ││
│  │  → Meal prep on Sundays                          ││
│  │  → Buy in bulk                                   ││
│  │  → Use seasonal produce                          ││
│  │                                                  ││
│  │  Save $200/month on groceries! 💰                ││
│  │                                                  ││
│  │  #CookingTips #BudgetMeals #MealPrep             ││
│  │                                                  ││
│  │  ─────────────────────────────────────────       ││
│  │  Character count: 245/280                        ││
│  │  Hashtags: 3   Emojis: 3                         ││
│  │                                                  ││
│  │                  [Regenerate] [Copy] [Delete]    ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💼 LinkedIn Post                         [Edit]  ││
│  ├──────────────────────────────────────────────────┤│
│  │                                                  ││
│  │  Budget-Friendly Cooking Strategies That Work    ││
│  │                                                  ││
│  │  Managing food costs while maintaining quality:  ││
│  │                                                  ││
│  │  • Strategic meal planning saves 30% monthly     ││
│  │  • Bulk purchasing reduces per-unit costs        ││
│  │  • Seasonal produce offers better value          ││
│  │                                                  ││
│  │  What's your best budget cooking tip?            ││
│  │                                                  ││
│  │  #FoodBudget #MealPlanning #CookingTips          ││
│  │                                                  ││
│  │  ─────────────────────────────────────────       ││
│  │  Characters: 412                                 ││
│  │                                                  ││
│  │                  [Regenerate] [Copy] [Delete]    ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  Publishing Options:                                   │
│  ┌──────────────────────────────────────────────────┐│
│  │ When to publish:                                 ││
│  │ (●) Publish now                                  ││
│  │ ( ) Schedule for later:  [Date] [Time]           ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│       [← Back to Edit]      [Publish Campaign →]       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Editable content cards for each platform
- Live character count
- Regenerate button (calls AI again)
- Copy to clipboard
- Delete individual posts
- Schedule or publish immediately

---

### 7. Campaigns List (`/campaigns`)

```
┌────────────────────────────────────────────────────────┐
│  My Campaigns                        [+ New Campaign]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Search campaigns...] [Filter: All ▼] [Sort: Recent ▼]│
│                                                        │
│  ┌──────────────────────────────────────────────────┐│
│  │ Campaign                  Status      Actions     ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🚀 AI Tools Launch        Published   [View]     ││
│  │ Twitter • LinkedIn • Email 2h ago     [Edit]     ││
│  │ 👁 245   💬 12   🔗 8                 [Delete]   ││
│  ├──────────────────────────────────────────────────┤│
│  │ ✍️ Marketing Tips         Draft       [Edit]     ││
│  │ Twitter • LinkedIn                    [Publish]  ││
│  │                                       [Delete]   ││
│  ├──────────────────────────────────────────────────┤│
│  │ ⏱️ Product Update          Scheduled   [View]     ││
│  │ All platforms             5:00 PM     [Edit]     ││
│  │                                       [Cancel]   ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  Showing 3 of 12 campaigns        [Load more...]       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 8. Analytics (`/analytics`)

```
┌────────────────────────────────────────────────────────┐
│  Analytics Dashboard                    [Last 30 days ▼]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  Overview                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 12       │ │ 2.4K     │ │ 156      │ │ 8.2%     ││
│  │ Campaigns│ │ Views    │ │ Clicks   │ │ CTR      ││
│  │ +2 ↑     │ │ +340 ↑   │ │ +28 ↑    │ │ +1.2% ↑  ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                        │
│  Performance by Platform                               │
│  ┌──────────────────────────────────────────────────┐│
│  │          Views    Engagement    Clicks    CTR    ││
│  │ Twitter   1.2K      85%          98       8.2%   ││
│  │ LinkedIn  800       92%          45       5.6%   ││
│  │ Email     400       78%          13       3.3%   ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  Engagement Over Time                                  │
│  ┌──────────────────────────────────────────────────┐│
│  │        [Line graph showing daily engagement]     ││
│  │ 300 │                              ╱╲            ││
│  │     │                         ╱╲  ╱  ╲           ││
│  │ 200 │                    ╱╲  ╱  ╲╱    ╲          ││
│  │     │               ╱╲  ╱  ╲╱           ╲        ││
│  │ 100 │          ╱╲  ╱  ╲╱                 ╲       ││
│  │     │─────────────────────────────────────────   ││
│  │       Mon  Tue  Wed  Thu  Fri  Sat  Sun         ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  Top Performing Campaigns                              │
│  ┌──────────────────────────────────────────────────┐│
│  │ 1. AI Tools Launch      1.2K views  12% CTR      ││
│  │ 2. Marketing Tips       980 views   9.8% CTR     ││
│  │ 3. Product Update       750 views   8.1% CTR     ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 9. Settings (`/settings`)

**Tabs:** Profile | Social Accounts | Brand Voice | API Keys | Billing | Preferences

```
┌────────────────────────────────────────────────────────┐
│  Settings                                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Profile] [Social] [Brand] [API Keys] [Billing] [⚙️] │
│                                                        │
│  ┌──────────────────────────────────────────────────┐│
│  │ Profile Settings                                 ││
│  │                                                  ││
│  │  Avatar:    [    ]  [Upload new photo]           ││
│  │                                                  ││
│  │  Full Name:     [Mark Johnson          ]         ││
│  │  Email:         [mark@3kpro.com        ]         ││
│  │  Company:       [3K Pro Services       ]         ││
│  │  Industry:      [Technology ▼]                   ││
│  │                                                  ││
│  │  Password:      [Change password...]             ││
│  │                                                  ││
│  │               [Cancel]  [Save Changes]           ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Social Accounts Tab:**
```
│  Connected Accounts                                    │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🐦 Twitter        @3kpro            [Disconnect] ││
│  │ 💼 LinkedIn       Mark Johnson      [Disconnect] ││
│  │ 📘 Facebook       Not connected     [Connect]    ││
│  │ 📸 Instagram      Not connected     [Connect]    ││
│  │ 🎵 TikTok         Not connected     [Connect]    ││
│  └──────────────────────────────────────────────────┘│
```

**API Keys Tab:**
```
│  Your API Keys                          [+ Add New]    │
│  ┌──────────────────────────────────────────────────┐│
│  │ Claude API        sk-ant-***********   [Delete]  ││
│  │ Google Imagen     AIza************     [Delete]  ││
│  │ ElevenLabs        ************         [Delete]  ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  ⚠️ Free users can use Local AI only. Upgrade to Pro  │
│     to use premium AI providers with your own keys.   │
```

**Billing Tab:**
```
│  Subscription                                          │
│  ┌──────────────────────────────────────────────────┐│
│  │ Current Plan: Free                               ││
│  │                                                  ││
│  │ Limits:                                          ││
│  │ • 1 campaign per month (0/1 used)                ││
│  │ • 3 social accounts (2/3 used)                   ││
│  │ • Local AI only                                  ││
│  │                                                  ││
│  │            [Upgrade to Pro - $29/mo →]           ││
│  └──────────────────────────────────────────────────┘│
│                                                        │
│  Upgrade Plans                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Free        │  │ Pro         │  │ Premium     │  │
│  │ $0/mo       │  │ $29/mo      │  │ $99/mo      │  │
│  │ Current     │  │ [Select]    │  │ [Select]    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
```

---

## Key UI/UX Principles

### 1. Bold & Simple
- **Large buttons:** Minimum 44px height, generous padding
- **Clear labels:** Above inputs, not placeholders
- **Generous whitespace:** Don't cram elements
- **One primary action per screen:** Make it obvious

### 2. Visual Hierarchy
- **Primary button:** bg-indigo-600, text-white, shadow-lg
- **Secondary button:** bg-white, border-gray-300
- **Danger button:** bg-red-600, text-white
- **Disabled:** opacity-50, cursor-not-allowed

### 3. Mobile-First Responsive
- Stack columns on mobile
- Hide sidebar on mobile (show hamburger menu)
- Touch targets 44px minimum
- Bottom navigation for mobile (optional)

### 4. Loading States
- Skeleton loaders for data fetching
- Progress bars for AI generation
- Spinners for quick actions
- Toast notifications for success/error

### 5. Empty States
- Friendly illustrations (use Lucide icons or Hero Icons)
- Clear CTA ("Create your first campaign")
- Help text explaining next steps
- Onboarding tooltips for new users
- Progressive disclosure (show advanced features after basics)

### 6. Error Handling
- Toast notifications (top-right corner)
- Inline form validation (red border + message below field)
- Retry buttons for failed actions
- Helpful error messages (not "Error 500")
- Network error handling (show offline state)
- AI generation failures (graceful fallback with manual editing)

---

## Additional Pages & Components

### 10. AI Content Generation Modal (`/components/AIGenerationModal`)

```
┌──────────────────────────────────────────────────────┐
│  🤖 AI is generating your content...                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         [████████████████░░░░] 75%             │ │
│  │                                                │ │
│  │  Current step: Analyzing trending topics...    │ │
│  │                                                │ │
│  │  Steps completed:                              │ │
│  │  ✅ Content analysis                           │ │
│  │  ✅ Platform optimization                      │ │
│  │  ⏳ Generating Twitter post                    │ │
│  │  ⏸️ Generating LinkedIn post                   │ │
│  │  ⏸️ Adding hashtags & emojis                   │ │
│  │                                                │ │
│  │  Estimated time: 45 seconds                   │ │
│  │                                                │ │
│  │            [Cancel Generation]                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 11. Content Editor Component (`/components/ContentEditor`)

```
┌──────────────────────────────────────────────────────┐
│  🐦 Twitter Post Editor                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │  💡 Budget-friendly cooking hacks! 🍳          │ │
│  │                                                │ │
│  │  → Meal prep on Sundays                        │ │
│  │  → Buy in bulk                                 │ │
│  │  → Use seasonal produce                        │ │
│  │                                                │ │
│  │  Save $200/month on groceries! 💰              │ │
│  │                                                │ │
│  │  #CookingTips #BudgetMeals #MealPrep           │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Formatting Tools ──────────────────────────────┐ │
│  │  [B] [I] [@] [#] [😀] [🔗] [📷]               │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Character count: 245/280    Hashtags: 3    Emojis: 3│
│                                                      │
│  Thread preview:                                     │
│  ┌ Tweet 1 of 1 ────────────────────────────────────┐ │
│  │ This will be your main post. Add more tweets     │ │
│  │ by clicking [+ Add Tweet] below.                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [+ Add Tweet]  [🤖 AI Improve]  [📋 Copy]  [💾 Save]│
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 12. Mobile Navigation (`/components/MobileNav`)

```
┌──────────────────────┐
│  ☰ Menu       👤     │ ← Top bar on mobile
├──────────────────────┤
│                      │
│  [Main content area] │
│                      │
│                      │
│                      │
│                      │
│                      │
│                      │
├──────────────────────┤
│ 📊  ⚡  🎨  📈  🔧  │ ← Bottom navigation
│ Dash Campaigns +     │
└──────────────────────┘

When hamburger menu is tapped:
┌──────────────────────┐
│ × Close         👤   │
├──────────────────────┤
│                      │
│ 📊 Dashboard         │
│ ⚡ Campaigns         │
│ 🎨 Create            │
│ 📈 Analytics         │
│ 🔧 Settings          │
│ ────────────────     │
│ 💡 Help              │
│ 🚪 Logout            │
│                      │
└──────────────────────┘
```

### 13. Notification Center (`/components/NotificationCenter`)

```
┌──────────────────────────────────────────────────────┐
│  🔔 Notifications                            [Mark all read]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ● 🚀 "AI Tools Launch" published successfully  │ │
│  │   Twitter: 12 likes, LinkedIn: 8 comments      │ │
│  │   2 minutes ago                          [×]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ● ⚠️ AI generation failed for "Marketing Tips"  │ │
│  │   Click to retry with different settings       │ │
│  │   5 minutes ago                          [×]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ○ 💡 Tip: Use trending hashtags to increase    │ │
│  │    your reach by up to 30%                     │ │
│  │    1 hour ago                            [×]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ○ ⏰ "Product Update" scheduled for 5PM today   │ │
│  │    1 day ago                             [×]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 14. Brand Voice Creator (`/settings/brand-voice/new`)

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Settings          Create New Brand Voice   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Step 1: Basic Information                           │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Brand Voice Name *                                  │
│  [Professional Tech Startup        ]                │
│                                                      │
│  Description (Optional)                              │
│  [Professional but approachable tone for tech content]│
│                                                      │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Step 2: Voice Characteristics                       │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Overall Tone                                        │
│  (●) Professional  ( ) Casual  ( ) Humorous  ( ) Edgy│
│                                                      │
│  Formality Level                                     │
│  [░░░░●░░░░░] 5/10                                   │
│  Very Casual              Very Formal                │
│                                                      │
│  Energy Level                                        │
│  [░░░░░░░●░░] 7/10                                   │
│  Calm & Measured          High Energy                │
│                                                      │
│  Personality Traits (Select all that apply)          │
│  [✓] Helpful      [✓] Expert       [ ] Playful      │
│  [✓] Trustworthy  [ ] Rebellious   [✓] Innovative   │
│  [ ] Friendly     [ ] Authoritative [ ] Quirky      │
│                                                      │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Step 3: Content Preferences                         │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Emoji Usage                                         │
│  ( ) None    (●) Minimal (2-3)  ( ) Moderate (4-6)  │
│  ( ) Heavy (7+ emojis per post)                      │
│                                                      │
│  Hashtag Strategy                                    │
│  ( ) No hashtags  (●) Industry-specific (3-5)       │
│  ( ) Trending hashtags  ( ) Branded hashtags only    │
│                                                      │
│  Call-to-Action Style                                │
│  (●) Question-based ("What do you think?")           │
│  ( ) Direct ("Click the link below")                 │
│  ( ) Soft suggestion ("You might find this useful")  │
│                                                      │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Step 4: Training Examples (Optional)                │
│  ────────────────────────────────────────────────    │
│                                                      │
│  Add examples of content that matches your voice:    │
│                                                      │
│  Example 1:                                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ Just shipped a new AI feature that saves our    │   │
│  │ users 3 hours per week. Small improvements      │   │
│  │ compound into massive wins. What's the last     │   │
│  │ tool that changed your workflow? 🛠️             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [+ Add Another Example]                             │
│                                                      │
│  AI Preview                                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ 🤖 Based on your settings, here's how I would   │   │
│  │ write about "productivity apps":                 │   │
│  │                                                  │   │
│  │ "Found 3 productivity apps that actually work   │   │
│  │ (not another fancy to-do list). Each one saves  │   │
│  │ me 30 minutes daily. Sometimes the best tools   │   │
│  │ are the simple ones. What's your go-to app for  │   │
│  │ staying organized? 📱"                           │   │
│  │                                                  │   │
│  │                              [🔄 Generate New]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│           [Cancel]              [Create Brand Voice] │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 15. Template Library (`/templates`)

```
┌──────────────────────────────────────────────────────┐
│  Template Library                    [+ Create Template]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Search templates...] [Category: All ▼] [Sort: Popular ▼]│
│                                                      │
│  Popular Templates                                   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────┐│
│  │ 🚀 Product Launch│ │ 📚 Educational   │ │ 🎉 Event│
│  │ 5 platforms      │ │ Thread Series    │ │ Promo   │
│  │ Used 1.2K times  │ │ Used 856 times   │ │ 642×   │
│  │ [Preview] [Use]  │ │ [Preview] [Use]  │ │ [Use]  │
│  └──────────────────┘ └──────────────────┘ └────────┘│
│                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────┐│
│  │ 💡 Tips & Tricks │ │ 📊 Data Insights │ │ 🤝 Team│
│  │ Multi-platform   │ │ Newsletter + SM  │ │ Update │
│  │ Used 723 times   │ │ Used 445 times   │ │ 289×   │
│  │ [Preview] [Use]  │ │ [Preview] [Use]  │ │ [Use]  │
│  └──────────────────┘ └──────────────────┘ └────────┘│
│                                                      │
│  Your Custom Templates                               │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📝 "Weekly Newsletter Template"     [Edit] [Use] ││
│  │ Twitter + LinkedIn + Email                       ││
│  │ Created 2 weeks ago • Used 5 times              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🎯 "Feature Announcement"           [Edit] [Use] ││
│  │ All platforms                                    ││
│  │ Created 1 month ago • Used 12 times             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Component Library (Use shadcn/ui)

Install these shadcn components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add command
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
```

## Complete Component List

### Core UI Components
- **Button**: Primary actions, secondary actions, icon buttons
- **Input**: Text fields, search fields, password inputs
- **Textarea**: Long-form content, descriptions
- **Select**: Dropdowns, multi-select options
- **Checkbox**: Multi-select options, toggles
- **Radio Group**: Single-select options
- **Switch**: Boolean settings, preferences
- **Slider**: Numeric ranges (formality, energy levels)
- **Progress**: Loading bars, completion indicators
- **Badge**: Status indicators, counters, tags
- **Avatar**: User profiles, team members
- **Skeleton**: Loading placeholders
- **Separator**: Visual dividers between sections

### Layout Components
- **Card**: Campaign cards, stat cards, content containers
- **Sheet**: Mobile navigation drawer, side panels
- **Dialog**: Modals, confirmations, forms
- **Popover**: Contextual menus, tooltips
- **Tooltip**: Help text, additional information
- **Tabs**: Settings sections, content organization
- **Scroll Area**: Long content lists, chat history
- **Command**: Search dialogs, quick actions

### Feedback Components  
- **Toast**: Success/error notifications
- **Alert**: Warning messages, info banners
- **Alert Dialog**: Confirmations, destructive actions

### Custom Portal Components

#### Layout Components
- **PortalLayout**: Main shell with sidebar and top bar
- **Sidebar**: Navigation menu with icons and labels  
- **TopBar**: Header with logo, navigation, user menu
- **MobileNav**: Bottom navigation for mobile
- **BreadcrumbNav**: Page hierarchy navigation

#### Dashboard Components
- **StatCard**: KPI displays with metrics and trends
- **CampaignCard**: Campaign overview with actions
- **QuickActions**: Primary action buttons
- **UsageBar**: AI usage progress indicators
- **NotificationCenter**: Notification dropdown/panel

#### Campaign Components  
- **CampaignWizard**: Multi-step campaign creation
- **ContentEditor**: Rich text editor for posts
- **PlatformSelector**: Platform selection with icons
- **BrandVoiceSelector**: Voice selection dropdown
- **TemplateCard**: Template preview and selection
- **AIGenerationModal**: AI content generation progress
- **SchedulingCalendar**: Date/time picker for scheduling

#### Content Components
- **ContentPreview**: Platform-specific post previews
- **CharacterCounter**: Real-time character counting
- **HashtagSuggester**: Hashtag recommendations
- **EmojiPicker**: Emoji selection interface  
- **ThreadBuilder**: Twitter thread creation
- **MediaUploader**: Image/video upload interface

#### Analytics Components
- **MetricsChart**: Line/bar charts for engagement
- **PlatformComparison**: Platform performance table
- **TopPerformers**: Best performing content list
- **EngagementHeatmap**: Time-based engagement visualization

#### Settings Components
- **ProfileForm**: User profile editing
- **SocialConnector**: OAuth social media connections
- **BrandVoiceCreator**: Brand voice configuration wizard
- **APIKeyManager**: API key CRUD interface
- **BillingPanel**: Subscription and usage management
- **PreferencesForm**: User preferences and settings

#### Onboarding Components
- **OnboardingWizard**: 4-step setup process
- **ProgressIndicator**: Step progress visualization
- **SocialConnectionGrid**: Platform connection interface
- **VoicePreview**: Brand voice demonstration
- **WelcomeCard**: Getting started guidance

---

## Complete File Structure

```
app/
├── globals.css                 # Global styles, Tailwind imports
├── layout.tsx                  # Root layout, providers
├── page.tsx                    # Landing page redirect
├── loading.tsx                 # Global loading component
├── not-found.tsx              # 404 page
├── error.tsx                  # Global error boundary
│
├── (auth)/                    # Auth route group (no layout)
│   ├── login/
│   │   ├── page.tsx          # Login form
│   │   └── loading.tsx       # Login loading state
│   ├── signup/
│   │   ├── page.tsx          # Signup form
│   │   └── loading.tsx       # Signup loading state
│   ├── forgot-password/
│   │   └── page.tsx          # Password reset form
│   └── reset-password/
│       └── page.tsx          # Password reset confirmation
│
├── (portal)/                  # Portal route group (with sidebar)
│   ├── layout.tsx            # Portal shell with sidebar + topbar
│   ├── loading.tsx           # Portal loading state
│   │
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── loading.tsx       # Dashboard skeleton
│   │   └── components/
│   │       ├── StatsGrid.tsx
│   │       ├── RecentCampaigns.tsx
│   │       ├── UsageMetrics.tsx
│   │       └── QuickActions.tsx
│   │
│   ├── campaigns/
│   │   ├── page.tsx          # Campaigns list
│   │   ├── loading.tsx       # List loading skeleton
│   │   │
│   │   ├── new/
│   │   │   ├── page.tsx      # Campaign wizard
│   │   │   └── components/
│   │   │       ├── StepProgress.tsx
│   │   │       ├── CampaignDetails.tsx
│   │   │       ├── ContentSource.tsx
│   │   │       ├── PlatformSelection.tsx
│   │   │       ├── AIConfiguration.tsx
│   │   │       └── MediaUpload.tsx
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx      # Template library
│   │   │   └── components/
│   │   │       ├── TemplateGrid.tsx
│   │   │       ├── TemplateCard.tsx
│   │   │       └── TemplatePreview.tsx
│   │   │
│   │   └── [id]/
│   │       ├── page.tsx      # Campaign details
│   │       ├── loading.tsx   # Campaign loading
│   │       ├── edit/
│   │       │   └── page.tsx  # Edit campaign
│   │       ├── review/
│   │       │   ├── page.tsx  # Review & publish
│   │       │   └── components/
│   │       │       ├── ContentPreview.tsx
│   │       │       ├── PlatformPreview.tsx
│   │       │       ├── SchedulingPanel.tsx
│   │       │       └── PublishingOptions.tsx
│   │       └── analytics/
│   │           ├── page.tsx  # Campaign analytics
│   │           └── components/
│   │               ├── PerformanceMetrics.tsx
│   │               ├── EngagementChart.tsx
│   │               └── PlatformBreakdown.tsx
│   │
│   ├── analytics/
│   │   ├── page.tsx          # Global analytics
│   │   ├── loading.tsx       # Analytics loading
│   │   └── components/
│   │       ├── OverviewStats.tsx
│   │       ├── EngagementChart.tsx
│   │       ├── PlatformComparison.tsx
│   │       ├── TopPerformers.tsx
│   │       └── DateRangeSelector.tsx
│   │
│   ├── settings/
│   │   ├── page.tsx          # Settings hub
│   │   ├── layout.tsx        # Settings tabs layout
│   │   ├── profile/
│   │   │   └── page.tsx      # Profile settings
│   │   ├── social/
│   │   │   ├── page.tsx      # Social accounts
│   │   │   └── components/
│   │   │       ├── SocialConnector.tsx
│   │   │       └── ConnectedAccount.tsx
│   │   ├── brand-voice/
│   │   │   ├── page.tsx      # Brand voice management
│   │   │   ├── new/
│   │   │   │   └── page.tsx  # Create brand voice
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx  # Edit brand voice
│   │   │   │   └── preview/
│   │   │   │       └── page.tsx  # Voice preview
│   │   │   └── components/
│   │   │       ├── VoiceCard.tsx
│   │   │       ├── VoiceCreator.tsx
│   │   │       └── VoicePreview.tsx
│   │   ├── api-keys/
│   │   │   ├── page.tsx      # API key management
│   │   │   └── components/
│   │   │       ├── APIKeyManager.tsx
│   │   │       └── AddKeyModal.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx      # Billing & subscription
│   │   │   └── components/
│   │   │       ├── PlanSelector.tsx
│   │   │       ├── UsageDisplay.tsx
│   │   │       └── PaymentMethod.tsx
│   │   └── preferences/
│   │       ├── page.tsx      # User preferences
│   │       └── components/
│   │           ├── NotificationSettings.tsx
│   │           ├── ThemeSelector.tsx
│   │           └── LanguageSelector.tsx
│   │
│   └── onboarding/
│       ├── page.tsx          # Onboarding wizard
│       ├── loading.tsx       # Onboarding loading
│       └── components/
│           ├── OnboardingWizard.tsx
│           ├── ProfileStep.tsx
│           ├── SocialStep.tsx
│           ├── BrandVoiceStep.tsx
│           └── FirstCampaignStep.tsx
│
├── api/                      # API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── signup/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   ├── campaigns/
│   │   ├── route.ts          # CRUD operations
│   │   ├── [id]/
│   │   │   ├── route.ts
│   │   │   ├── publish/
│   │   │   │   └── route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts
│   │   └── generate/
│   │       └── route.ts      # AI content generation
│   ├── analytics/
│   │   ├── dashboard/
│   │   │   └── route.ts
│   │   └── campaigns/
│   │       └── route.ts
│   ├── settings/
│   │   ├── profile/
│   │   │   └── route.ts
│   │   ├── social/
│   │   │   └── route.ts
│   │   └── brand-voice/
│   │       └── route.ts
│   ├── ai/
│   │   ├── generate/
│   │   │   └── route.ts      # Content generation
│   │   ├── improve/
│   │   │   └── route.ts      # Content improvement
│   │   └── trending/
│   │       └── route.ts      # Trending topics
│   └── webhooks/
│       ├── stripe/
│       │   └── route.ts      # Stripe webhooks
│       └── social/
│           └── route.ts      # Social media webhooks
│
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── textarea.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── sheet.tsx
│   │   ├── calendar.tsx
│   │   ├── command.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── scroll-area.tsx
│   │   ├── alert.tsx
│   │   └── alert-dialog.tsx
│   │
│   ├── layout/               # Layout components
│   │   ├── PortalLayout.tsx  # Main portal wrapper
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── TopBar.tsx        # Header with user menu
│   │   ├── MobileNav.tsx     # Mobile navigation
│   │   ├── BreadcrumbNav.tsx # Page breadcrumbs
│   │   └── Footer.tsx        # Portal footer
│   │
│   ├── dashboard/            # Dashboard specific
│   │   ├── StatCard.tsx      # Metric display cards
│   │   ├── CampaignCard.tsx  # Campaign overview cards
│   │   ├── UsageBar.tsx      # AI usage indicators
│   │   ├── QuickActions.tsx  # Action button grid
│   │   └── WelcomeBanner.tsx # New user welcome
│   │
│   ├── campaigns/            # Campaign components
│   │   ├── CampaignWizard.tsx # Multi-step creation
│   │   ├── ContentEditor.tsx  # Rich content editor
│   │   ├── PlatformSelector.tsx # Platform selection
│   │   ├── BrandVoiceSelector.tsx # Voice dropdown
│   │   ├── SchedulingCalendar.tsx # Date/time picker
│   │   ├── AIGenerationModal.tsx # AI progress modal
│   │   ├── ContentPreview.tsx # Platform previews
│   │   ├── ThreadBuilder.tsx  # Twitter thread editor
│   │   ├── HashtagSuggester.tsx # Hashtag suggestions
│   │   ├── EmojiPicker.tsx    # Emoji selection
│   │   └── MediaUploader.tsx  # File upload
│   │
│   ├── analytics/            # Analytics components
│   │   ├── MetricsChart.tsx  # Chart visualizations
│   │   ├── PlatformComparison.tsx # Performance table
│   │   ├── TopPerformers.tsx # Best content list
│   │   ├── EngagementHeatmap.tsx # Time-based viz
│   │   └── DateRangeSelector.tsx # Date filtering
│   │
│   ├── settings/             # Settings components
│   │   ├── ProfileForm.tsx   # User profile editing
│   │   ├── SocialConnector.tsx # OAuth connections
│   │   ├── BrandVoiceCreator.tsx # Voice configuration
│   │   ├── APIKeyManager.tsx # API key management
│   │   ├── BillingPanel.tsx  # Subscription management
│   │   └── PreferencesForm.tsx # User preferences
│   │
│   ├── onboarding/           # Onboarding flow
│   │   ├── OnboardingWizard.tsx # Main wizard
│   │   ├── ProgressIndicator.tsx # Step progress
│   │   ├── SocialConnectionGrid.tsx # Platform grid
│   │   ├── VoicePreview.tsx  # Brand voice demo
│   │   └── WelcomeCard.tsx   # Getting started
│   │
│   ├── common/               # Shared components
│   │   ├── LoadingSpinner.tsx # Loading states
│   │   ├── EmptyState.tsx    # Empty list states
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── ConfirmDialog.tsx # Confirmation modals
│   │   ├── SearchInput.tsx   # Search functionality
│   │   ├── FilterDropdown.tsx # Filtering options
│   │   ├── SortDropdown.tsx  # Sorting options
│   │   ├── NotificationCenter.tsx # Notifications
│   │   ├── CharacterCounter.tsx # Text counting
│   │   └── CopyButton.tsx    # Copy to clipboard
│   │
│   └── auth/                 # Authentication components
│       ├── LoginForm.tsx     # Login form
│       ├── SignupForm.tsx    # Signup form
│       ├── ForgotPasswordForm.tsx # Password reset
│       ├── SocialLoginButton.tsx # OAuth buttons
│       └── AuthLayout.tsx    # Auth page layout
│
├── lib/                      # Utility libraries
│   ├── auth.ts              # Authentication utilities
│   ├── supabase.ts          # Supabase client
│   ├── validations.ts       # Form validation schemas
│   ├── utils.ts             # General utilities
│   ├── constants.ts         # App constants
│   ├── api.ts               # API client functions
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCampaigns.ts
│   │   ├── useAnalytics.ts
│   │   ├── useSettings.ts
│   │   └── useNotifications.ts
│   └── stores/              # State management
│       ├── authStore.ts     # Auth state (Zustand)
│       ├── campaignStore.ts # Campaign state
│       └── uiStore.ts       # UI state
│
├── styles/                  # Stylesheets
│   ├── globals.css          # Global styles
│   ├── components.css       # Component-specific styles
│   └── animations.css       # Framer Motion animations
│
├── types/                   # TypeScript types
│   ├── auth.ts             # Authentication types
│   ├── campaign.ts         # Campaign types
│   ├── analytics.ts        # Analytics types
│   ├── settings.ts         # Settings types
│   └── api.ts              # API response types
│
├── middleware.ts            # Next.js middleware (auth)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
├── components.json         # shadcn/ui configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── README.md              # Project documentation
```

---

## Animation Guidelines

Use Framer Motion for:
- Page transitions (fade + slide)
- Card hover effects (scale 1.02)
- Button press (scale 0.98)
- Loading spinners
- Modal enter/exit

**Example:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content here
</motion.div>
```

---

## Priority Order

**Phase 1 (Day 1):**
1. Portal layout (sidebar + top bar)
2. Dashboard page
3. Settings page (profile tab only)
4. Login/signup pages

**Phase 2 (Day 2):**
5. Onboarding flow (4 steps)
6. Create campaign page
7. Review campaign page
8. Campaigns list page
9. Analytics page (basic)

**Phase 3 (Polish):**
10. Animations and micro-interactions
11. Mobile responsive design
12. Empty states and illustrations
13. Loading states and skeletons
14. Error handling and recovery

---

## Responsive Design Specifications

### Mobile (320px - 768px)
- **Sidebar:** Hidden, hamburger menu + bottom nav
- **Cards:** Single column, full width
- **Forms:** Stacked fields, larger touch targets (44px min)
- **Buttons:** Full width on mobile, minimum 44px height
- **Tables:** Horizontal scroll or card view
- **Modals:** Full screen on small devices

### Tablet (768px - 1024px)
- **Sidebar:** Collapsible, icon-only mode
- **Cards:** 2-column grid
- **Forms:** 2-column layout for related fields
- **Dashboard:** 2x2 stat grid

### Desktop (1024px+)
- **Sidebar:** Full sidebar with labels
- **Cards:** 3-4 column grid
- **Forms:** Multi-column layouts
- **Dashboard:** 4-column stat grid
- **Modals:** Centered with max-width

### Breakpoint Classes (Tailwind)
```css
/* Mobile First */
.stat-grid {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2;
  @apply lg:grid-cols-4;
}

.campaign-grid {
  @apply grid grid-cols-1 gap-6;
  @apply md:grid-cols-2;
  @apply xl:grid-cols-3;
}
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements accessible via tab
- **Screen Readers:** Proper ARIA labels and landmarks
- **Focus Indicators:** Visible focus states for all controls

### Implementation Details
```tsx
// Button with proper accessibility
<Button
  className="focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
  aria-label="Create new campaign"
>
  Create Campaign
</Button>

// Form field with proper labeling
<div className="space-y-2">
  <Label htmlFor="campaign-name">Campaign Name</Label>
  <Input
    id="campaign-name"
    aria-describedby="campaign-name-error"
    aria-invalid={errors.name ? 'true' : 'false'}
  />
  {errors.name && (
    <p id="campaign-name-error" className="text-red-600 text-sm" role="alert">
      {errors.name}
    </p>
  )}
</div>
```

### Keyboard Shortcuts
- **Ctrl/Cmd + K:** Open command palette
- **C:** Create new campaign (when not in input)
- **Escape:** Close modals/dropdowns
- **Tab/Shift+Tab:** Navigate between elements
- **Space/Enter:** Activate buttons/links

---

## Performance Guidelines

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

### Implementation Strategies
```tsx
// Lazy load heavy components
const AnalyticsChart = lazy(() => import('./AnalyticsChart'))

// Optimize images
<Image
  src="/campaign-preview.jpg"
  alt="Campaign preview"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
/>

// Virtualize long lists
import { FixedSizeList as List } from 'react-window'

<List
  height={400}
  itemCount={campaigns.length}
  itemSize={80}
  itemData={campaigns}
>
  {CampaignRow}
</List>
```

### Bundle Size Optimization
- Code splitting by route
- Tree shaking unused dependencies
- Dynamic imports for large libraries
- Minimize third-party dependencies

---

## State Management Architecture

### Zustand Store Structure
```typescript
// Auth Store
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: ProfileData) => Promise<void>
}

// Campaign Store
interface CampaignState {
  campaigns: Campaign[]
  currentCampaign: Campaign | null
  loading: boolean
  creating: boolean
  fetchCampaigns: () => Promise<void>
  createCampaign: (data: CampaignData) => Promise<Campaign>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}

// UI Store
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}
```

---

## Testing Strategy

### Unit Testing (Jest + React Testing Library)
```typescript
// Component tests
test('renders campaign card with correct data', () => {
  const campaign = mockCampaign()
  render(<CampaignCard campaign={campaign} />)
  
  expect(screen.getByText(campaign.name)).toBeInTheDocument()
  expect(screen.getByText(campaign.status)).toBeInTheDocument()
})

// Hook tests
test('useCampaigns fetches and returns campaigns', async () => {
  const { result } = renderHook(() => useCampaigns())
  
  await waitFor(() => {
    expect(result.current.campaigns).toHaveLength(3)
    expect(result.current.loading).toBe(false)
  })
})
```

### E2E Testing (Playwright)
```typescript
// Critical user flows
test('user can create and publish campaign', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="create-campaign"]')
  
  await page.fill('[data-testid="campaign-name"]', 'Test Campaign')
  await page.selectOption('[data-testid="platform-select"]', 'twitter')
  await page.click('[data-testid="generate-content"]')
  
  await expect(page.locator('[data-testid="content-preview"]')).toBeVisible()
  await page.click('[data-testid="publish-campaign"]')
  
  await expect(page.locator('text=Campaign published successfully')).toBeVisible()
})
```

---

## Security Considerations

### Client-Side Security
- Sanitize all user inputs
- Validate data before sending to API
- Use HTTPS for all requests
- Implement proper CORS policies
- Store sensitive data securely (no localStorage for tokens)

### Implementation
```typescript
// Input sanitization
import DOMPurify from 'dompurify'

const sanitizedContent = DOMPurify.sanitize(userInput)

// API request with proper headers
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## Error Handling & Recovery

### Error Boundary Implementation
```typescript
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    // Log to error tracking service
    trackError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Network Error Handling
```typescript
// API error handling with retry logic
const apiCall = async (url: string, options: RequestInit, retries = 3): Promise<any> => {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return apiCall(url, options, retries - 1)
    }
    throw error
  }
}
```

---

## Documentation & Handoff

### Component Documentation Template
```typescript
/**
 * CampaignCard Component
 * 
 * @description Displays campaign information in a card format with actions
 * @param campaign - Campaign object with name, status, platforms, and metrics
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * 
 * @example
 * <CampaignCard
 *   campaign={campaignData}
 *   onEdit={() => router.push(`/campaigns/${campaign.id}/edit`)}
 *   onDelete={() => handleDelete(campaign.id)}
 * />
 */
```

### Design Token Documentation
```typescript
// colors.ts
export const colors = {
  primary: {
    50: '#f0f4ff',
    500: '#6366f1',  // Main primary color
    600: '#5855eb',  // Hover state
    900: '#312e81',  // Text on light backgrounds
  },
  // ... other color definitions
}

// spacing.ts
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  // ... other spacing definitions
}
```

---

## Launch Checklist

### Pre-Launch Requirements
- [ ] All components implemented and tested
- [ ] Responsive design verified on all breakpoints
- [ ] Accessibility audit completed (WAVE, axe-core)
- [ ] Performance audit completed (Lighthouse score > 90)
- [ ] Error handling implemented for all user flows
- [ ] Loading states implemented for all async operations
- [ ] Empty states designed for all list views
- [ ] Form validation implemented and tested
- [ ] SEO meta tags added to all pages
- [ ] Analytics tracking implemented
- [ ] Error logging service integrated
- [ ] Security review completed
- [ ] Cross-browser testing completed
- [ ] End-to-end tests passing
- [ ] Documentation completed
- [ ] Deployment pipeline configured

### Post-Launch Monitoring
- [ ] Core Web Vitals monitoring
- [ ] Error rate monitoring
- [ ] User session recording
- [ ] Performance monitoring
- [ ] A/B testing framework ready
- [ ] User feedback collection system
- [ ] Analytics dashboard configured
- [ ] Bug reporting system active

---

## Notes for Implementation Team

### Backend Integration Points
**I'll provide:**
- Supabase auth configuration
- API endpoint specifications
- Database schema and migrations
- Real-time subscriptions setup
- File upload configuration
- Social media OAuth configurations
- Stripe webhook handlers
- AI service integrations (local + cloud)

**Frontend team handles:**
- All UI component implementation
- Client-side routing and navigation
- Form handling and validation
- State management (Zustand stores)
- Error boundaries and fallbacks
- Loading and empty states
- Responsive design implementation
- Accessibility compliance
- Performance optimization
- Animation implementation

### Communication Protocol
- **Daily standups:** Progress updates and blockers
- **Component reviews:** Design approval before implementation
- **API integration:** Backend endpoints ready before frontend integration
- **Testing coordination:** E2E tests cover full user flows
- **Performance reviews:** Weekly Lighthouse audits
- **Design system updates:** Documented in shared design tokens

### Tools & Resources
- **Design System:** Figma link will be provided
- **API Documentation:** OpenAPI spec will be available
- **Component Library:** Storybook for component development
- **Testing:** Jest + React Testing Library + Playwright
- **Code Quality:** ESLint + Prettier + Husky pre-commit hooks
- **Performance:** Bundle analyzer + Lighthouse CI
- **Monitoring:** Vercel Analytics + Sentry error tracking

**Ready to build the future of AI-powered content creation! 🚀**
