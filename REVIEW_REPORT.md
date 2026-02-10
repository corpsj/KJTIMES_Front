# KJTIMES Front — UX/UI/Code Review Report

**Date:** 2026-02-11  
**Reviewer:** Ruthless Senior UX/UI/Code Reviewer  
**Target:** https://kjtimes.co.kr + Codebase  

---

## 🔴 Critical (Broken functionality, Security issues)

### C-01. `.env.local` Exposes ALL Secret Keys in Codebase
**File:** `.env.local`  
**What's wrong:** The `.env.local` file containing `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_NEWS_FACTORY_API_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` is committed to the repo (or at least accessible in the workspace). The **service role key** grants full bypass of Row Level Security on Supabase — anyone with this key has god-mode access to the entire database.  
**Expected:** Service role keys must NEVER be in version control. Use environment-only injection on the hosting platform. Add `.env.local` to `.gitignore`.

### C-02. Server-Side Supabase Client Uses Service Role Key for ALL Requests
**File:** `utils/supabase/server.ts`  
**What's wrong:** The server client falls back through `SUPABASE_SERVICE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If `SUPABASE_SERVICE_KEY` is set (and `.env.local` shows `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_SERVICE_KEY`), it falls to the anon key. But the env var name mismatch (`SUPABASE_SERVICE_ROLE_KEY` in .env vs `SUPABASE_SERVICE_KEY` in code) means it may silently use the anon key for all server requests, or worse, if someone fixes the env var name, ALL public page requests run with service role privileges — bypassing RLS entirely.  
**Expected:** Public pages should ONLY use the anon key. Service role key should be reserved exclusively for API routes that need it (like `/api/news/receive`).

### C-03. API Endpoints Have No Authentication
**Files:** `app/api/mail/route.ts`, `app/api/mail/send/route.ts`  
**What's wrong:** The mail API routes (`GET /api/mail`, `POST /api/mail/send`) have zero authentication. Anyone on the internet can read ALL emails in the inbox and send emails as the organization. This is a severe security vulnerability.  
**Expected:** All API routes must verify the user's Supabase auth session before processing.

### C-04. Signup Page Allows Unrestricted Admin Account Creation
**File:** `app/signup/page.tsx`  
**What's wrong:** The `/signup` page allows anyone to create an admin account with full CMS access. There's no invitation system, no admin approval, no email verification (fake `@kwangjeon.local` domain). Any attacker can create an account and gain access to the CMS, publish articles, delete content, and access the mail system.  
**Expected:** Signup should be disabled for public access, or require admin invitation/approval.

### C-05. XSS Vulnerability in Article Content Rendering
**Files:** `components/desktop/DesktopArticleDetail.tsx`, `components/mobile/MobileArticleDetail.tsx`, `app/admin/write/page.tsx` (preview modal)  
**What's wrong:** Article content is rendered with `dangerouslySetInnerHTML`. The `normalizeArticleHtml()` function only strips `color`, `background`, and `background-color` styles — it does NOT sanitize against script injection, event handlers (`onclick`, `onerror`), or other XSS vectors. A malicious article author could inject JavaScript.  
**Expected:** Use a proper HTML sanitizer (DOMPurify or sanitize-html) before rendering user-generated HTML.

### C-06. News Receive API Has Weak Secret-Based Auth
**File:** `app/api/news/receive/route.ts`  
**What's wrong:** The API uses a simple Bearer token (`NEWS_RECEIVE_SECRET`). This env var is not in `.env.local`, meaning the endpoint currently responds with `500 "Server misconfigured"` — the feature is broken in production.  
**Expected:** Configure the secret or disable the endpoint. Also add rate limiting.

### C-07. Race Condition in View Counter
**File:** `app/(main)/article/[id]/page.tsx`  
**What's wrong:** `await supabase.from("articles").update({ views: (article.views || 0) + 1 }).eq("id", id)` has a classic race condition. Two concurrent requests read the same view count and both increment by 1, losing a count. Also, bots and crawlers inflate view counts.  
**Expected:** Use Supabase RPC with `increment` function or database-level atomic increment.

---

## 🟠 Major (Bad UX, accessibility failures, significant visual bugs)

