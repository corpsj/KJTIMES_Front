# KJTIMES (광전타임즈) V2 Codebase Review Report

**Date:** 2026-02-16  
**Scope:** Full codebase audit after v2 refactoring  
**Production URL:** https://kjtimes.co.kr  
**Stack:** Next.js 16, React 19, TypeScript 5, Mantine 8.3, TipTap, Supabase  

---

## Executive Summary

The KJTIMES v2 refactoring is **largely successful** — the codebase is well-organized, type-safe, and follows modern Next.js patterns. The public site, CMS admin, and API layer are all functional. However, this audit identified **47 issues** across security, performance, code quality, and missing features that should be addressed before or shortly after production launch.

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 7 | Must fix before production |
| High | 12 | Fix within 1-2 weeks |
| Medium | 16 | Fix within 1 month |
| Low | 12 | Nice-to-have / tech debt |

---

## Feature Status Overview

### Public Site

| Feature | Status | Notes |
|---------|--------|-------|
| Homepage | ✅ Working | Server component, ISR 60s, article sections, popular news sidebar |
| Category pages (7) | ✅ Working | politics, economy, society, culture, sports, opinion, special-edition |
| Article detail | ✅ Working | Full metadata, JSON-LD, related/series/author articles, view counting |
| Search | ✅ Working | Client-side with filters (category, date), sort (relevance, latest) |
| Share pages | ✅ Working | Special edition articles with custom layout, noindex |
| About page | ✅ Working | Company info with static content |
| Advertise page | ✅ Working | Ad info with contact form layout |
| Corrections page | ✅ Working | Correction request form |
| Terms page | ✅ Working | Terms of service |
| Privacy page | ✅ Working | Comprehensive privacy policy |
| Editorial page | ✅ Working | Editorial policy |
| Subscribe page | ⚠️ Partial | UI exists but API integration is TODO (no backend) |
| Reader login/signup | ⚠️ Placeholder | Forms exist, validation works, but auth uses `alert()` instead of real backend |
| 404 page | ✅ Working | Custom not-found with navigation links |
| Error boundary | ✅ Working | Global error.tsx with reset button |

### CMS Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Admin auth/login | ✅ Working | Supabase auth with `@kwangjeon.local` email pattern |
| Dashboard | ✅ Working | Stats cards, recent articles, quick actions |
| Article create | ✅ Working | Rich text editor, metadata, thumbnail, SEO panel |
| Article edit | ✅ Working | Load existing article, update all fields |
| Article publish | ✅ Working | Draft → pending_review → published/shared flow |
| Article delete | ✅ Working | Single and batch delete |
| Article clone | ✅ Working | Creates draft copy with new slug |
| Article list/filter | ✅ Working | Search, status filter, sort, pagination |
| Batch operations | ✅ Working | Bulk status change, bulk delete |
| Auto-save | ✅ Working | 30-second interval, draft save with Ctrl+S |
| Media library | ✅ Working | Upload, browse, search, delete, copy URL |
| Media upload | ✅ Working | Drag-drop, multi-file, progress tracking |
| News feed | ✅ Working | News Factory integration (explore, subscriptions, deliveries) |
| Mail inbox | ✅ Working | IMAP inbox listing with pagination |
| Mail compose | ✅ Working | Send email via SMTP |
| Mail detail | ✅ Working | View with attachments |
| Mail delete | ❌ Broken | Button exists but no implementation |

### Editor (TipTap)

| Feature | Status | Notes |
|---------|--------|-------|
| Rich text formatting | ✅ Working | Bold, italic, strike, headings (H2-H4), lists, blockquote |
| Text alignment | ✅ Working | Left, center, right, justify |
| Links | ✅ Working | Insert/edit links |
| Image upload | ✅ Working | Drag-drop, paste, file picker → Supabase storage |
| Figure/caption | ✅ Working | Custom FigureImage extension with editable captions |
| Undo/redo | ✅ Working | Standard TipTap history |
| Preview | ✅ Working | Modal preview with sanitized HTML |
| SEO panel | ✅ Working | Title, description, keywords with auto-fill |
| Thumbnail picker | ✅ Working | Pick from content images or upload new |

### API Routes

