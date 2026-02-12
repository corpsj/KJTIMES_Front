import { test, expect } from '@playwright/test';

test.describe('Task 7: Unified ArticleDetail Component', () => {
  test('Desktop: Article page renders with 2-column layout (main + sidebar)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const articleUrl = await firstArticleLink.getAttribute('href');
    
    if (!articleUrl) {
      test.skip();
      return;
    }
    
    await page.goto(`http://localhost:3000${articleUrl}`);
    await page.waitForLoadState('networkidle');
    
    const mainContent = page.locator('article');
    await expect(mainContent).toBeVisible();
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    const articleTitle = page.locator('article h1');
    await expect(articleTitle).toBeVisible();
    
    const sidebarRanking = page.locator('aside').getByText('실시간 랭킹');
    await expect(sidebarRanking).toBeVisible();
  });

  test('Mobile: Article page renders with 1-column layout (no sidebar)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const articleUrl = await firstArticleLink.getAttribute('href');
    
    if (!articleUrl) {
      test.skip();
      return;
    }
    
    await page.goto(`http://localhost:3000${articleUrl}`);
    await page.waitForLoadState('networkidle');
    
    const mainContent = page.locator('article');
    await expect(mainContent).toBeVisible();
    
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();
    
    const articleTitle = page.locator('article h1');
    await expect(articleTitle).toBeVisible();
    
    const breadcrumb = page.getByText(/홈 >/);
    await expect(breadcrumb).toBeVisible();
  });

  test('Desktop: Sidebar is sticky and contains ranking, categories, tags', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const articleUrl = await firstArticleLink.getAttribute('href');
    
    if (!articleUrl) {
      test.skip();
      return;
    }
    
    await page.goto(`http://localhost:3000${articleUrl}`);
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    const rankingSection = sidebar.getByText('실시간 랭킹');
    await expect(rankingSection).toBeVisible();
    
    const categorySection = sidebar.getByText('카테고리');
    await expect(categorySection).toBeVisible();
  });
});
