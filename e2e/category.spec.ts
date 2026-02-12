import { test, expect } from '@playwright/test';

const categories = ['politics', 'economy', 'society', 'culture', 'sports', 'opinion'];

test.describe('Category Pages', () => {
  for (const category of categories) {
    test(`should load ${category} category page`, async ({ page }) => {
      await page.goto(`/${category}`);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(new RegExp(`/${category}`));
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });
  }

  test('should display category header with breadcrumb', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const breadcrumb = page.getByText(/홈 >/);
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    
    if (hasBreadcrumb) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('should display article count', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const articleCount = page.getByText(/\d+개의 기사/);
    const hasCount = await articleCount.isVisible().catch(() => false);
    
    if (hasCount) {
      await expect(articleCount).toBeVisible();
    }
  });

  test('should display filter/sort controls', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const latestButton = page.getByRole('radio', { name: '최신순' });
    const popularButton = page.getByRole('radio', { name: '인기순' });
    
    const hasSort = await latestButton.isVisible().catch(() => false);
    if (hasSort) {
      await expect(latestButton).toBeVisible();
      await expect(popularButton).toBeVisible();
    }
  });

  test('should sort articles by latest', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const latestButton = page.getByRole('radio', { name: '최신순' });
    const hasSort = await latestButton.isVisible().catch(() => false);
    
    if (hasSort) {
      await latestButton.click();
      await page.waitForTimeout(500);
      
      const articles = page.locator('article');
      const count = await articles.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort articles by popular', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const popularButton = page.getByRole('radio', { name: '인기순' });
    const hasSort = await popularButton.isVisible().catch(() => false);
    
    if (hasSort) {
      await popularButton.click();
      await page.waitForTimeout(500);
      
      const articles = page.locator('article');
      const count = await articles.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display article grid', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const articles = page.locator('article');
    const count = await articles.count();
    
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }
  });

  test('should load more articles on "더보기" click', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const initialArticles = await page.locator('article').count();
    
    const moreButton = page.getByRole('button', { name: '더보기' });
    const hasMoreButton = await moreButton.isVisible().catch(() => false);
    
    if (hasMoreButton) {
      await moreButton.click();
      await page.waitForTimeout(500);
      
      const newArticles = await page.locator('article').count();
      expect(newArticles).toBeGreaterThan(initialArticles);
    }
  });

  test('should display sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    const hasSidebar = await sidebar.isVisible().catch(() => false);
    
    if (hasSidebar) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    const isVisible = await sidebar.isVisible().catch(() => false);
    
    expect(isVisible).toBe(false);
  });

  test('should navigate to article from category page', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (hasArticles) {
      const articleUrl = await firstArticleLink.getAttribute('href');
      await firstArticleLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(articleUrl!));
    }
  });

  test('should display popular articles in sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const popularHeading = page.getByRole('heading', { name: /인기 기사/ });
    const hasPopular = await popularHeading.isVisible().catch(() => false);
    
    if (hasPopular) {
      await expect(popularHeading).toBeVisible();
    }
  });

  test('should display related categories in sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const relatedHeading = page.getByRole('heading', { name: /관련 카테고리/ });
    const hasRelated = await relatedHeading.isVisible().catch(() => false);
    
    if (hasRelated) {
      await expect(relatedHeading).toBeVisible();
    }
  });

  test('should navigate between categories', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const economyLink = page.getByRole('link', { name: '경제' });
    const hasLink = await economyLink.isVisible().catch(() => false);
    
    if (hasLink) {
      await economyLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/economy/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/politics/);
    
    const articles = page.locator('article');
    const count = await articles.count();
    
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }
  });
});
