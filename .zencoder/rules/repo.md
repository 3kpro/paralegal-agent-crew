---
description: Repository Information Overview
alwaysApply: true
---

# 3K Pro Services Landing Page Information

## Summary
Modern, sleek landing page for 3K Pro Services AI-powered content marketing platform. Built with Next.js and React, this responsive website showcases the company's AI content marketing capabilities, including a live Twitter thread generator demo.

## Structure
- **app/**: Next.js App Router structure with page components and API routes
- **components/**: React components organized by type (sections, modals, ui)
- **hooks/**: Custom React hooks for functionality like Twitter demo
- **utils/**: Utility functions for common operations
- **__tests__/**: Jest test files organized by component type
- **public/**: Static assets (images, icons)

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: Node.js 18+ (specified in Dockerfile and README)
**Framework**: Next.js 14
**Build System**: npm scripts
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- next: ^14.2.33 (React framework)
- react: ^18.2.0 (UI library)
- react-dom: ^18.2.0 (DOM rendering)
- tailwindcss: ^3.3.6 (CSS framework)

**Development Dependencies**:
- typescript: ^5.3.2 (Type checking)
- jest: ^29.7.0 (Testing framework)
- @testing-library/react: ^13.4.0 (React testing utilities)
- eslint: ^8.54.0 (Code linting)

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

## Docker
**Dockerfile**: Dockerfile in root directory
**Base Image**: node:18-alpine
**Exposed Port**: 3000
**Build Command**: `npm run docker:build`
**Run Command**: `npm run docker:run`

## Testing
**Primary E2E Framework**: Playwright (for critical user journeys and browser automation)
**Component Framework**: Jest with React Testing Library
**Target Framework**: Playwright (for E2E automation), Jest (for components)
**Test Location**: 
- E2E Tests: `tests/e2e/` directory (Playwright)
- Component Tests: `__tests__/` directory (Jest)
**Configuration**: 
- Playwright: playwright.config.ts
- Jest: jest.config.js and jest.setup.js
**Test Types**: 
- E2E Browser Tests (`tests/e2e/`) - Playwright
- Component tests (`__tests__/components/`) - Jest
- API route tests (`__tests__/api/`) - Jest
- Custom hook tests (`__tests__/hooks/`) - Jest
- Legacy E2E tests (`__tests__/e2e/`) - Jest
**Key Test Suites**:
- `premium-upgrade-functional.test.tsx`: End-to-end tests for Premium upgrade flow
- `stripe-checkout-basic.test.ts`: API structure validation for Stripe integration
**Run Commands**:
```bash
# Jest (Component & API Tests)
npm test
npm run test:watch
npm run test:coverage
npm test -- __tests__/e2e/premium-upgrade-functional.test.tsx
npm test -- __tests__/api/stripe-checkout-basic.test.ts

# Playwright (E2E Browser Tests)
npx playwright test
npx playwright test tests/e2e/<test-name>.spec.ts --reporter=line
npx playwright show-report
```

## API Routes
**Contact Form**: `/api/contact` - Integrates with n8n webhook
**Twitter Demo**: `/api/twitter-thread` - Generates Twitter threads
**Stripe Checkout**: `/api/stripe/checkout` - Creates Stripe checkout sessions
**Health Check**: `/api/health` - Service health monitoring

## Environment Variables
**Required**:
- NEXT_PUBLIC_CONTACT_WEBHOOK_URL - n8n webhook URL for contact form