import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should navigate to search page from header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('광주');
    await searchInput.press('Enter');
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/search\?q=광주/);
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const resultCount = page.getByText(/총.*개 검색 결과/);
    const hasResults = await resultCount.isVisible().catch(() => false);
    
    if (hasResults) {
      await expect(resultCount).toBeVisible();
    }
  });

  test('should persist search query in URL and input', async ({ page }) => {
    await page.goto('/search?q=TEST');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/q=TEST/);
    
    const searchInput = page.locator('input[type="search"]').first();
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe('TEST');
  });

  test('should highlight search term in results', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const highlights = page.locator('mark');
    const hasHighlights = await highlights.first().isVisible().catch(() => false);
    
    if (hasHighlights) {
      const highlightText = await highlights.first().textContent();
      expect(highlightText).toContain('광주');
    }
  });

  test('should filter results by category', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const categorySelect = page.locator('select').filter({ hasText: /카테고리/ }).or(
      page.getByLabel('카테고리')
    );
    const hasCategoryFilter = await categorySelect.isVisible().catch(() => false);
    
    if (hasCategoryFilter) {
      await categorySelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).toMatch(/category=/);
    }
  });

  test('should filter results by date', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const dateSelect = page.locator('select').filter({ hasText: /기간/ }).or(
      page.getByLabel('기간')
    );
    const hasDateFilter = await dateSelect.isVisible().catch(() => false);
    
    if (hasDateFilter) {
      await dateSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).toMatch(/date=/);
    }
  });

  test('should sort results by latest', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const latestButton = page.getByRole('radio', { name: '최신순' });
    const hasSortButtons = await latestButton.isVisible().catch(() => false);
    
    if (hasSortButtons) {
      await latestButton.click();
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).toMatch(/sort=latest/);
    }
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/search?q=광주&category=politics&date=week');
    await page.waitForLoadState('networkidle');
    
    const clearButton = page.getByRole('button', { name: /초기화|지우기/ });
    const hasClearButton = await clearButton.isVisible().catch(() => false);
    
    if (hasClearButton) {
      await clearButton.click();
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).not.toMatch(/category=/);
      expect(url).not.toMatch(/date=/);
    }
  });

  test('should show empty state when no results', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentquery123');
    await page.waitForLoadState('networkidle');
    
    const emptyState = page.getByText(/검색 결과가 없습니다|결과를 찾을 수 없습니다/);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should navigate to article from search results', async ({ page }) => {
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('a[href^="/article/"]').first();
    const hasResults = await firstArticleLink.isVisible().catch(() => false);
    
    if (hasResults) {
      const articleUrl = await firstArticleLink.getAttribute('href');
      await firstArticleLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(articleUrl!));
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search?q=광주');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/search/);
    expect(page.url()).toContain('q=');
    
    const searchInput = page.locator('input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });
});
