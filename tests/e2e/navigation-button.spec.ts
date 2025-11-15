import { test, expect } from '@playwright/test';

test('Navigation displays single Sign In / Sign Up button linking to login', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Check desktop navigation
  const desktopButton = page.locator('nav a[href="/login"] button').first();
  await expect(desktopButton).toHaveText('Sign In / Sign Up');
  await expect(desktopButton).toBeVisible();

  // Verify no separate Sign Up button
  const signUpButton = page.locator('nav button:has-text("Sign Up")');
  await expect(signUpButton).toHaveCount(0);

  // Test click navigates to login
  await desktopButton.click();
  await expect(page).toHaveURL(/\/login/);

  // Go back and check mobile menu
  await page.goto('http://localhost:3001');
  await page.setViewportSize({ width: 375, height: 667 }); // Mobile size

  // Open mobile menu
  const menuButton = page.locator('nav button[aria-label="Toggle menu"]');
  await menuButton.click();

  // Check mobile button
  const mobileButton = page.locator('nav a[href="/login"] button').last(); // Assuming last is mobile
  await expect(mobileButton).toHaveText('Sign In / Sign Up');
  await expect(mobileButton).toBeVisible();

  // Verify no separate buttons in mobile menu
  const mobileSignUp = page.locator('nav div button:has-text("Sign Up")');
  await expect(mobileSignUp).toHaveCount(0);
});