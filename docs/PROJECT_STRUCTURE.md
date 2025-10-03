# Project Structure

This document outlines the organization and structure of the 3K Pro Services Landing Page project.

## 📁 Directory Structure

```
c:\DEV\3K-Pro-Services\landing-page\
├── 📁 app/                     # Next.js App Router
│   ├── 📁 api/                 # API routes
│   │   ├── contact/            # Contact form handler
│   │   ├── health/             # Health check endpoint
│   │   ├── twitter-thread/     # Twitter thread generator
│   │   └── twitter-post/       # Twitter post handler
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Main landing page
│   ├── manifest.ts             # PWA manifest
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # Robots.txt configuration
├── 📁 components/              # React components
│   ├── 📁 sections/            # Page sections
│   │   ├── HeroSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── PricingSection.tsx
│   │   ├── CTASection.tsx
│   │   └── ContactSection.tsx
│   ├── 📁 modals/              # Modal components
│   │   ├── DemoModal.tsx
│   │   ├── EnhancedTwitterDemo.tsx
│   │   └── TrialModal.tsx
│   ├── 📁 ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── Navigation.tsx          # Main navigation
│   ├── Footer.tsx              # Site footer
│   ├── ContactForm.tsx         # Contact form
│   └── index.ts                # Component exports
├── 📁 hooks/                   # Custom React hooks
│   ├── useTwitterDemo.ts       # Twitter demo functionality
│   └── index.ts                # Hook exports
├── 📁 utils/                   # Utility functions
│   ├── scroll.ts               # Scroll utilities
│   └── index.ts                # Utility exports
├── 📁 lib/                     # Library functions
│   └── utils.ts                # Common utilities
├── 📁 types/                   # TypeScript type definitions
│   └── index.ts                # Type exports
├── 📁 constants/               # Application constants
│   └── index.ts                # Constant exports
├── 📁 public/                  # Static assets
│   ├── 📁 images/              # Image assets
│   ├── 📁 icons/               # Icon assets
│   ├── favicon.ico             # Site favicon
│   ├── robots.txt              # Static robots.txt
│   └── sitemap.xml             # Static sitemap
├── 📁 __tests__/               # Test files
│   ├── 📁 api/                 # API route tests
│   ├── 📁 components/          # Component tests
│   ├── 📁 hooks/               # Hook tests
│   └── setup.ts                # Test setup
├── 📁 docs/                    # Documentation
│   ├── 📁 backups/             # Backup files
│   ├── PROJECT_STRUCTURE.md    # This file
│   ├── ai-tools-recommendations.md
│   └── BudgetGate.md
└── Configuration files         # Various config files
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- Components are organized by type and responsibility
- Business logic is separated into custom hooks
- Utilities are centralized in dedicated directories

### 2. **Scalability**
- Modular component structure allows for easy expansion
- Index files provide clean import paths
- Type definitions are centralized for consistency

### 3. **Maintainability**
- Clear naming conventions throughout the project
- Comprehensive documentation and comments
- Consistent file and folder organization

### 4. **Performance**
- Next.js App Router for optimal performance
- Component-level code splitting
- Optimized static asset organization

## 📋 File Naming Conventions

### Components
- **PascalCase** for component files: `HeroSection.tsx`
- **camelCase** for component props and functions
- **kebab-case** for CSS classes and IDs

### Utilities and Hooks
- **camelCase** for function names: `scrollToContact`
- **PascalCase** for hook names: `useTwitterDemo`

### Constants
- **SCREAMING_SNAKE_CASE** for constants: `COMPANY_INFO`

## 🔧 Import Organization

### Preferred Import Structure
```typescript
// External libraries
import { useState } from 'react'
import { NextRequest } from 'next/server'

// Internal components (using index files)
import { HeroSection, Navigation } from '../components'

// Internal utilities
import { scrollToContact } from '../utils'

// Types
import type { ContactFormData } from '../types'
```

## 🧪 Testing Strategy

### Test Organization
- Tests mirror the source code structure
- Each component/hook/utility has corresponding tests
- Integration tests for API routes
- Unit tests for individual components and functions

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.ts`
- API tests: `route-name.test.ts`

## 📦 Build and Deployment

### Development
```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Production
```bash
npm run build        # Build for production
npm start           # Start production server
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

## 🔄 Future Considerations

### Potential Additions
- `middleware.ts` for request/response handling
- `instrumentation.ts` for monitoring
- Additional utility directories as the project grows
- More comprehensive testing utilities

### Scalability Notes
- The current structure supports easy addition of new pages
- Component library can be expanded with more UI components
- API routes can be organized into subdirectories as needed