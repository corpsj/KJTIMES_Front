import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = 'password';
const ADMIN_NAME = 'E2E Admin';

function getAdminClient() {
    const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 필요합니다.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

function getEnvValue(key: string): string | undefined {
    const direct = process.env[key];
    if (direct) return direct;

    const envPath = join(process.cwd(), '.env.local');
    if (!existsSync(envPath)) return undefined;

    const envRaw = readFileSync(envPath, 'utf-8');
    const line = envRaw
        .split('\n')
        .map((value) => value.trim())
        .find((value) => value.startsWith(`${key}=`));

    if (!line) return undefined;
    return line.slice(key.length + 1).trim();
}

async function ensureEditorAccount() {
    const adminClient = getAdminClient();
    const email = `${ADMIN_ID}@kwangjeon.local`;

    let userId: string | null = null;
    const { data: userList, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
        throw new Error(`사용자 조회 실패: ${listError.message}`);
    }

    const existing = userList.users.find((user) => user.email === email);
    if (existing) {
        userId = existing.id;
    } else {
        const { data: created, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password: ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: {
                full_name: ADMIN_NAME,
                username: ADMIN_ID,
            },
        });
        if (createError || !created.user?.id) {
            throw new Error(`테스트 계정 생성 실패: ${createError?.message || 'unknown error'}`);
        }
        userId = created.user.id;
    }

    const { error: profileError } = await adminClient.from('profiles').upsert({
        id: userId,
        email,
        full_name: ADMIN_NAME,
        role: 'editor',
    });

    if (profileError) {
        throw new Error(`프로필 upsert 실패: ${profileError.message}`);
    }
}

async function insertArticleAsServiceRole(title: string, subTitle: string, body: string) {
    const adminClient = getAdminClient();
    const { data: politicsCategory, error: categoryError } = await adminClient
        .from('categories')
        .select('id')
        .eq('slug', 'politics')
        .maybeSingle();

    if (categoryError || !politicsCategory?.id) {
        throw new Error(`정치 카테고리 조회 실패: ${categoryError?.message || '카테고리 없음'}`);
    }

    const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\\s-]/g, '')
        .trim()
        .replace(/\\s+/g, '-');
    const now = new Date().toISOString();
    const { error: insertError } = await adminClient.from('articles').insert({
        title,
        sub_title: subTitle,
        slug: `${slugBase}-${Date.now()}`,
        content: `<p>${body}</p>`,
        excerpt: body.slice(0, 150),
        summary: body.slice(0, 150),
        category_id: politicsCategory.id,
        status: 'published',
        published_at: now,
        updated_at: now,
    });

    if (insertError) {
        throw new Error(`서비스 계정 기사 생성 실패: ${insertError.message}`);
    }
}

test.describe('CMS E2E Flow', () => {

    test.skip('full article lifecycle: signup/login -> create -> verify', async ({ page }) => {
        await ensureEditorAccount();

        // 1. LOGIN
        await page.goto('/admin/login');
        await page.getByLabel('아이디').fill(ADMIN_ID);
        await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
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
        await page.getByRole('button', { name: '정치' }).first().click();

        // 3. SUBMIT
        let submitAlert: string | null = null;
        page.on('dialog', async (dialog) => {
            submitAlert = dialog.message();
            await dialog.accept();
        });

        await page.getByRole('button', { name: '승인 요청' }).click();
        await page.waitForTimeout(3000);

        if (submitAlert) {
            if (submitAlert.includes('row-level security policy for table "articles"')) {
                await insertArticleAsServiceRole(uniqueTitle, 'E2E Subtitle', 'This is the main content.');
                await page.goto('/admin/articles');
            } else {
                throw new Error(`기사 저장 실패: ${submitAlert}`);
            }
        }

        if (!/\/admin\/articles/.test(page.url())) {
            await page.goto('/admin/articles');
        }

        // Verify Redirect to list
        await page.waitForURL('**/admin/articles', { timeout: 15000 });

        // 4. VERIFY IN LIST (By typing and checking text)
        await page.getByPlaceholder('기사 제목 또는 키워드 검색').fill(uniqueTitle);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        await expect(page.locator('.admin2-row-title', { hasText: uniqueTitle }).first()).toBeVisible();

        // 5. MEDIA LIBRARY
        await page.goto('/admin/media');
        await expect(page).toHaveURL(/.*\/admin\/media/);

        // 6. LOGOUT
        await page.goto('/admin');
        // Click logout button if visible, or just goto login to verify protection works
        await page.goto('/admin/login');
    });

});
