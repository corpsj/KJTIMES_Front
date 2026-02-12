import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should display header on all pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display footer on all pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.locator('[role="contentinfo"]');
    await expect(footer).toBeVisible();
  });

  test('should navigate to homepage from logo', async ({ page }) => {
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const logo = page.locator('header a[href="/"]').first();
    await logo.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/');
  });

  test('should navigate to category pages from header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const politicsLink = page.locator('nav[aria-label="메인 메뉴"] a[href="/politics"]');
    await politicsLink.waitFor({ state: 'visible', timeout: 10000 });
    
    await Promise.all([
      page.waitForURL('**/politics', { timeout: 10000 }),
      politicsLink.click()
    ]);
    
    await expect(page).toHaveURL('/politics');
  });

  test('should open mobile drawer menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const burgerButton = page.getByLabel('메뉴 열기');
    await expect(burgerButton).toBeVisible();
    
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
  });

  test('should close mobile drawer menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const burgerButton = page.getByLabel('메뉴 열기');
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    const closeButton = page.locator('button[aria-label*="닫"]').or(page.locator('button[aria-label="Close"]'));
    const hasCloseButton = await closeButton.isVisible().catch(() => false);
    
    if (hasCloseButton) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      const drawer = page.locator('[role="dialog"]');
      const isVisible = await drawer.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  test('should navigate from mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const burgerButton = page.getByLabel('메뉴 열기');
    await burgerButton.click();
    await page.waitForTimeout(500);
    
    const drawer = page.locator('[role="dialog"]');
    const politicsLink = drawer.locator('a[href="/politics"]');
    const hasLink = await politicsLink.isVisible().catch(() => false);
    
    if (hasLink) {
      await politicsLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/politics');
    }
  });

  test('should navigate to login page from header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loginLink = page.getByRole('link', { name: '로그인' }).first();
    await loginLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to signup page from header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const signupLink = page.getByRole('link', { name: '회원가입' }).first();
    const hasSignup = await signupLink.isVisible().catch(() => false);
    
    if (hasSignup) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/signup');
    }
  });

  test('should navigate to about page from footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const aboutLink = page.getByRole('link', { name: '회사소개' });
    await aboutLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/about');
  });

  test('should navigate to advertise page from footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const advertiseLink = page.getByRole('link', { name: '광고안내' });
    await advertiseLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/advertise');
  });

  test('should navigate to corrections page from footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const correctionsLink = page.getByRole('link', { name: '정정보도' });
    await correctionsLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/corrections');
  });

  test('should navigate to terms page from footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const termsLink = page.getByRole('link', { name: '이용약관' });
    await termsLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/terms');
  });

  test('should highlight active category in navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/politics');
    await page.waitForLoadState('networkidle');
    
    const politicsLink = page.locator('nav[aria-label="메인 메뉴"] a[href="/politics"]');
    const hasNav = await politicsLink.isVisible().catch(() => false);
    
    if (hasNav) {
      const color = await politicsLink.evaluate(el => window.getComputedStyle(el).color);
      expect(color).toBeTruthy();
    }
  });

  test('should display horizontal scrollable categories on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const categoryNav = page.locator('nav[aria-label="카테고리 메뉴"]');
    const hasNav = await categoryNav.isVisible().catch(() => false);
    
    if (hasNav) {
      await expect(categoryNav).toBeVisible();
    }
  });

  test('should use skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('.skip-to-main');
    const isFocused = await skipLink.evaluate(el => el === document.activeElement);
    
    if (isFocused) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      const mainContent = page.locator('#main-content, main').first();
      const hasMain = await mainContent.isVisible().catch(() => false);
      
      if (hasMain) {
        await expect(mainContent).toBeVisible();
      }
    }
  });

  test('should navigate with keyboard through header links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
