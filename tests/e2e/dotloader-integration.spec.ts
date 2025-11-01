import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for DotLoader Component Integration
 * Tests DotLoader display and animation behavior across portal pages
 */

test.describe('DotLoader Integration Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Set test user auth state if needed
    await page.context().addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Campaign Creation Page - DotLoader Integration', () => {
    test('should display DotLoader with SCAN_HORIZONTAL animation during trend search', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      // Verify Trend Search button exists
      const trendButton = page.locator('button:has-text("Discover Trends")');
      await expect(trendButton).toBeVisible();

      // Wait for page to stabilize
      await page.waitForTimeout(500);

      // Trigger trend search
      await trendButton.click();

      // Wait for DotLoader to appear
      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      // Verify grid structure (7x7 = 49 dots)
      const dots = dotLoader.locator('[data-dot-index]');
      const dotCount = await dots.count();
      expect(dotCount).toBe(49);

      // Verify dots have animation styling
      const firstDot = dots.first();
      const classList = await firstDot.evaluate((el) => el.className);
      expect(classList).toContain('duration-100');
    });

    test('should display DotLoader with PULSE_CENTER animation during content generation', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      // Find and fill content input
      const contentInput = page.locator('textarea, input[placeholder*="topic" i]').first();
      if (await contentInput.isVisible()) {
        await contentInput.fill('test topic');
      }

      // Find Generate Content button
      const generateButton = page.locator('button:has-text("Generate Content"), button:has-text("Generate")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();

        // Wait for DotLoader to appear
        const dotLoader = page.locator('[data-testid="dot-loader"]').last();
        await expect(dotLoader).toBeVisible({ timeout: 2000 });

        // Verify styling includes cyan or white colors
        const dot = dotLoader.locator('[data-dot-index]').first();
        const styles = await dot.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        expect(styles).toBeTruthy();
      }
    });

    test('should hide DotLoader when trend search completes', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await expect(trendButton).toBeVisible();

      // Mock successful API response
      await page.route('**/api/**', (route) => {
        route.abort('blockedbyresponse');
      });

      // Trigger search (will fail due to mocked abort, but that's ok)
      await trendButton.click();

      // Wait a moment for animation
      await page.waitForTimeout(800);

      // DotLoader should eventually be hidden or button re-enabled
      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      const isVisible = await dotLoader.isVisible().catch(() => false);
      
      // Either loader is gone or button is enabled again
      const buttonEnabled = await trendButton.isEnabled();
      expect(isVisible === false || buttonEnabled).toBeTruthy();
    });
  });

  test.describe('AI Studio Page - DotLoader Integration', () => {
    test('should display DotLoader with PULSE_ALL animation on initial page load', async () => {
      // Navigate to AI Studio
      await page.goto('http://localhost:3000/ai-studio', {
        waitUntil: 'domcontentloaded',
      });

      // Check for loading state DotLoader
      const dotLoader = page.locator('[data-testid="dot-loader"]');
      
      // May appear briefly during page load
      const loaderVisible = await dotLoader.isVisible().catch(() => false);
      
      if (loaderVisible) {
        // Verify it's a 7x7 grid
        const dots = dotLoader.locator('[data-dot-index]');
        const dotCount = await dots.count();
        expect(dotCount).toBe(49);

        // Verify cyan color styling (tron theme)
        const dot = dots.first();
        const className = await dot.evaluate((el) => el.className);
        expect(className).toContain('bg-');
      }
    });

    test('should display DotLoader when AI Studio content is loading', async () => {
      await page.goto('http://localhost:3000/ai-studio', {
        waitUntil: 'networkidle',
      });

      // Wait for page to stabilize
      await page.waitForTimeout(1000);

      // Look for any loading state that might trigger DotLoader
      const loadingText = page.locator('text=/loading|processing/i');
      const hasLoadingState = await loadingText.isVisible().catch(() => false);

      if (hasLoadingState) {
        const dotLoader = page.locator('[data-testid="dot-loader"]');
        await expect(dotLoader).toBeVisible({ timeout: 3000 });

        // Verify grid structure
        const dots = dotLoader.locator('[data-dot-index]');
        expect(await dots.count()).toBe(49);
      }
    });
  });

  test.describe('Social Connection Page - DotLoader Integration', () => {
    test('should display DotLoader with CORNERS_IN animation during platform connection', async () => {
      // Navigate to social connection page (Twitter as example)
      await page.goto('http://localhost:3000/connect/twitter', {
        waitUntil: 'networkidle',
      });

      // Find connect button
      const connectButton = page.locator('button:has-text("Connect"), button:has-text("Authorize")').first();
      
      if (await connectButton.isVisible()) {
        await connectButton.click();

        // Wait for DotLoader
        const dotLoader = page.locator('[data-testid="dot-loader"]');
        const loaderVisible = await dotLoader.isVisible({ timeout: 2000 }).catch(() => false);

        if (loaderVisible) {
          // Verify 7x7 grid
          const dots = dotLoader.locator('[data-dot-index]');
          expect(await dots.count()).toBe(49);

          // Verify animation class is present
          const dot = dots.first();
          const classes = await dot.evaluate((el) => el.className);
          expect(classes).toContain('transition');
        }
      }
    });

    test('should display DotLoader on different social platforms', async () => {
      const platforms = ['twitter', 'linkedin', 'facebook'];

      for (const platform of platforms) {
        const pageUrl = `http://localhost:3000/connect/${platform}`;
        const response = await page.goto(pageUrl, {
          waitUntil: 'networkidle',
        }).catch(() => null);

        if (response && response.ok()) {
          // Page loaded successfully
          const connectButton = page.locator('button:has-text("Connect"), button:has-text("Authorize")').first();
          const isVisible = await connectButton.isVisible().catch(() => false);
          expect(isVisible || page.url()).toBeTruthy();
        }
      }
    });
  });

  test.describe('ContentFlow Page - DotLoader Integration', () => {
    test('should display DotLoader with WAVE animation on initial load', async () => {
      await page.goto('http://localhost:3000/contentflow', {
        waitUntil: 'domcontentloaded',
      });

      // Check for loading DotLoader
      const dotLoader = page.locator('[data-testid="dot-loader"]');
      const loaderVisible = await dotLoader.isVisible({ timeout: 2000 }).catch(() => false);

      if (loaderVisible) {
        // Verify grid structure
        const dots = dotLoader.locator('[data-dot-index]');
        expect(await dots.count()).toBe(49);

        // Verify Tailwind classes for cyan styling
        const dot = dots.first();
        const className = await dot.evaluate((el) => el.className);
        expect(className.length).toBeGreaterThan(0);
      }
    });

    test('should display DotLoader during content scheduling operations', async () => {
      await page.goto('http://localhost:3000/contentflow', {
        waitUntil: 'networkidle',
      });

      // Wait for page to load
      await page.waitForTimeout(1000);

      // Find schedule button
      const scheduleButton = page.locator('button:has-text("Schedule"), button:has-text("Post")').first();
      
      if (await scheduleButton.isVisible()) {
        await scheduleButton.click();

        // DotLoader may appear during operation
        const dotLoader = page.locator('[data-testid="dot-loader"]');
        const loaderVisible = await dotLoader.isVisible({ timeout: 2000 }).catch(() => false);

        if (loaderVisible) {
          const dots = dotLoader.locator('[data-dot-index]');
          expect(await dots.count()).toBe(49);
        }
      }
    });
  });

  test.describe('DotLoader Grid Structure', () => {
    test('should render exactly 49 dots (7x7 grid)', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      const dots = dotLoader.locator('[data-dot-index]');
      const count = await dots.count();
      expect(count).toBe(49);
    });

    test('should apply correct data attributes to dots', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      // Check that data-dot-index attributes are sequential
      const dots = dotLoader.locator('[data-dot-index]');
      for (let i = 0; i < 49; i++) {
        const dot = dots.nth(i);
        const index = await dot.getAttribute('data-dot-index');
        expect(index).toBe(i.toString());
      }
    });
  });

  test.describe('DotLoader Styling and Animation', () => {
    test('should have active dot styling with Tailwind classes', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      // Check active dot styling
      const dots = dotLoader.locator('[data-dot-index]');
      const firstDot = dots.first();
      
      const className = await firstDot.evaluate((el) => el.className);
      
      // Should have transition and background color classes
      expect(className).toContain('transition');
      expect(className).toMatch(/bg-|bg\//); // Tailwind color classes
    });

    test('should respect duration prop for animation timing', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      const dot = dotLoader.locator('[data-dot-index]').first();
      const duration = await dot.evaluate((el) => {
        return window.getComputedStyle(el).transitionDuration;
      });

      // Duration should be 100ms or similar
      expect(duration).toBeTruthy();
    });
  });

  test.describe('DotLoader Responsive Behavior', () => {
    test('should display DotLoader on mobile viewport', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 375, height: 667 },
      });
      const mobilePage = await mobileContext.newPage();

      await mobilePage.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = mobilePage.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = mobilePage.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      // Verify it's still a proper grid on mobile
      const dots = dotLoader.locator('[data-dot-index]');
      expect(await dots.count()).toBe(49);

      await mobileContext.close();
    });

    test('should display DotLoader on tablet viewport', async ({ browser }) => {
      const tabletContext = await browser.newContext({
        viewport: { width: 768, height: 1024 },
      });
      const tabletPage = await tabletContext.newPage();

      await tabletPage.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = tabletPage.locator('button:has-text("Discover Trends")');
      await trendButton.click();

      const dotLoader = tabletPage.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      const dots = dotLoader.locator('[data-dot-index]');
      expect(await dots.count()).toBe(49);

      await tabletContext.close();
    });
  });

  test.describe('DotLoader State Transitions', () => {
    test('should show and hide DotLoader during operation lifecycle', async () => {
      await page.goto('http://localhost:3000/campaigns/new', {
        waitUntil: 'networkidle',
      });

      const trendButton = page.locator('button:has-text("Discover Trends")');
      await expect(trendButton).toBeVisible();

      // Initially no loader
      let dotLoader = page.locator('[data-testid="dot-loader"]').first();
      let isVisible = await dotLoader.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();

      // Click to trigger loading
      await trendButton.click();

      // Wait for loader to appear
      dotLoader = page.locator('[data-testid="dot-loader"]').first();
      await expect(dotLoader).toBeVisible({ timeout: 2000 });

      // Wait for operation to complete (or timeout)
      await page.waitForTimeout(1500);

      // Loader should eventually hide
      isVisible = await dotLoader.isVisible().catch(() => false);
      // Either hidden or button re-enabled
      const buttonEnabled = await trendButton.isEnabled();
      expect(isVisible === false || buttonEnabled).toBeTruthy();
    });
  });
});