| Route | Status | Notes |
|-------|--------|-------|
| POST /api/news/receive | ✅ Working | Webhook with secret auth, HTML sanitization |
| /api/nf/[...path] | ✅ Working | News Factory proxy (GET/POST/PATCH/DELETE) |
| GET /api/mail | ✅ Working | Auth-protected IMAP inbox |
| POST /api/mail/send | ✅ Working | Auth-protected SMTP send |
| GET /api/mail/[uid] | ✅ Working | Auth-protected message detail |

### SEO & Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Dynamic metadata | ✅ Working | Per-page metadata with OpenGraph, Twitter cards |
| JSON-LD schema | ✅ Working | NewsArticle structured data on article pages |
| Sitemap | ✅ Working | Dynamic with up to 1000 articles + static pages |
| News sitemap | ✅ Working | Google News format, last 2 days, 5-min cache |
| Robots.txt | ✅ Working | Disallows /admin, /signup, /api |
| Canonical URLs | ✅ Working | On article detail pages |
| ISR (caching) | ✅ Working | 60-second revalidation on homepage and categories |
| Middleware auth | ✅ Working | Admin route protection |
| Device detection | ✅ Working | UA parsing for mobile/desktop header |

### Testing

| Feature | Status | Notes |
|---------|--------|-------|
| E2E tests (Playwright) | ⚠️ Partial | 100+ tests across 8 files, but quality issues |
| Unit tests | ❌ Missing | No unit test framework or tests |
| CMS lifecycle test | ❌ Skipped | `test.skip()` in cms.spec.ts |

---

## Issues Found

### Critical (7)

#### C1. Image remote patterns allow ALL domains
- **File:** `next.config.ts:5-13`
- **Issue:** `hostname: '**'` allows Next.js image optimization from any domain. An attacker could abuse the image proxy for SSRF or resource exhaustion.
- **Fix:** Whitelist only Supabase storage domain and known CDNs:
  ```ts
  { protocol: 'https', hostname: '*.supabase.co' }
  ```

#### C2. No rate limiting on any API endpoint
- **Files:** All routes in `app/api/`
- **Issue:** No rate limiting on webhook (`/api/news/receive`), mail send (`/api/mail/send`), or proxy (`/api/nf/`). Mail send is especially dangerous — any authenticated user can send unlimited emails.
- **Fix:** Add rate limiting middleware (e.g., Vercel KV, upstash/ratelimit).

#### C3. Article CRUD bypasses API routes — direct Supabase from frontend
- **Files:** `hooks/useArticleForm.ts`, `hooks/useArticles.ts`
- **Issue:** Articles are created, updated, and deleted via direct Supabase client calls from the browser. This means:
  - No server-side business logic validation
  - No audit trail
  - RLS is the only protection layer (single point of failure)
  - No centralized error handling
- **Fix:** Create dedicated API routes (`/api/articles`) with server-side validation.

#### C4. Hardcoded email fallback in mail config
- **File:** `utils/mail/config.ts:8`
- **Issue:** `user: process.env.MAIL_USER || "jebo@kjtimes.co.kr"` — hardcoded email in source. If env var is missing, production will use this fallback silently.
- **Fix:** Remove default, throw error if `MAIL_USER` is not set.

#### C5. SQL-like injection risk in admin search
- **File:** `lib/api/articles.client.ts:73,79,95`
- **Issue:** `searchArticlesClient()` (line 22-23) escapes `%` and `_`, but `fetchAdminArticles()` (line 79) only strips `%`, not `_`. Inconsistent escaping. The `.or()` filter (line 95) injects `%${term}%` without full sanitization.
- **Fix:** Create a shared `escapeLikePattern()` function and use it consistently.

#### C6. No input validation on News Factory proxy
- **File:** `app/api/nf/[...path]/route.ts`
- **Issue:** Proxies ALL paths and request bodies to external API without validation. An attacker with access could potentially:
  - Access unintended News Factory endpoints
  - Send oversized payloads
  - Exfiltrate proxy credentials via error messages
- **Fix:** Whitelist allowed paths and validate request bodies.

#### C7. CMS E2E test is skipped
- **File:** `e2e/cms.spec.ts`
- **Issue:** The article lifecycle test (create → edit → publish → verify → delete) is marked `test.skip()`. This is the most critical user workflow and has zero test coverage.
- **Fix:** Enable the test, create proper test fixtures with setup/teardown.

---

