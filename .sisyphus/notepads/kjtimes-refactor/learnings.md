- 2026-02-12: middleware has two global redirect levers: PREVIEW_MODE gate and 12h kj_special_issue_lock cookie lock.
- 2026-02-12: local env has NEXT_PUBLIC_PREVIEW_MODE unset, so preview logic is inactive by default.
- 2026-02-12: Task 1 (Admin Auth Middleware) completed successfully.
  - Added isUserAuthenticated() helper function using @supabase/ssr createServerClient
  - Middleware now checks auth before device detection (line 64-73)
  - Uses 307 temporary redirect to /admin/login for unauthenticated /admin/* requests
  - /admin/login remains accessible without auth (exception in middleware)
  - All 3 QA scenarios passed:
    1. Unauthenticated /admin → redirects to /admin/login ✓
    2. /admin/login accessible without auth ✓
    3. /admin/articles (other admin routes) → redirects to /admin/login ✓
  - Build passes with no errors
  - Dual protection: server-side middleware + client-side auth check maintained

- 2026-02-12: Task 2 (Security Exposure Removal + Broken Pages Fix) completed successfully.
  - Admin login page: Changed placeholder from "admin" to "아이디를 입력하세요" (generic Korean text)
    - Eliminates security risk of exposing admin username hints
    - Verified via Playwright snapshot
  - Public site login button: Changed href from /admin/login to /login
    - Readers now directed to correct public login page, not admin interface
    - Verified via Playwright snapshot showing /url: /login
  - Footer copyright: Removed duplicate from mobile section, unified to single version
    - "Copyright © 2026 광전타임즈. All rights reserved." appears on all pages
    - Verified on homepage and all info pages
  - Info pages status: All pages (/about, /advertise, /corrections) render correctly
    - HTTP 200 responses confirmed via curl
    - Playwright navigation confirms no errors
    - Each page has proper Content component (AboutContent, AdvertiseContent, CorrectionsContent)
  - Build status: npm run build PASSED (2.9s, Turbopack)
    - All pages compiled successfully
    - /about, /advertise, /corrections marked as static (○)
  - All 3 QA scenarios passed:
    1. Admin login placeholder removal ✓
    2. Public login button path verification ✓
    3. Info pages HTTP 200 status ✓
  - Files modified: 3 (app/admin/login/page.tsx, components/layout/Header.tsx, components/layout/Footer.tsx)
  - Ready for Task 3 (PREVIEW_MODE cleanup) and Tasks 4+ (Foundation phase)
- 2026-02-12: Task 3 completed - PREVIEW_MODE and SPECIAL_ISSUE_LOCK_COOKIE disabled.
- 2026-02-12: Removed PREVIEW_MODE redirect logic (lines 88-105 in middleware.ts) - no longer redirects / to /special-edition.
- 2026-02-12: Disabled SPECIAL_ISSUE_LOCK_COOKIE 12-hour lock mechanism (lines 107-134 in middleware.ts) - commented out to prevent forced redirects.
- 2026-02-12: Converted search page from server component to client component with Suspense boundary for useSearchParams() hook.
- 2026-02-12: Search page now includes persistent search input - query param from URL populates the search box.
- 2026-02-12: Search query filter verified: .in("status", ["published", "shared"]) includes both published and shared articles.
- 2026-02-12: QA Scenario 1 PASSED: Main page (/) loads without redirect to /special-edition.
- 2026-02-12: QA Scenario 2 PASSED: Search query "TEST" persists in search box after submit, URL shows ?q=TEST, results display correctly.
- 2026-02-12: npm run build passed successfully - no TypeScript or build errors.
- 2026-02-12: Task 4 (Data Access Layer) completed successfully.
  - Created lib/api/ with server/client split:
    - lib/api/articles.ts: Server-only (fetchArticles, fetchArticleById, fetchCategoryArticles, fetchRelatedArticles, fetchArticleTags, fetchSeriesArticlesByTag, incrementArticleViews, uniqueArticlesById)
    - lib/api/articles.client.ts: Browser-only (searchArticlesClient, fetchArticleStats, fetchAdminArticles)
    - lib/api/categories.ts: Server-only (fetchCategories, fetchCategoryBySlug)
    - lib/api/authors.ts: Server-only (fetchAuthorProfile, fetchAuthorArticles)
  - CRITICAL LEARNING: Cannot mix server/client Supabase imports in same file. Next.js 16 Turbopack traces import chains and fails if server-only modules (next/headers) are reachable from client components. Split into .ts (server) and .client.ts (browser) files.
  - ApiResult<T> pattern: { data: T | null; error: Error | null } applied to all new functions.
  - Supabase PromiseLike does NOT support .catch() — must use async/await with try/catch instead of .then().catch() chains.
  - utils/articles.ts converted to deprecated shim re-exporting from lib/api/articles.ts (6 category pages still import from it).
  - Migrated pages: homepage, article detail, special-edition. All render identically.
  - hooks/useArticles.ts: Extracted fetchArticleStats and fetchAdminArticles to lib/api/articles.client.ts. Mutations (status update, delete, clone, bulk) kept in hook due to tight UI state coupling.
  - app/(main)/category/[slug] does not exist — categories use dedicated routes (politics/, economy/, etc.) importing from utils/articles.ts.
  - Build passes, lint clean (no new warnings/errors).