### M-01. Homepage Shows "No Articles" — Empty State for ALL Category Pages  
**Pages:** `/`, `/politics`, `/economy`, `/society`, `/culture`, `/opinion`, `/sports`, `/special-edition`  
**What's wrong:** The production site shows "아직 게시된 기사가 없습니다" on every page. There are 2 articles in the CMS (1 pending_review, 1 shared) but zero with `status = "published"`. The site effectively has NO public content — it's an empty shell visible to all visitors.  
**Expected:** Either publish some articles, or show a better landing page. An empty news site destroys credibility.

### M-02. `/login` Page is Non-Functional
**File:** `app/login/page.tsx`  
**What's wrong:** The `/login` page renders a form with email/password fields and a "비밀번호 찾기" (forgot password) link, but the login button does NOTHING — there's no `onSubmit`, no `onClick`, no form action. It's a completely dead page. The placeholder says "you@mantine.dev" — copied from Mantine's example template without customization.  
**Expected:** Either implement the login functionality or remove the page entirely.

### M-03. Header "로그인" Link Goes to `/admin/login` — Not `/login`
**Files:** `components/layout/Header.tsx`, `components/mobile/MobileHeader.tsx`  
**What's wrong:** The main site's "로그인" (Login) link in the header directs users to `/admin/login` (CMS login). Regular users should not be directed to the admin login page. The separate `/login` page exists but is broken (see M-02).  
**Expected:** Regular users should have their own login, or the login link should be hidden until reader accounts are implemented.

### M-04. Admin Sidebar Missing "제보함" (Mail) Navigation Link
**File:** `components/admin/AdminSidebar.tsx`  
**What's wrong:** The admin sidebar navigation includes Dashboard, Articles, Write, Media, and News Feed — but NOT the Mail page (`/admin/mail`). The mail feature exists and works, but admins can only access it by manually typing the URL. There's no discoverable path to this critical journalism tool.  
**Expected:** Add `{ href: "/admin/mail", label: "제보함", icon: <IconMail size={20} /> }` to `navItems`.

### M-05. Dashboard Stats Don't Add Up (2 total = 0 published + 0 draft + 1 pending)
**Page:** `/admin` (Dashboard)  
**What's wrong:** Dashboard shows "전체 기사: 2, 게시: 0, 작성: 0, 승인 대기: 1" — that only accounts for 1 of the 2 articles. The second article has status "shared" which isn't counted anywhere in the stats. The shared status is invisible in the dashboard's mental model.  
**Expected:** Either add a "공유" stat card, or count "shared" articles under "게시".

### M-06. Mobile Footer Component Missing — `MobileFooter` Not Found
**File:** `components/layout/DeviceLayout.tsx` imports `MobileFooter` from `@/components/mobile/MobileFooter`  
**What's wrong:** The file tree doesn't include `MobileFooter.tsx` in the components listing. If this component doesn't exist, the mobile layout would crash. If it does exist as a minimal component, it likely has no content.  
**Expected:** Verify MobileFooter exists and contains proper footer content matching the desktop footer.

### M-07. `Header.tsx` Has BOTH Desktop and Mobile Views — Redundant with `MobileHeader.tsx`
**Files:** `components/layout/Header.tsx`, `components/mobile/MobileHeader.tsx`, `components/layout/DeviceLayout.tsx`  
**What's wrong:** `Header.tsx` contains both `visibleFrom="md"` (desktop) and `hiddenFrom="md"` (mobile) sections including a full mobile burger menu/drawer. But `DeviceLayout.tsx` uses server-side device detection to render either `Header` (desktop) or `MobileHeader` (mobile). This means: 1) The desktop Header's mobile section is dead code that's never visible, and 2) There are two completely separate mobile header implementations.  
**Expected:** Remove the mobile section from `Header.tsx`. Use ONE mobile header component.

