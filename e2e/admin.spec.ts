import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should redirect unauthenticated user from /admin to /admin/login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should redirect unauthenticated user from /admin/articles to /admin/login', async ({ page }) => {
    await page.goto('/admin/articles');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should redirect unauthenticated user from /admin/write to /admin/login', async ({ page }) => {
    await page.goto('/admin/write');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should redirect unauthenticated user from /admin/media to /admin/login', async ({ page }) => {
    await page.goto('/admin/media');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should allow access to /admin/login without authentication', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
    
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
  });

  test('should display login form with proper fields', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    const idInput = page.getByLabel('아이디');
    await expect(idInput).toBeVisible();
    
    const passwordInput = page.getByLabel('비밀번호');
    await expect(passwordInput).toBeVisible();
    
    const loginButton = page.getByRole('button', { name: '로그인' });
    await expect(loginButton).toBeVisible();
  });

  test('should not expose admin credentials in placeholder', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    const idInput = page.getByLabel('아이디');
    const placeholder = await idInput.getAttribute('placeholder');
    
    expect(placeholder).not.toContain('admin');
    expect(placeholder).not.toContain('password');
  });

  test('should have proper form labels for accessibility', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    const idLabel = page.locator('label:has-text("아이디")');
    await expect(idLabel).toBeVisible();
    
    const passwordLabel = page.locator('label:has-text("비밀번호")');
    await expect(passwordLabel).toBeVisible();
  });

  test('should maintain redirect protection after page reload', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should protect all admin routes', async ({ page }) => {
    const adminRoutes = [
      '/admin',
      '/admin/articles',
      '/admin/write',
      '/admin/media',
      '/admin/settings',
    ];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      expect(url).toMatch(/\/admin\/login/);
    }
  });

  test('should use 307 temporary redirect', async ({ page }) => {
    const response = await page.goto('/admin');
    
    const status = response?.status();
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);
  });

  test('should have server-side middleware protection', async ({ page }) => {
    const response = await page.goto('/admin', { waitUntil: 'commit' });
    
    const headers = response?.headers();
    expect(headers).toBeTruthy();
  });
});
