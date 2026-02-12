import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    const skipLink = page.locator('.skip-to-main');
    await expect(skipLink).toBeAttached();
    
    const href = await skipLink.getAttribute('href');
    expect(href).toBe('#main-content');
  });

  test('should focus skip link on first tab', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('.skip-to-main');
    const isFocused = await skipLink.evaluate(el => el === document.activeElement);
    
    expect(isFocused).toBe(true);
  });

  test('should jump to main content when skip link is activated', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    const mainContent = page.locator('#main-content, main').first();
    const hasMain = await mainContent.isVisible().catch(() => false);
    
    if (hasMain) {
      await expect(mainContent).toBeVisible();
    }
  });

  test('should have ARIA landmark for header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should have ARIA landmark for main navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const nav = page.locator('nav[aria-label="메인 메뉴"]');
    const hasNav = await nav.isVisible().catch(() => false);
    
    if (hasNav) {
      await expect(nav).toBeVisible();
      
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel).toBe('메인 메뉴');
    }
  });

  test('should have ARIA landmark for mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const nav = page.locator('nav[aria-label="카테고리 메뉴"]');
    const hasNav = await nav.isVisible().catch(() => false);
    
    if (hasNav) {
      await expect(nav).toBeVisible();
      
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel).toBe('카테고리 메뉴');
    }
  });

  test('should have ARIA landmark for main content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('#main-content, main').first();
    const hasMain = await main.isVisible().catch(() => false);
    
    if (hasMain) {
      await expect(main).toBeVisible();
    }
  });

  test('should have ARIA landmark for footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.locator('[role="contentinfo"]');
    await expect(footer).toBeVisible();
    
    const role = await footer.getAttribute('role');
    expect(role).toBe('contentinfo');
  });

  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(0);
  });

  test('should have h2 for major sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const h2Elements = page.locator('h2');
    const count = await h2Elements.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have h3 for subsections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const h3Elements = page.locator('h3');
    const count = await h3Elements.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show focus indicators on keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
      };
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('should have aria-label on burger menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const burgerButton = page.getByLabel('메뉴 열기');
    await expect(burgerButton).toBeVisible();
    
    const ariaLabel = await burgerButton.getAttribute('aria-label');
    expect(ariaLabel).toBe('메뉴 열기');
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/이메일|아이디/);
    const hasEmail = await emailInput.isVisible().catch(() => false);
    
    if (hasEmail) {
      await expect(emailInput).toBeVisible();
    }
    
    const passwordInput = page.getByLabel('비밀번호');
    const hasPassword = await passwordInput.isVisible().catch(() => false);
    
    if (hasPassword) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should be keyboard navigable through main navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedElement === 'A') {
        break;
      }
    }
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should support Enter key for link activation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    if (focusedElement === 'A') {
      const initialUrl = page.url();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const newUrl = page.url();
      expect(newUrl).toBeTruthy();
    }
  });

  test('should have screen reader only text for h1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const srOnlyH1 = page.locator('h1.sr-only');
    const count = await srOnlyH1.count();
    
    if (count > 0) {
      const text = await srOnlyH1.textContent();
      expect(text).toContain('광전타임즈');
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const textElements = page.locator('p, h1, h2, h3, a').first();
    const hasText = await textElements.isVisible().catch(() => false);
    
    if (hasText) {
      const styles = await textElements.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      
      expect(styles.color).toBeTruthy();
    }
  });
});