### High (12)

#### H1. ~1000 lines of duplicated ArticleDetail code
- **Files:** `components/shared/ArticleDetail.tsx` (506 lines), `components/desktop/DesktopArticleDetail.tsx` (456 lines), `components/mobile/MobileArticleDetail.tsx` (345 lines)
- **Issue:** Three nearly identical components. `DesktopArticleDetail` is ~identical to `ArticleDetail`. `MobileArticleDetail` is 95% the same.
- **Fix:** Merge into single `ArticleDetail` with responsive logic using Mantine's `hiddenFrom`/`visibleFrom`.

#### H2. No duplicate detection in news webhook
- **File:** `app/api/news/receive/route.ts`
- **Issue:** The webhook can insert the same article multiple times if called again. No check on `source_url` or content hash.
- **Fix:** Add unique constraint on source_url or check existence before insert.

#### H3. E2E tests use `.catch(() => false)` — silent failures
- **Files:** `e2e/search.spec.ts`, `e2e/navigation.spec.ts`, `e2e/category.spec.ts` (30+ instances)
- **Issue:** Many assertions use `.catch(() => false)` which makes tests pass even when elements don't exist. Example: `await page.locator('.element').isVisible().catch(() => false)`.
- **Fix:** Use proper assertions: `await expect(page.locator('.element')).toBeVisible()`.

#### H4. No file size or MIME type validation on uploads
- **Files:** `hooks/useMediaLibrary.ts`, `components/admin/RichTextEditor.tsx`
- **Issue:** Files are uploaded to Supabase storage without size limits or strict MIME validation. Only checks if type starts with `image/`.
- **Fix:** Add max file size (e.g., 10MB), validate against MIME whitelist.

#### H5. No timeout on external API calls
- **Files:** `utils/mail/imap.ts`, `utils/mail/smtp.ts`, `app/api/nf/[...path]/route.ts`
- **Issue:** IMAP, SMTP, and News Factory proxy have no timeouts. A hanging connection will keep the serverless function alive indefinitely.
- **Fix:** Add `AbortController` with 30-second timeout to all external calls.

#### H6. Unsafe type assertions throughout
- **Files:** `lib/api/articles.ts:74,97,128,160,215`, `utils/mail/imap.ts:69,121,188`, `hooks/useArticleForm.ts:214,226`
- **Issue:** Extensive use of `as unknown as Type` without runtime validation. If Supabase schema changes, these will silently produce wrong data.
- **Fix:** Add Zod schemas or type guards for all Supabase response types.

#### H7. Mail send lacks email header injection prevention
- **File:** `app/api/mail/send/route.ts`
- **Issue:** `to`, `subject`, and `replyTo` fields are not validated for CRLF injection. An attacker could inject `\r\n` to add BCC headers or modify the email.
- **Fix:** Validate email format and strip CRLF from all header fields.

#### H8. Reader auth is placeholder only
- **Files:** `components/reader/LoginForm.tsx`, `components/reader/SignupForm.tsx`, `components/reader/AccountMenu.tsx`
- **Issue:** All three components use `alert()` instead of actual authentication. Login/signup forms have validation but no backend integration.
- **Fix:** Integrate with Supabase auth or defer behind a feature flag.

#### H9. Subscribe page has no backend
- **File:** `app/(main)/subscribe/page.tsx:14`
- **Issue:** Newsletter subscription form is rendered but submit handler has a TODO comment — no actual API call.
- **Fix:** Implement subscription storage or integrate with email marketing service.

#### H10. Mail delete button has no implementation
- **File:** `app/admin/mail/[uid]/page.tsx:130`
- **Issue:** Delete button exists in the UI but clicking it does nothing. No IMAP delete function exists.
- **Fix:** Implement IMAP message deletion or remove the button.

