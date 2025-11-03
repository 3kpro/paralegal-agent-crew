import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

test.describe("Critical User Flow: Signup → Create Campaign → Publish", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testName = "Test User";
  const campaignName = `Test Campaign ${Date.now()}`;

  test("Complete user journey from signup to campaign publish", async ({ page }) => {
    // Step 1: Navigate to signup page
    await test.step("Navigate to signup", async () => {
      await page.goto(`${BASE_URL}/signup`);
      await expect(page).toHaveTitle(/Sign Up|Content Cascade/);
    });

    // Step 2: Fill out signup form
    await test.step("Complete signup form", async () => {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[name="full_name"], input[placeholder*="name"]', testName);
      await page.fill('input[type="password"]:not([name="confirmPassword"])', testPassword);
      await page.fill('input[name="confirmPassword"], input[placeholder*="Confirm"]', testPassword);
      
      await page.click('button[type="submit"], button:has-text("Sign Up")');
    });

    // Step 3: Wait for redirect to dashboard or portal
    await test.step("Verify successful signup", async () => {
      await page.waitForURL(/\/(dashboard|portal|campaigns)/, { timeout: 10000 });
      await expect(page.url()).toContain(BASE_URL);
    });

    // Step 4: Navigate to create campaign
    await test.step("Navigate to create campaign", async () => {
      // Try different navigation methods
      const createButton = page.locator('a[href="/campaigns/new"], button:has-text("Create"), a:has-text("New Campaign")').first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
      } else {
        await page.goto(`${BASE_URL}/campaigns/new`);
      }
      
      await expect(page.url()).toContain("/campaigns/new");
    });

    // Step 5: Fill in campaign name (Card 1)
    await test.step("Enter campaign name", async () => {
      const nameInput = page.locator('input[placeholder*="campaign name"], input[name="campaignName"]').first();
      await nameInput.waitFor({ state: "visible" });
      await nameInput.fill(campaignName);
      
      // Click next/continue button
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Step 6: Select platforms (Card 2)
    await test.step("Select target platforms", async () => {
      // Wait for platform selection to be visible
      await page.waitForTimeout(500);
      
      // Select at least Twitter and LinkedIn
      const twitterButton = page.locator('button:has-text("Twitter"), [data-platform="twitter"]').first();
      const linkedinButton = page.locator('button:has-text("LinkedIn"), [data-platform="linkedin"]').first();
      
      if (await twitterButton.isVisible()) {
        await twitterButton.click();
      }
      if (await linkedinButton.isVisible()) {
        await linkedinButton.click();
      }
      
      // Click next
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Step 7: Search for trends (Card 3)
    await test.step("Search and select trends", async () => {
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="trend"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill("AI technology");
        
        const searchButton = page.locator('button:has-text("Search"), button[type="submit"]').first();
        if (await searchButton.isVisible()) {
          await searchButton.click();
        }
        
        // Wait for results
        await page.waitForTimeout(2000);
        
        // Select first trend
        const firstTrend = page.locator('[data-trend], .trend-card, button:has-text("Select")').first();
        if (await firstTrend.isVisible()) {
          await firstTrend.click();
        }
      }
      
      // Click next
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Generate")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Step 8: Generate content
    await test.step("Generate campaign content", async () => {
      await page.waitForTimeout(1000);
      
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Content"), button:has-text("magic")').first();
      
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Wait for content generation (can take a while)
        await page.waitForTimeout(10000);
        
        // Verify content was generated
        const contentArea = page.locator('[data-generated-content], .generated-content, textarea').first();
        await expect(contentArea).toBeVisible({ timeout: 15000 });
      }
    });

    // Step 9: Save or publish campaign
    await test.step("Publish campaign", async () => {
      // Look for save/publish buttons
      const publishButton = page.locator('button:has-text("Publish"), button:has-text("Post"), button:has-text("Schedule")').first();
      const saveButton = page.locator('button:has-text("Save")').first();
      
      if (await publishButton.isVisible()) {
        await publishButton.click();
      } else if (await saveButton.isVisible()) {
        await saveButton.click();
      }
      
      // Wait for success message or redirect
      await page.waitForTimeout(2000);
      
      // Should see success message or be redirected to campaigns page
      const successIndicator = page.locator(
        'text=/success|created|published|saved/i, [role="alert"]:has-text("success")'
      );
      
      await expect(successIndicator.first()).toBeVisible({ timeout: 5000 });
    });

    // Step 10: Verify campaign appears in campaigns list
    await test.step("Verify campaign in list", async () => {
      await page.goto(`${BASE_URL}/campaigns`);
      
      // Look for the campaign name in the list
      const campaignInList = page.locator(`text=${campaignName}`);
      await expect(campaignInList.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test("Error handling: Try to create campaign without required fields", async ({ page }) => {
    await test.step("Login first", async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|portal|campaigns)/, { timeout: 10000 });
    });

    await test.step("Try to submit without campaign name", async () => {
      await page.goto(`${BASE_URL}/campaigns/new`);
      
      // Try to click next without filling name
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        
        // Should show error message
        const errorMessage = page.locator('text=/required|please enter|name is/i, [role="alert"]');
        await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
      }
    });
  });
});

test.describe("Authentication Flow", () => {
  test("Login with existing account", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    
    // Should redirect or show error
    await page.waitForTimeout(2000);
  });

  test("Logout functionality", async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Find and click logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    if (await logoutButton.first().isVisible()) {
      await logoutButton.first().click();
      await expect(page).toHaveURL(/\/(login|$)/);
    }
  });
});
