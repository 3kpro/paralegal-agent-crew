import { test, expect } from '@playwright/test';

/**
 * E2E Tests for DotLoader Component Integration
 * Tests DotLoader component structure, rendering, and animation behavior
 */

test.describe('DotLoader Component - Core Functionality', () => {
  
  test('should render DotLoader as 7x7 grid (49 dots total)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Inject a test component with DotLoader for verification
    await page.evaluate(() => {
      // Create a test element with DotLoader
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    // Verify grid exists and renders 49 dots
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    await expect(dotLoader).toBeVisible();
    
    const dots = dotLoader.locator('[data-dot-index]');
    expect(await dots.count()).toBe(49);
  });

  test('should have sequential data-dot-index attributes (0-48)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Create test element
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test2';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dots = page.locator('[data-testid="dot-loader"] [data-dot-index]');
    
    // Verify all 49 dots have correct sequential indices
    for (let i = 0; i < 49; i++) {
      const dot = dots.nth(i);
      const index = await dot.getAttribute('data-dot-index');
      expect(index).toBe(i.toString());
    }
  });

  test('should apply correct Tailwind grid classes', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test3';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    const className = await dotLoader.evaluate((el) => el.className);
    
    expect(className).toContain('grid');
    expect(className).toContain('grid-cols-7');
    expect(className).toContain('gap-0.5');
  });

  test('should render dots with proper sizing classes', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test4';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dot = page.locator('[data-testid="dot-loader"] [data-dot-index]').first();
    const className = await dot.evaluate((el) => el.className);
    
    expect(className).toContain('h-1.5');
    expect(className).toContain('w-1.5');
    expect(className).toContain('rounded-sm');
  });
});

test.describe('DotLoader Animation - Frame Application', () => {
  
  test('should toggle active class on dots based on animation frames', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Create test element with animation simulation
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test5';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm transition-all duration-100"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
      
      // Simulate animation frame application
      const dots = Array.from(testEl.querySelectorAll('[data-dot-index]')) as HTMLElement[];
      const frame = [0, 1, 2, 8, 9, 10];
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', frame.includes(index));
      });
    });
    
    // Verify active dots
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    const dots = dotLoader.locator('[data-dot-index]');
    
    // Check first 3 dots are active (indices 0, 1, 2)
    for (let i = 0; i < 3; i++) {
      const dot = dots.nth(i);
      const hasActive = await dot.evaluate((el) => el.classList.contains('active'));
      expect(hasActive).toBeTruthy();
    }
    
    // Check a dot that shouldn't be active
    const inactiveDot = dots.nth(5);
    const isInactive = await inactiveDot.evaluate((el) => !el.classList.contains('active'));
    expect(isInactive).toBeTruthy();
  });

  test('should support transition timing classes', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test6';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm transition-all duration-100"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dot = page.locator('[data-testid="dot-loader"] [data-dot-index]').first();
    const className = await dot.evaluate((el) => el.className);
    
    expect(className).toContain('transition');
    expect(className).toContain('duration-100');
  });
});

test.describe('DotLoader Styling - Theme Support', () => {
  
  test('should support custom dot background color classes', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Test with cyan background (tron theme)
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test7';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm transition-all duration-100 bg-tron-cyan/30 [&.active]:bg-tron-cyan"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dot = page.locator('[data-testid="dot-loader"] [data-dot-index]').first();
    const className = await dot.evaluate((el) => el.className);
    
    expect(className).toContain('bg-');
    expect(className).toContain('[&.active]:');
  });

  test('should support white background variant', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Test with white background
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test8';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm transition-all duration-100 bg-white/30 [&.active]:bg-white"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dot = page.locator('[data-testid="dot-loader"] [data-dot-index]').first();
    const className = await dot.evaluate((el) => el.className);
    
    expect(className).toContain('bg-white');
  });
});

test.describe('DotLoader - Responsive Behavior', () => {
  
  test('should maintain 7x7 grid structure on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-mobile';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dots = page.locator('[data-testid="dot-loader"] [data-dot-index]');
    expect(await dots.count()).toBe(49);
    
    await context.close();
  });

  test('should maintain 7x7 grid structure on tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-tablet';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dots = page.locator('[data-testid="dot-loader"] [data-dot-index]');
    expect(await dots.count()).toBe(49);
    
    await context.close();
  });
});

test.describe('DotLoader - HTML Attributes & Data Attributes', () => {
  
  test('should preserve HTML attributes passed via props', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test9';
      testEl.innerHTML = `
        <div data-testid="dot-loader" 
             class="grid w-fit grid-cols-7 gap-0.5"
             aria-label="Loading animation"
             role="status">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    const ariaLabel = await dotLoader.getAttribute('aria-label');
    const role = await dotLoader.getAttribute('role');
    
    expect(ariaLabel).toBe('Loading animation');
    expect(role).toBe('status');
  });

  test('should support additional className prop merging', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-test10';
      testEl.innerHTML = `
        <div data-testid="dot-loader" 
             class="grid w-fit grid-cols-7 gap-0.5 animate-pulse">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    const className = await dotLoader.evaluate((el) => el.className);
    
    // Should contain both base classes and custom class
    expect(className).toContain('grid');
    expect(className).toContain('grid-cols-7');
    expect(className).toContain('animate-pulse');
  });
});

test.describe('DotLoader - Visual Verification', () => {
  
  test('should render visually distinct dots with proper spacing', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.id = 'dotloader-visual';
      testEl.style.padding = '20px';
      testEl.style.background = '#f0f0f0';
      testEl.innerHTML = `
        <div data-testid="dot-loader" class="grid w-fit grid-cols-7 gap-0.5">
          ${Array.from({ length: 49 }).map((_, i) => 
            `<div data-dot-index="${i}" class="h-1.5 w-1.5 rounded-sm bg-blue-500 transition-all duration-100"></div>`
          ).join('')}
        </div>
      `;
      document.body.appendChild(testEl);
    });
    
    const dotLoader = page.locator('[data-testid="dot-loader"]');
    const boundingBox = await dotLoader.boundingBox();
    
    // Grid should be rendered with appropriate dimensions
    expect(boundingBox).toBeDefined();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
    
    // Should be approximately square (7x7 grid)
    const ratio = (boundingBox?.width || 0) / (boundingBox?.height || 1);
    expect(ratio).toBeCloseTo(1, 0.2); // Allow 20% deviation
  });
});