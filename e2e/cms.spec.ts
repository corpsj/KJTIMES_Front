import { test, expect } from '@playwright/test';

test.describe('CMS E2E Flow', () => {

    test('full article lifecycle: signup/login -> create -> verify', async ({ page }) => {
        // 0. Ensure User Exists (Idempotent Signup)
        await page.goto('/signup');
        await page.getByPlaceholder('홍길동').fill('E2E Admin');
        await page.getByPlaceholder('userid123').fill('admin');
        await page.getByPlaceholder('********').fill('password');

        // Handle success alert if it appears
        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await page.getByRole('button', { name: '가입하기' }).click();

        // Wait briefly for server response
        await page.waitForTimeout(2000);

        // 1. LOGIN
        await page.goto('/admin/login');
        await page.getByLabel('아이디').fill('admin');
        await page.getByLabel('비밀번호').fill('password');
        await page.getByRole('button', { name: '로그인' }).click();

        // Verify Dashboard access
        await page.waitForURL('**/admin', { timeout: 15000 });
        await expect(page).toHaveURL(/.*\/admin/);

        // 2. CREATE ARTICLE
        await page.goto('/admin/write');
        await expect(page).toHaveURL(/.*\/admin\/write/);

        // Fill Article Content
        const timestamp = Date.now();
        const uniqueTitle = `E2E Test Article ${timestamp}`;
        await page.getByPlaceholder('기사 제목을 입력하세요').fill(uniqueTitle);
        await page.getByPlaceholder('부제 (선택사항)').fill('E2E Subtitle');

        // Content (TipTap)
        await page.locator('.ProseMirror').fill('This is the main content.');

        // Sidebar: Category
        await page.locator('input[placeholder="카테고리 선택"]').click();
        await page.waitForTimeout(1000);
        await page.locator('.mantine-Select-option').first().click();

        // 3. SUBMIT
        await page.getByRole('button', { name: '승인 요청' }).click();

        // Verify Redirect to list
        await page.waitForURL('**/admin/articles', { timeout: 15000 });

        // 4. VERIFY IN LIST (By typing and checking text)
        await page.getByPlaceholder('기사 제목 검색...').fill(uniqueTitle);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // Use a loose check for the content
        const bodyContent = await page.content();
        expect(bodyContent).toContain(uniqueTitle);

        // 5. MEDIA LIBRARY
        await page.goto('/admin/media');
        await expect(page).toHaveURL(/.*\/admin\/media/);

        // 6. LOGOUT
        await page.goto('/admin');
        // Click logout button if visible, or just goto login to verify protection works
        await page.goto('/admin/login');
    });

});