#### H11. Upload progress is simulated, not real
- **File:** `hooks/useMediaLibrary.ts`
- **Issue:** Upload progress shows 30% → 70% → 100% on fixed intervals, not based on actual upload progress. Misleads users on large files.
- **Fix:** Use XMLHttpRequest or tus protocol for real progress tracking (Supabase storage doesn't natively support progress via JS client).

#### H12. Missing database indexes on frequently queried columns
- **File:** `schema.sql`
- **Issue:** No indexes on `articles.status`, `articles.published_at`, `articles.category_id`, `articles.author_id`, `media.uploaded_by`. These columns are filtered/sorted in nearly every query.
- **Fix:** Add indexes:
  ```sql
  CREATE INDEX idx_articles_status ON articles(status);
  CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
  CREATE INDEX idx_articles_category_id ON articles(category_id);
  ```

---

### Medium (16)

#### M1. ArticleCard hover not keyboard accessible
- **File:** `components/shared/ArticleCard.tsx`
- **Issue:** Hover effects use `onMouseEnter/onMouseLeave` with direct DOM manipulation. Keyboard-only users never see hover states.
- **Fix:** Use CSS `:hover` and `:focus-within` instead of JavaScript event handlers.

#### M2. No error boundaries in admin pages
- **Files:** `app/admin/write/page.tsx`, `app/admin/articles/page.tsx`
- **Issue:** No React error boundaries wrap the complex admin forms. A runtime error crashes the entire page and loses unsaved work.
- **Fix:** Add `ErrorBoundary` components around the editor and article list.

#### M3. Inconsistent SQL escaping pattern
- **Files:** `lib/api/articles.client.ts:22-23` vs `lib/api/articles.client.ts:73`
- **Issue:** `searchArticlesClient()` escapes `%` and `_` but `fetchAdminArticles()` only strips `%`. Should use the same approach.
- **Fix:** Create `utils/escape.ts` with a shared `escapeLikePattern()` function.

#### M4. Server-side HTML sanitization uses regex (fragile)
- **File:** `utils/sanitize.ts:37-53`
- **Issue:** `sanitizeHtmlServer()` uses regex to strip scripts and event handlers. Regex-based HTML sanitization is fundamentally fragile — edge cases like `<scr<script>ipt>` can bypass it.
- **Fix:** Use a proper server-side DOM parser (e.g., `isomorphic-dompurify` or `sanitize-html` package).

#### M5. No IMAP/SMTP connection pooling
- **Files:** `utils/mail/imap.ts`, `utils/mail/smtp.ts`
- **Issue:** Every API request creates a new IMAP/SMTP connection, authenticates, performs the operation, and disconnects. This is slow and wastes resources.
- **Fix:** Implement connection pooling or reuse Nodemailer transport instances.

#### M6. No pagination in media library listing
- **File:** `hooks/useMediaLibrary.ts`
- **Issue:** `loadMedia()` fetches all media items without pagination. Large libraries (1000+ images) will be slow and memory-intensive.
- **Fix:** Add pagination with offset/limit.

#### M7. Auto-save error not surfaced to user
- **File:** `hooks/useAutoSave.ts`
- **Issue:** Auto-save errors are logged to console but not shown to the user. Silent save failures can cause data loss.
- **Fix:** Surface errors via notification or status indicator.

#### M8. Slug generation is fragile with hash functions
- **File:** `hooks/useArticleForm.ts`
- **Issue:** Internal slug generation uses custom hash functions, category code maps, and loops up to 20 times checking for collisions. Complex and hard to debug.
- **Fix:** Simplify to `category-slug/YYYYMMDD-{sequence}` or use UUID-based slugs.

#### M9. No confirmation dialog for batch delete
- **File:** `components/admin/articles/ArticlesBatchBar.tsx`
- **Issue:** Batch delete button triggers immediately without confirmation. Users could accidentally delete many articles.
- **Fix:** Add modal confirmation: "Delete {N} articles? This cannot be undone."

#### M10. `utils/articles.ts` is dead code (deprecated wrapper)
- **File:** `utils/articles.ts`
- **Issue:** Marked `@deprecated` but still exists. Unused wrapper around `lib/api/articles`.
- **Fix:** Remove the file. Verify no imports reference it.

#### M11. Category hardcoded info pages could use CMS
- **Files:** `app/(main)/about/AboutContent.tsx`, `app/(main)/advertise/AdvertiseContent.tsx`, etc.
- **Issue:** Company info, ad pricing, etc. are hardcoded in components. Any change requires a code deployment.
- **Fix:** Consider moving to Supabase `pages` table for CMS-managed static content (future enhancement).

#### M12. No security headers configured
- **File:** `next.config.ts`
- **Issue:** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or HSTS headers configured.
- **Fix:** Add security headers in `next.config.ts`:
  ```ts
  async headers() { return [{ source: '/(.*)', headers: [...] }]; }
  ```

#### M13. `dangerouslySetInnerHTML` for article content
- **File:** `components/shared/ArticleDetail.tsx`
- **Issue:** Article HTML content rendered via `dangerouslySetInnerHTML`. While sanitized, this is always a risk surface.
- **Fix:** Ensure server-side sanitization is robust (see M4). Consider using TipTap's read-only renderer instead of raw HTML.

#### M14. No audit logging for article operations
- **Files:** `hooks/useArticleForm.ts`, `hooks/useArticles.ts`
- **Issue:** No logging of who created, edited, published, or deleted articles. The `article_revisions` table exists in the schema but is never written to.
- **Fix:** Write revision records on every article save.

#### M15. E2E tests depend on database state (no fixtures)
- **Files:** All `e2e/*.spec.ts`
- **Issue:** Tests assume articles exist in the database. If the database is empty, tests will pass vacuously due to `.catch(() => false)` patterns.
- **Fix:** Create test fixtures or use seed data with deterministic IDs.

#### M16. Inconsistent category type handling
- **File:** `types/index.ts:27`
- **Issue:** `Article.categories` is typed as `ArticleCategory | ArticleCategory[] | null`. This union requires runtime checks everywhere it's used, leading to repeated `Array.isArray()` checks across the codebase.
- **Fix:** Normalize to always be `ArticleCategory | null` (single category per article, matching the DB schema).

---

### Low (12)

#### L1. Hardcoded company info in Footer
- **File:** `components/layout/Footer.tsx`
- **Issue:** Phone number, address, registration number hardcoded. Changes require code deployment.
- **Fix:** Move to constants file or CMS.

#### L2. No ARIA label on BottomNav container
- **File:** `components/layout/BottomNav.tsx`
- **Issue:** Mobile bottom navigation lacks `aria-label` on the nav element.
- **Fix:** Add `aria-label="주요 메뉴"`.

#### L3. Sorting creates new array on every render
- **File:** `components/layout/CategoryPageTemplate.tsx`
- **Issue:** `[...articles].sort(...)` runs on every render regardless of sort change.
- **Fix:** Memoize with `useMemo`.

#### L4. No alt text editing UI for figures
- **File:** `components/admin/FigureImage.tsx`
- **Issue:** Alt text is set on upload but cannot be edited afterward.
- **Fix:** Add alt text editing in the figure component.

#### L5. SearchFilters options are hardcoded
- **File:** `components/search/SearchFilters.tsx`
- **Issue:** Category and date filter options are inline arrays. Should be in constants.
- **Fix:** Move to `constants/search.ts`.

#### L6. No lazy loading for large media grids
- **File:** `components/admin/media/MediaGrid.tsx`
- **Issue:** All media thumbnails load at once. Large libraries will be slow.
- **Fix:** Add intersection observer or virtual scrolling.

#### L7. Cron input in subscription modal has no validation
- **File:** `components/admin/news-feed/SubscriptionModal.tsx`
- **Issue:** Custom cron expression input accepts any text. Invalid crons will cause silent failures.
- **Fix:** Add cron validation with `cron-parser` or similar library.

#### L8. No delete confirmation for subscriptions
- **File:** `components/admin/news-feed/NewsFeedSubscriptions.tsx`
- **Issue:** Delete subscription has no confirmation dialog.
- **Fix:** Add confirmation modal.

#### L9. Error messages may expose internal details
- **Files:** Various API routes
- **Issue:** Some error responses include raw error messages from Supabase or external APIs.
- **Fix:** Return generic error messages in production; log details server-side only.

#### L10. `@types/dompurify` in dependencies instead of devDependencies
- **File:** `package.json:27`
- **Issue:** `@types/dompurify` should be in devDependencies (type-only package).
- **Fix:** Move to devDependencies.

#### L11. Admin email domain hardcoded
- **File:** `app/admin/login/page.tsx`
- **Issue:** Login form appends `@kwangjeon.local` to the entered ID. Not configurable.
- **Fix:** Make domain configurable via environment variable.

#### L12. `test-imap.ts` script in production codebase
- **File:** `scripts/test-imap.ts`
- **Issue:** Debug/test script shouldn't ship in production.
- **Fix:** Add `scripts/` to `.dockerignore` or exclude from build.

---

## Architecture Assessment

### Strengths

1. **Clean App Router structure** — Route groups `(main)`, `admin`, `(share)` provide excellent separation
2. **Server/Client component separation** — Data fetching in server components, interactivity in client components
3. **ISR caching strategy** — 60-second revalidation balances freshness and performance
4. **Comprehensive SEO** — Dynamic metadata, JSON-LD, sitemaps, canonical URLs
5. **Unified ArticleCard** — 4 variants (featured, headline, list, compact) in one component
6. **Type-safe API layer** — `ApiResult<T>` pattern provides consistent error handling
7. **RLS security model** — Database-level access control on all tables
8. **DOMPurify sanitization** — XSS prevention on article content
9. **Parallel data fetching** — `Promise.all()` for article detail page queries
10. **Article deduplication** — `uniqueArticlesById()` prevents showing same article twice

### Weaknesses

1. **No API routes for article CRUD** — Direct Supabase from frontend is the biggest architectural gap
2. **No audit trail** — `article_revisions` table exists but is never populated
3. **No unit tests** — Only E2E tests exist; no component or utility tests
4. **Article detail duplication** — 3 copies of the same component
5. **No caching layer** — Categories and tags are fetched on every request

### Database Schema

The schema is well-designed with proper constraints:
- ✅ UUID primary keys
- ✅ RLS enabled on all tables
- ✅ Proper foreign keys with CASCADE
- ✅ Status workflow with CHECK constraint
- ✅ SEO fields on articles
- ✅ Trigger for auto-creating profiles on signup
- ⚠️ Missing indexes on frequently queried columns
- ⚠️ `article_revisions` exists but is unused

---

## Dependency Health

| Package | Version | Status |
|---------|---------|--------|
| next | 16.1.6 | ✅ Current |
| react / react-dom | 19.2.3 | ✅ Current |
| @mantine/core | 8.3.13 | ✅ Current |
| @supabase/supabase-js | 2.95.3 | ✅ Current |
| @tiptap/* | 3.19.0 | ✅ Current |
| typescript | 5.x | ✅ Current |
| @playwright/test | 1.58.1 | ✅ Current |
| dompurify | 3.3.1 | ✅ Current |
| nodemailer | 8.0.1 | ✅ Current |
| axios | 1.13.5 | ⚠️ Check for updates |
| cheerio | 1.2.0 | ⚠️ Check for updates |
| imapflow | 1.2.9 | ⚠️ Check for updates |

---

## Recommended Priority Order

### Week 1 (Critical Security)
1. **C1** — Restrict image remote patterns to specific domains
2. **C2** — Add rate limiting to `/api/mail/send` and `/api/news/receive`
3. **C5** — Fix SQL injection risk in search functions
4. **C4** — Remove hardcoded email fallback
5. **M12** — Add security headers

### Week 2 (Critical Stability)
6. **C6** — Whitelist News Factory proxy paths
7. **C7** — Enable CMS E2E test
8. **H2** — Add duplicate detection to news webhook
9. **H7** — Prevent email header injection
10. **H12** — Add database indexes

### Week 3 (Code Quality)
11. **H1** — Merge ArticleDetail component variants
12. **H3** — Fix E2E test silent failures
13. **H6** — Add type guards for Supabase responses
14. **M3** — Unify SQL escape patterns
15. **M10** — Remove deprecated `utils/articles.ts`

### Week 4 (Features & Polish)
16. **C3** — Create article CRUD API routes (larger effort)
17. **H4** — Add file upload validation
18. **H5** — Add timeouts to external calls
19. **M4** — Use proper server-side HTML sanitizer
20. **M14** — Implement audit logging via article_revisions

---

## File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `app/` | 49 | Pages, layouts, API routes, SEO |
| `components/` | 37 | React UI components |
| `hooks/` | 5 | Custom React hooks |
| `lib/api/` | 4 | Data access layer |
| `utils/` | 12 | Utilities (Supabase, mail, sanitize) |
| `constants/` | 2 | Navigation, news factory mapping |
| `types/` | 1 | TypeScript interfaces |
| `e2e/` | 8 | Playwright test files |
| **Total** | **~118** | |

---

*Report generated by exhaustive codebase audit using 6 parallel analysis agents covering all 118 source files.*
