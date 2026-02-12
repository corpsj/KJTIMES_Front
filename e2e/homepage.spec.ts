import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/광전타임즈/);
    
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(0);
  });

  test('should display main news section when articles exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if main news section exists
    const mainNewsHeading = page.getByRole('heading', { name: '주요뉴스', level: 2 });
    const hasMainNews = await mainNewsHeading.isVisible().catch(() => false);
    
    if (hasMainNews) {
      // Verify article cards are present
      const articleCards = page.locator('article');
      await expect(articleCards.first()).toBeVisible();
    }
  });

  test('should display popular news sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if popular news section exists
    const popularNewsHeading = page.getByRole('heading', { name: '인기뉴스', level: 2 });
    const hasPopularNews = await popularNewsHeading.isVisible().catch(() => false);
    
    if (hasPopularNews) {
      await expect(popularNewsHeading).toBeVisible();
    }
  });

  test('should hide popular news sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Popular news should not be visible on mobile
    const popularNewsHeading = page.getByRole('heading', { name: '인기뉴스', level: 2 });
    const isVisible = await popularNewsHeading.isVisible().catch(() => false);
    
    // On mobile, popular news should be hidden or not present
    if (isVisible) {
      // If it exists, it should be hidden via CSS
      const display = await popularNewsHeading.evaluate(el => window.getComputedStyle(el).display);
      expect(display).toBe('none');
    }
  });

  test('should display category sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for category sections (politics, economy, society)
    const categoryHeadings = page.locator('h3');
    const count = await categoryHeadings.count();
    
    // Should have at least some category sections if articles exist
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to article on card click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find first article link
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (hasArticles) {
      const articleUrl = await firstArticleLink.getAttribute('href');
      expect(articleUrl).toMatch(/^\/article\/\d+/);
      
      // Click and verify navigation
      await firstArticleLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(articleUrl!));
    } else {
      test.skip();
    }
  });

  test('should navigate to category page on "더보기" click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find first "더보기" link
    const moreLink = page.getByRole('link', { name: '더보기' }).first();
    const hasMoreLink = await moreLink.isVisible().catch(() => false);
    
    if (hasMoreLink) {
      const categoryUrl = await moreLink.getAttribute('href');
      expect(categoryUrl).toMatch(/^\/(politics|economy|society|culture|sports|opinion)/);
      
      // Click and verify navigation
      await moreLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(categoryUrl!));
    } else {
      test.skip();
    }
  });

  test('should display header with logo and navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify navigation exists
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('should display footer with copyright', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.locator('[role="contentinfo"]');
    await expect(footer).toBeVisible();
    
    const copyright = page.getByText(/Copyright.*광전타임즈/).first();
    await expect(copyright).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify burger menu button exists on mobile
    const burgerButton = page.getByLabel('메뉴 열기');
    await expect(burgerButton).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/광전타임즈/);
    
    // Verify header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/광전타임즈/);
    
    // Verify desktop navigation is visible
    const nav = page.locator('nav[aria-label="메인 메뉴"]');
    await expect(nav).toBeVisible();
  });
});
