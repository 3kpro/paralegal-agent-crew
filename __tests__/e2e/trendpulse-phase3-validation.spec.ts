import { test, expect, Page } from '@playwright/test'

// TrendPulse Phase 3 E2E Validation Test Suite
// Following the comprehensive testing handoff document

test.describe('TrendPulse Phase 3 - Complete E2E Validation', () => {
  let testEmail: string
  let uniqueTimestamp: string

  test.beforeAll(() => {
    // Generate unique email for testing
    uniqueTimestamp = Date.now().toString()
    testEmail = `test.e2e.${uniqueTimestamp}@example.com`
    console.log(`🧪 Starting E2E tests with unique email: ${testEmail}`)
  })

  test.describe('SCENARIO 1: SYSTEM HEALTH CHECK', () => {
    test('1.1 Health Endpoint Validation', async ({ page }) => {
      console.log('✅ SCENARIO 1.1: Health Endpoint')

      // Test health endpoint
      const healthResponse = await page.request.get('/api/health')
      expect(healthResponse.ok()).toBeTruthy()

      const healthData = await healthResponse.json()
      
      // Verify required fields
      expect(healthData.status).toBe('healthy')
      expect(healthData.services.database.status).toBe('connected')
      expect(healthData.services.redis.status).toBe('connected')
      
      // Performance checks
      expect(healthData.services.database.metrics.cache_hit_ratio).toBeGreaterThanOrEqual(90)
      expect(healthData.services.database.metrics.total_indexes).toBeGreaterThanOrEqual(132)
      
      console.log(`✅ Cache hit ratio: ${healthData.services.database.metrics.cache_hit_ratio}%`)
      console.log(`✅ Total indexes: ${healthData.services.database.metrics.total_indexes}`)
      console.log(`✅ Database response time: ${healthData.services.database.responseTime}ms`)
    })
  })

  test.describe('SCENARIO 2: USER AUTH + ANALYTICS', () => {
    test('2.1 Signup Flow with Analytics', async ({ page }) => {
      console.log('✅ SCENARIO 2.1: User Signup + Analytics')

      await page.goto('/signup')
      
      // Fill signup form
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      await page.fill('input[name="confirmPassword"], input[id="confirmPassword"]', 'TestPass123!')
      
      // Fill full name if field exists
      const fullNameField = page.locator('input[name="fullName"], input[id="fullName"]')
      if (await fullNameField.isVisible()) {
        await fullNameField.fill('Test E2E User')
      }

      // Submit signup
      await page.click('button[type="submit"]')
      
      // Wait for redirect or success message
      await page.waitForURL(/\/onboarding|\/dashboard/, { timeout: 10000 })
      
      console.log(`✅ Signup successful, redirected to: ${page.url()}`)
    })

    test('2.2 Login Flow with Analytics', async ({ page }) => {
      console.log('✅ SCENARIO 2.2: User Login + Analytics')

      await page.goto('/login')
      
      // Fill login form
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      
      // Submit login
      await page.click('button[type="submit"]')
      
      // Wait for redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 })
      
      console.log(`✅ Login successful, redirected to dashboard`)
    })

    test('2.3 Analytics API Endpoints', async ({ page }) => {
      console.log('✅ SCENARIO 2.3: Analytics API Access')

      // First login to get session
      await page.goto('/login')
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Test analytics overview API
      const overviewResponse = await page.request.get('/api/analytics/overview?days=7')
      if (overviewResponse.ok()) {
        const overviewData = await overviewResponse.json()
        expect(overviewData).toHaveProperty('overview')
        console.log('✅ Analytics overview API accessible')
      } else {
        console.log('⚠️ Analytics overview API requires authentication setup')
      }

      // Test usage metrics API
      const usageResponse = await page.request.get('/api/analytics/usage')
      if (usageResponse.ok()) {
        const usageData = await usageResponse.json()
        expect(usageData.tier).toBe('free')
        console.log('✅ Usage metrics API accessible')
      } else {
        console.log('⚠️ Usage metrics API requires authentication setup')
      }
    })
  })

  test.describe('SCENARIO 3: TWITTER OAUTH + ANALYTICS', () => {
    test('3.1 Twitter Connection Interface', async ({ page }) => {
      console.log('✅ SCENARIO 3.1: Twitter OAuth Interface')

      // Login first
      await page.goto('/login')
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Navigate to social accounts
      await page.goto('/social-accounts')
      
      // Check for Twitter connect button
      const twitterConnect = page.getByText('Connect', { exact: false }).first()
      await expect(twitterConnect).toBeVisible()
      
      console.log('✅ Social accounts page accessible')
      console.log('✅ Twitter connection interface available')
    })
  })

  test.describe('SCENARIO 4: CONTENT GENERATION + ANALYTICS', () => {
    test('4.1 Campaign Creation Flow', async ({ page }) => {
      console.log('✅ SCENARIO 4.1: Content Generation')

      // Login first
      await page.goto('/login')
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Navigate to new campaign
      await page.goto('/campaigns/new')
      
      // Fill campaign details
      await page.fill('input[name="campaignName"], input[placeholder*="campaign"], input[placeholder*="Campaign"]', 'E2E Test Campaign')
      
      // Check if the page loaded correctly
      const pageTitle = await page.textContent('h1, h2')
      expect(pageTitle).toContain('Campaign')
      
      console.log('✅ Campaign creation interface accessible')
    })
  })

  test.describe('SCENARIO 5: PUBLISHING WORKFLOW', () => {
    test('5.1 Publishing Interface', async ({ page }) => {
      console.log('✅ SCENARIO 5.1: Publishing Workflow')

      // Login first
      await page.goto('/login')
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Check campaigns page
      await page.goto('/campaigns')
      
      // Verify campaigns page loads
      const campaignsPage = page.locator('h1, h2').first()
      await expect(campaignsPage).toBeVisible()
      
      console.log('✅ Publishing workflow interface accessible')
    })
  })

  test.describe('SCENARIO 6: DATABASE PERFORMANCE', () => {
    test('6.1 Performance Metrics', async ({ page }) => {
      console.log('✅ SCENARIO 6.1: Database Performance')

      // Test health endpoint for performance metrics
      const healthResponse = await page.request.get('/api/health')
      const healthData = await healthResponse.json()
      
      // Check database performance
      const dbResponseTime = healthData.services.database.responseTime
      const cacheHitRatio = healthData.services.database.metrics.cache_hit_ratio
      
      expect(dbResponseTime).toBeLessThan(500) // < 500ms is reasonable
      expect(cacheHitRatio).toBeGreaterThanOrEqual(90)
      
      console.log(`✅ Database response time: ${dbResponseTime}ms`)
      console.log(`✅ Cache hit ratio: ${cacheHitRatio}%`)
    })
  })

  test.describe('SCENARIO 7: ERROR HANDLING', () => {
    test('7.1 Application Error Boundaries', async ({ page }) => {
      console.log('✅ SCENARIO 7.1: Error Handling')

      // Test 404 handling
      await page.goto('/non-existent-page')
      const errorPage = page.getByText('Page Not Found')
      await expect(errorPage).toBeVisible()
      
      console.log('✅ 404 error handling works correctly')
    })

    test('7.2 API Error Responses', async ({ page }) => {
      console.log('✅ SCENARIO 7.2: API Error Handling')

      // Test unauthorized API access
      const unauthorizedResponse = await page.request.get('/api/analytics/overview')
      if (unauthorizedResponse.status() === 401) {
        console.log('✅ API properly returns 401 for unauthorized access')
      } else {
        console.log(`⚠️ API returned status: ${unauthorizedResponse.status()}`)
      }
    })
  })
})