### M-08. Mantine `visibleFrom`/`hiddenFrom` Conflicts with Server-Side Device Detection
**Files:** `components/layout/Header.tsx`, middleware.ts, `utils/device.ts`  
**What's wrong:** The app uses UA-based server-side device detection (middleware → x-device-type header) to choose between Desktop/Mobile component trees. But `Header.tsx` ALSO uses Mantine's CSS-based responsive visibility (`visibleFrom="md"`, `hiddenFrom="md"`). These two strategies can conflict — e.g., a tablet at 1024px wide might get the desktop component tree (UA says tablet=mobile, but Mantine's md breakpoint says desktop).  
**Expected:** Pick ONE responsive strategy and use it consistently.

### M-09. Search Page Shows "검색" Title with Empty State Instead of Actual `/search` Page Content  
**Page:** `/search` (no query)  
**What's wrong:** Visiting `/search` without a query shows the same empty article state as the homepage (confirmed via screenshot). The actual search page code should show "검색어를 입력해 주세요" — meaning the page isn't rendering correctly on production.  
**Expected:** The search page should render its own content, not the homepage empty state.

### M-10. No 404 Page — Missing Articles Return `notFound()` but No Custom 404
**File:** `app/(main)/article/[id]/page.tsx`  
**What's wrong:** `notFound()` is called but there's no custom `not-found.tsx` file anywhere in the app. Users hitting a bad article ID get Next.js's default 404 page, which is unstyled and unprofessional for a news site.  
**Expected:** Create a custom `not-found.tsx` with proper branding.

### M-11. No Favicon Configured
**What's wrong:** The site has no favicon or web manifest configured. The `public/` folder has `brand/` but no `favicon.ico` at root. Browser tabs show a blank icon.  
**Expected:** Add proper favicon, apple-touch-icon, and web manifest for PWA support.

### M-12. Share to Kakao Uses KakaoStory (Deprecated) Instead of KakaoTalk
**File:** `components/shared/ShareActions.tsx`  
**What's wrong:** The "Kakao" share button links to `story.kakao.com/share` — which is KakaoStory, a service that Kakao shut down in 2023. This share button is completely broken for Korean users, who overwhelmingly use KakaoTalk.  
**Expected:** Implement KakaoTalk sharing via the Kakao JavaScript SDK (`Kakao.Share.sendDefault()`).

### M-13. Footer Layout Breaks on Mobile — Side-by-Side Becomes Unreadable
**File:** `components/layout/Footer.tsx`  
**What's wrong:** The footer uses `<Group justify="space-between" align="start">` for a two-column layout. On narrow screens, the utility links group will wrap awkwardly. There's no responsive adjustment.  
**Expected:** Stack footer content vertically on mobile viewports.

### M-14. No Loading State for CMS Admin Auth Check — Flash of Empty Content
**File:** `app/admin/layout.tsx`  
**What's wrong:** During the auth check (`useEffect` + `supabase.auth.getUser()`), the layout shows "CMS 로딩 중..." text. But if the user IS logged in, there's still a brief flash of this loading state on every admin page navigation because `loading` starts as `true`.  
**Expected:** Use optimistic rendering or check session from cookies for instant auth state.

---

## 🟡 Minor (Polish issues, inconsistencies, nice-to-haves)

### N-01. `globals.css` References Geist Font Variables That Don't Exist
**File:** `app/globals.css`  
**What's wrong:** `--font-sans: var(--font-geist-sans); --font-mono: var(--font-geist-mono);` — but the app only loads Noto Sans KR. Geist fonts are never imported. These CSS variables resolve to nothing.  
**Expected:** Remove Geist font references or add the font import.

### N-02. Root Layout Metadata Title Says "Kwangjeon Times" — Should Be Korean
**File:** `app/layout.tsx`  
**What's wrong:** `title: "Kwangjeon Times"` — this is the English transliteration. The site is entirely in Korean. The browser tab shows English text for a Korean site.  
**Expected:** Use "광전타임즈" as the default title, with English as a subtitle if needed.

### N-03. Mixed Use of `alert()` Throughout CMS — No Toast/Notification System
**Files:** `app/admin/articles/page.tsx`, `app/admin/write/page.tsx`, `app/admin/media/page.tsx`  
**What's wrong:** The CMS uses `window.alert()` for success/error feedback in dozens of places (e.g., "URL이 복사되었습니다", "삭제 실패", "공유 링크를 복사했습니다"). This blocks the UI thread and provides a jarring UX. The News Feed page has a custom toast system but it's not shared.  
**Expected:** Use Mantine's notification system (`@mantine/notifications`) consistently.

### N-04. Inconsistent Slug Generation — Manual Input Removed But Handler Remains
**File:** `app/admin/write/page.tsx`  
**What's wrong:** The slug field is read-only (displays "카테고리 선택 후 자동 생성") but `normalizeSlugInput()` still processes manual input. The slug input field was removed from the UI but the logic for manual slugs remains — dead code.  
**Expected:** Clean up the unused slug normalization code.

### N-05. Unused Variable `Overlay` Imported in Media Page
**File:** `app/admin/media/page.tsx`  
**What's wrong:** `Overlay` is imported from `@mantine/core` but never used.  
**Expected:** Remove unused import.

### N-06. No `aria-label` on Burger Menu in Desktop Header
**File:** `components/layout/Header.tsx`  
**What's wrong:** `<Burger opened={opened} onClick={toggle} size="sm" />` in the mobile section of the desktop Header has no `aria-label`. The MobileHeader correctly has `aria-label="메뉴 열기"`.  
**Expected:** Add `aria-label="메뉴 열기"` (though this code is dead code per M-07).

### N-07. Special Edition Category Auto-Created on Every Editor Load
**File:** `app/admin/write/page.tsx`  
**What's wrong:** Every time the write page loads, it checks if the "창간특별호" category exists and creates it if not (including handling 23505 duplicate errors). This insert-on-load pattern is wasteful and creates unnecessary DB round trips.  
**Expected:** Create the category via migration/seed script, not on every page load.

### N-08. `PREVIEW_MODE` Flag Duplicated in Two Files
**Files:** `middleware.ts`, `components/layout/DeviceLayout.tsx`  
**What's wrong:** Both files have `const PREVIEW_MODE = false;` hardcoded. If someone enables preview mode, they must remember to change it in BOTH files. This is a guaranteed source of bugs.  
**Expected:** Use a single source of truth — an environment variable.

### N-09. `confirm()` and `prompt()` Used Instead of Modal Dialogs
**Files:** `app/admin/articles/page.tsx` (bulk delete), `app/admin/news-feed/page.tsx` (`deleteSub`)  
**What's wrong:** Native `window.confirm()` is used for destructive actions. These are unstyled, can't be customized, and look jarring in a polished CMS.  
**Expected:** Use Mantine's `Modal` component consistently (the single-article delete already uses a modal).

### N-10. Search SQL Injection via `ilike` Pattern
**Files:** `app/admin/articles/page.tsx`, `app/(main)/search/page.tsx`  
**What's wrong:** In articles page: `searchTermRef.current.trim().replace(/[%]/g, "")` only strips `%` but not `_` (single-character wildcard in SQL LIKE). In search page: both `%` and `_` are escaped properly. Inconsistent escaping.  
**Expected:** Use consistent SQL pattern escaping everywhere.

### N-11. `style jsx` in Mail Page — Mixing CSS-in-JS Approaches
**File:** `app/admin/mail/page.tsx`  
**What's wrong:** The mail page uses Next.js `<style jsx>` for local CSS, while every other admin page uses either Mantine components, CSS modules, or the global `admin2.css`. Three different styling approaches in one admin area is messy.  
**Expected:** Use one consistent styling approach.

### N-12. News Feed Page Shows Pagination "1/3" Even With Zero Articles
**Page:** `/admin/news-feed`  
**What's wrong:** The news feed shows "표시할 기사가 없습니다" but also shows pagination "← 이전 1/3 다음 →" and the "다음" button is active. This is confusing and the pagination calculation is wrong for empty results.  
**Expected:** Hide pagination when there are no results, or fix the totalArticles calculation.

### N-13. Subscribe Form Does Nothing — No Backend
**File:** `app/(main)/subscribe/page.tsx`  
**What's wrong:** The subscribe form has `// TODO: 실제 구독 API 연동` — it just sets local state to show a success message. No email is actually saved anywhere. Users think they've subscribed but nothing happens.  
**Expected:** Either implement the subscription API or remove the form and show "준비 중" message.

### N-14. `word count` Calculation Uses `split(/\s+/)` — Inaccurate for Korean
**File:** `app/admin/write/page.tsx`  
**What's wrong:** Korean doesn't use spaces between words the same way English does. `plainText.split(/\s+/).length` gives an inaccurate word count for Korean text, and the "읽기 약 X분" estimate (based on 250 words/minute English reading speed) is wrong.  
**Expected:** Use character count ÷ ~500 for Korean reading time estimation.

### N-15. Homepage Headline Uses `articles.slice(5, 8)` — Not Enough Articles
**File:** `components/desktop/DesktopMain.tsx`  
**What's wrong:** The homepage splits 20 articles into: MainNews (0-5), Headline (5-8), Opinion (filtered by category), PopularNews (sorted by views top 5). With fewer than 8 articles, the Headline section will be empty or partially filled. No graceful degradation.  
**Expected:** Adapt the layout based on the actual number of articles available.

### N-16. `NEXT_PUBLIC_SITE_URL` Not Set — SEO Canonical URLs Use Request Headers
**Files:** `utils/site.ts`, `.env.local`  
**What's wrong:** `NEXT_PUBLIC_SITE_URL` is not in `.env.local`. The `getSiteUrl()` falls back to request headers (`x-forwarded-host`), which can be spoofed. This affects canonical URLs, OpenGraph URLs, sitemaps, and JSON-LD structured data.  
**Expected:** Set `NEXT_PUBLIC_SITE_URL=https://kjtimes.co.kr` in environment variables.

### N-17. MobileHeader Uses `position: "sticky"` But Has No z-index Management
**File:** `components/mobile/MobileHeader.tsx`  
**What's wrong:** The header is `position: sticky; top: 0; zIndex: 100` but the admin write page's sticky toolbar uses `zIndex: 10`. These z-index values are ad-hoc with no system.  
**Expected:** Use a z-index scale defined in theme constants.

### N-18. `@tailwindcss/postcss` in devDependencies but Tailwind Barely Used
**Files:** `package.json`, `globals.css`  
**What's wrong:** Tailwind CSS v4 is installed and imported (`@import "tailwindcss"` in globals.css) along with PostCSS config, but the app uses Mantine for ALL components and inline styles. The only Tailwind usage is `antialiased` class on `<body>`. This adds unnecessary build overhead.  
**Expected:** Remove Tailwind if Mantine is the design system.

### N-19. `useSearchParams()` Without `Suspense` Boundary — Next.js Warning
**Files:** `app/admin/articles/page.tsx`, `app/admin/write/page.tsx`  
**What's wrong:** `useSearchParams()` in client components without a `Suspense` boundary causes a warning in Next.js 14+ and may cause issues in production builds.  
**Expected:** Wrap components using `useSearchParams` in `<Suspense>`.

### N-20. No `robots.txt` Blocking Admin Routes
**File:** `app/robots.ts`  
**What's wrong:** The robots.ts allows all paths (`allow: "/"`). Search engines can crawl and index `/admin/login`, `/signup`, `/admin/*` pages.  
**Expected:** Add `disallow: ["/admin", "/signup", "/api"]` rules.

### N-21. Copyright Says "Kwangjeon Times" Not "Kwangjeon Times" or "광전타임즈"
**File:** `components/layout/Footer.tsx`  
**What's wrong:** "Copyright © Kwangjeon Times. All rights reserved." — no year. Should include the current year and be in Korean for consistency.  
**Expected:** "Copyright © 2026 광전타임즈. All rights reserved."

### N-22. `date.ts` Not Reviewed — `formatKoreanDate` May Have Issues
**File:** `utils/date.ts`  
**What's wrong:** This utility is used throughout the app but wasn't included in the reviewed file set. If it formats dates incorrectly (e.g., timezone issues), all displayed dates could be wrong.  
**Expected:** Verify timezone handling uses `Asia/Seoul`.

### N-23. Admin Write Page Has Over 700 Lines of Code — Needs Decomposition
**File:** `app/admin/write/page.tsx`  
**What's wrong:** The write page is 1270+ lines in a single component with dozens of state variables, multiple effects, and inline business logic. This is unmaintainable.  
**Expected:** Extract into sub-components: ArticleForm, SlugManager, ThumbnailPicker, SEOPanel, AutoSaveManager.

### N-24. "기자 구독" Button Does Nothing
**Files:** `components/desktop/DesktopArticleDetail.tsx`, `components/mobile/MobileArticleDetail.tsx`  
**What's wrong:** The "기자 구독" (Follow Reporter) button in article detail pages is a plain `<button>` with no onClick handler. It renders but clicking it does nothing.  
**Expected:** Either implement reporter follow functionality or remove the button.

### N-25. Article Detail "ADVERTISEMENT" Section Shows Placeholder Text
**Files:** `components/desktop/DesktopArticleDetail.tsx`, `components/mobile/MobileArticleDetail.tsx`  
**What's wrong:** A prominent "ADVERTISEMENT" section shows "광고 영역" (Ad Area) placeholder text. This looks unfinished and unprofessional.  
**Expected:** Either integrate actual ads or remove the placeholder.

### N-26. `eslint-disable-next-line react-hooks/exhaustive-deps` Used Multiple Times
**Files:** `app/admin/write/page.tsx`, `app/admin/media/page.tsx`, `app/admin/news-feed/page.tsx`  
**What's wrong:** Multiple ESLint suppression comments for exhaustive-deps rule. This usually means the dependency arrays are intentionally incorrect, which can lead to stale closures and bugs.  
**Expected:** Properly structure effects to satisfy the exhaustive-deps rule.

### N-27. `Unused Import` in Several Files
**File:** `app/admin/articles/page.tsx`  
**What's wrong:** `IconEye`, `IconX` are imported but never used.  
**Expected:** Clean up unused imports.

### N-28. Hardcoded Reporter Bio — "현장 중심의 정치·사회 이슈를 취재합니다"
**Files:** `components/desktop/DesktopArticleDetail.tsx`, `components/mobile/MobileArticleDetail.tsx`  
**What's wrong:** Every article shows the same hardcoded reporter bio regardless of who wrote it. This is misleading.  
**Expected:** Either fetch the actual reporter bio from profiles table, or remove the bio entirely.

### N-29. `thumbnail_url` Cast as `Record<string, unknown>` in Write Page
**File:** `app/admin/write/page.tsx`  
**What's wrong:** `setThumbnailUrl((data as Record<string, unknown>).thumbnail_url as string | null ?? null)` — this cast bypasses TypeScript's type system. The article type should include `thumbnail_url` natively.  
**Expected:** Update the Supabase select to include `thumbnail_url` in the type.

### N-30. No Error Boundary for Client Components
**What's wrong:** No `error.tsx` files exist anywhere in the app. If any client component throws, users see React's default error screen.  
**Expected:** Add `error.tsx` at the root and in key route segments.

### N-31. `new Date()` Used in Server Components Without Timezone Awareness  
**Files:** `components/layout/Header.tsx`, `app/admin/page.tsx`  
**What's wrong:** `new Date().toLocaleDateString("ko-KR", ...)` in the Header component uses the server's timezone, not `Asia/Seoul`. On Vercel edge, this could show the wrong date.  
**Expected:** Always specify `timeZone: "Asia/Seoul"` (Header.tsx does this correctly, but the admin dashboard's `todayFormatted` does NOT).

### N-32. News Feed Page Uses Raw HTML Classes Instead of Mantine
**File:** `app/admin/news-feed/page.tsx`  
**What's wrong:** The page uses raw HTML elements (`<div>`, `<button>`, `<select>`, `<table>`) with custom CSS classes from `admin2.css`, while importing `Stack` from Mantine and `AdminHeader`. This hybrid approach is inconsistent with the rest of the CMS which uses Mantine components.  
**Expected:** Standardize on Mantine components across all admin pages.

### N-33. Subscribe Page Uses `formEvent` but Has No `action` Attribute Fallback
**File:** `app/(main)/subscribe/page.tsx`  
**What's wrong:** The form uses `onSubmit` with `preventDefault()`. If JavaScript fails to load, the form does nothing. No progressive enhancement.  
**Expected:** Add a fallback form `action` that posts to a server endpoint.

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 7 |
| 🟠 Major | 14 |
| 🟡 Minor | 33 |
| **Total** | **54** |

### Top 5 Priorities (Fix Immediately)
1. **C-01 + C-02:** Fix Supabase key exposure and server client key usage
2. **C-03:** Add authentication to mail API endpoints  
3. **C-04:** Disable public signup or add admin approval
4. **C-05:** Sanitize HTML content before rendering
5. **M-01:** Publish at least some content — an empty news site is dead on arrival
