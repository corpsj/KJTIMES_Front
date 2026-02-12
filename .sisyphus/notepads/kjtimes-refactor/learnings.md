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
