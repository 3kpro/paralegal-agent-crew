Keep the color scheme the same as global CSS

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
orbital-loader.tsx
"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

const orbitalLoaderVariants = cva("flex gap-2 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
})

export interface OrbitalLoaderProps {
  message?: string
  /**
   * Position of the message relative to the spinner.
   * @default bottom
   */
  messagePlacement?: "top" | "bottom" | "left" | "right"
}

export function OrbitalLoader({
  className,
  message,
  messagePlacement,
  ...props
}: React.ComponentProps<"div"> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalLoaderVariants({ messagePlacement }))}>
      <div className={cn("relative w-16 h-16", className)} {...props}>
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-transparent border-t-foreground rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      {message && <div>{message}</div>}
    </div>
  )
}


demo.tsx
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function DemoOne() {
  return <OrbitalLoader />;
}

```

Install NPM dependencies:
```bash
motion, class-variance-authority
```

## Current Spinner Locations to Replace

Search the codebase for these existing spinner patterns and replace with OrbitalLoader:

1. **Campaign Creation Loading States**
   - `app/(portal)/campaigns/create/page.tsx` - Trend discovery loading ("Finding trends...")
   - `app/(portal)/campaigns/create/page.tsx` - Content generation loading ("Generating...")

2. **Dashboard Loading**
   - Any dashboard data fetching states

3. **Generic Loading Components**
   - `components/ui/bouncing-dots.tsx` - **DEPRECATE** this component after migration
   - Search for `<BouncingDots />` usage and replace with `<OrbitalLoader />`

## Replacement Strategy

**OrbitalLoader Usage:**
```tsx
// Basic usage (no message)
<OrbitalLoader />

// With message below spinner (default)
<OrbitalLoader message="Finding trends..." />

// With message above spinner
<OrbitalLoader message="Generating content..." messagePlacement="top" />

// Centered in viewport (for full-page loading)
<div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
  <OrbitalLoader message="Loading..." />
</div>
```

**Color Adaptation:**
- OrbitalLoader uses `border-t-foreground` which adapts to theme automatically
- No color changes needed - matches global CSS theme

**BouncingDots Component:**
- After migration complete, DELETE `components/ui/bouncing-dots.tsx`
- Search codebase for any remaining imports and remove

## Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's arguments and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

## Steps to Integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies: `npm install motion class-variance-authority`
 2. Create component at `/components/ui/orbital-loader.tsx`
 3. Find and replace all `<BouncingDots />` usage with `<OrbitalLoader />`
 4. Update imports from `@/components/ui/bouncing-dots` to `@/components/ui/orbital-loader`
 5. Test all loading states to ensure spinners render correctly
 6. Delete `components/ui/bouncing-dots.tsx` after verifying migration
 7. Use lucide-react icons for any additional svgs or logos if needed
