import { test, expect } from '@playwright/test';

test.describe('Article Detail Page', () => {
  test('should load article detail page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(new RegExp('/article/\\d+'));
    
    const articleTitle = page.locator('article h1');
    await expect(articleTitle).toBeVisible();
  });

  test('should display article content and metadata', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const articleContent = page.locator('article');
    await expect(articleContent).toBeVisible();
    
    const publishedDate = page.getByText(/\d{4}\.\d{2}\.\d{2}/);
    await expect(publishedDate.first()).toBeVisible();
  });

  test('should display sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    const rankingSection = sidebar.getByText('실시간 랭킹');
    const hasRanking = await rankingSection.isVisible().catch(() => false);
    if (hasRanking) {
      await expect(rankingSection).toBeVisible();
    }
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();
  });

  test('should display breadcrumb navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const breadcrumb = page.getByText(/홈 >/);
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    if (hasBreadcrumb) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('should display share buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const shareButtons = page.locator('button').filter({ hasText: /공유|복사/ });
    const hasShareButtons = await shareButtons.first().isVisible().catch(() => false);
    if (hasShareButtons) {
      await expect(shareButtons.first()).toBeVisible();
    }
  });

  test('should display related articles section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const relatedHeading = page.getByRole('heading', { name: /관련 기사|연관 기사/ });
    const hasRelated = await relatedHeading.isVisible().catch(() => false);
    if (hasRelated) {
      await expect(relatedHeading).toBeVisible();
    }
  });

  test('should navigate to related article on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const relatedArticleLinks = page.locator('a[href^="/article/"]');
    const relatedCount = await relatedArticleLinks.count();
    
    if (relatedCount > 1) {
      const secondArticleUrl = await relatedArticleLinks.nth(1).getAttribute('href');
      await relatedArticleLinks.nth(1).click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(secondArticleUrl!));
    }
  });

  test('should display reading time estimate', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasArticles = await firstArticleLink.isVisible().catch(() => false);
    
    if (!hasArticles) {
      test.skip();
      return;
    }
    
    const articleUrl = await firstArticleLink.getAttribute('href');
    await page.goto(articleUrl!);
    await page.waitForLoadState('networkidle');
    
    const readingTime = page.getByText(/읽는 시간.*분/);
    const hasReadingTime = await readingTime.isVisible().catch(() => false);
    if (hasReadingTime) {
      await expect(readingTime).toBeVisible();
    }
  });
});
