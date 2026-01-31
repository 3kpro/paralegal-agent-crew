SPEC-001: XELORA Rebrand - Design System & Frontend Architecture
1. Project Manifesto
Objective: Replatform getxelora.com from a generic marketing site to a high-density, engineering-centric Micro-SaaS interface. Aesthetic References: 21st.dev, linear.app, vercel.com. Core Philosophies:

Information Density: No large white spaces. Use borders, grids, and bento-box layouts to compartmentalize data.

Tactility: Buttons must feel "physical" (subtle bevels, borders). Hover states must be instant.

Glassmorphism: Use backdrop-blur heavily but subtly.

Typography: Strict adherence to Geist Sans (sans-serif) and Geist Mono (monospace).

2. Technical Stack Constraints
Framework: Next.js 14+ (App Router).

Styling: Tailwind CSS (strict utility usage, no custom CSS files except globals.css).

UI Library: Shadcn/UI (Radix Primitives).

Icons: Lucide React.

Animation: Framer Motion (only for complex orchestrations), Tailwind animate- classes for simple loops.

Fonts: geist/font package.

3. Design Tokens & Tailwind Config
The agents must extend tailwind.config.ts with these specific values to match the "Linear" look:

TypeScript

// tailwind.config.ts extension requirements
{
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))", // #09090b (Rich Black)
        foreground: "hsl(var(--foreground))", // #fafafa
        border: "hsl(var(--border))",         // #27272a
        primary: {
          DEFAULT: "hsl(var(--primary))",     // #fafafa
          foreground: "hsl(var(--primary-foreground))" // #18181b
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",       // #27272a
          foreground: "hsl(var(--muted-foreground))" // #a1a1aa
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",      // #27272a
          foreground: "hsl(var(--accent-foreground))" // #fafafa
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
      }
    }
  }
}
4. Component Architecture (The "Handoff")
A. The "Shell" (Layout)
Navbar: Floating, distinct border, glass background.

Left: Wordmark "XELORA" (Tracking tight, bold).

Right: "Sign In" (Ghost button) + "Get Started" (Primary button, white background, black text, slight glow).

Background: Dark gray (#09090b). A subtle grid pattern overlay (opacity 0.1) that fades out at the bottom using a mask image.

B. Hero Section (Above the fold)
Headline: "Predict Viral Momentum." (H1).

Subheadline: "The predictive intelligence layer for creators. Stop guessing. Start engineering." (Text-muted-foreground).

The "Hook" (Interactive Element): Instead of a static image, build a Mock Terminal component.

Behavior: It auto-types a command: xelora analyze --topic "AI Agents"

Output: It renders a JSON-like response highlighting "Viral Score: 98/100" in green.

Tech: Use framer-motion for the typing effect.

C. The "Bento Grid" (Features)
Replace standard columns with a 3x2 Grid.

Card 1 (Large, Left): Viral DNA Decoder. Visual: A radar chart (Recharts or simple SVG) showing "Emotion," "Hook," "Value."

Card 2 (Small, Top Right): Multi-Platform. Visual: Icons of X, LinkedIn, TikTok with a "Sync" spinner.

Card 3 (Small, Bottom Right): Real-time Signals. Visual: A scrolling ticker of "Trending Now" topics.

D. Pricing (The "SaaS" Look)
Toggle: "Monthly" vs "Yearly" (pill shape).

Cards: Three cards. The middle card ("Pro") must be slightly taller and have a border gradient (using bg-gradient-to-b from-zinc-700 to-transparent).

Checkmarks: Use Lucide check icons, green color.

5. Implementation Roadmap (for Agents)
Scaffold: Initialize Next.js app with TypeScript, Tailwind, and Shadcn.

Theming: Configure globals.css with CSS variables for HSL colors (Zinc palette).

Typography: Install geist/font and configure layout.tsx.

UI Primitives: Install Shadcn components: button, card, badge, separator.

Page Construction:

Create components/landing/hero-section.tsx

Create components/landing/bento-grid.tsx

Create components/landing/site-footer.tsx

Polish: Add framer-motion entry animations (fade up with slight delay).