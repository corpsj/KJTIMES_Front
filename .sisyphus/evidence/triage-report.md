# Task 0 Triage Report: PREVIEW_MODE and Middleware Diagnosis

## Scope
- Target files: `middleware.ts`, `.env.local`, `CUSTOMER_REPORT.md`
- Runtime check: localhost Playwright redirect validation (`/`, `/politics`, `/search?q=test`)
- No code fixes applied (diagnosis only)

## PREVIEW_MODE status
- **Local status: OFF**
  - `.env.local` does not define `NEXT_PUBLIC_PREVIEW_MODE`
  - shell env (`printenv | grep PREVIEW_MODE`) returns no value
  - result: `const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"` evaluates to `false`
- **Configured location**
  - `middleware.ts:12` computes `PREVIEW_MODE` from `NEXT_PUBLIC_PREVIEW_MODE`
  - `middleware.ts:42-46`: when `PREVIEW_MODE=true`, `/` redirects to `/special-edition`
  - `middleware.ts:49-57`: when `PREVIEW_MODE=true`, non-allowed public paths redirect to `/special-edition`

## SPECIAL_ISSUE_LOCK_COOKIE mechanism analysis
- Cookie key: `kj_special_issue_lock` (`middleware.ts:5`)
- Set condition: request path matches `/share/{slug}` (`middleware.ts:60-76`)
- Cookie options:
  - `httpOnly: true`, `sameSite: "lax"`, `path: "/"`
  - `maxAge: 60 * 60 * 12` (12 hours)
- Enforcement: if cookie exists, all non-admin/non-auth routes are redirected to `/share/{slug}` (`middleware.ts:82-87`)
- Important side effect: redirect clears query string (`redirectUrl.search = ""`, `middleware.ts:85`)
- Risk profile:
  - user can become effectively "locked" into a share slug for 12 hours
  - homepage/category/search discovery flow is overridden while lock is active

## CUSTOMER_REPORT.md issue classification (13 items)

Legend:
- **Artifact**: likely explained by preview/redirect mode behavior
- **Real bug**: genuine product defect independent of preview gating
- **Mixed**: preview may amplify visibility, but a real issue also exists

| # | Reported issue | Classification | Why |
|---|---|---|---|
| 1 | Mobile header/menu disappears | **Real bug** | UI/render issue; middleware preview logic does not selectively hide mobile header controls. |
| 2 | Admin credentials prefilled on login page | **Real bug** | Security/UI misconfiguration unrelated to middleware redirect rules. |
| 3 | Link copy opens `/admin`, unauthenticated admin access | **Real bug** | Action routing/auth flaw; not caused by preview redirect conditions. |
| 4 | Test article publicly exposed | **Real bug** | Content governance/publishing control issue, independent of preview mode. |
| 5 | Broken image in article | **Real bug** | Asset/storage reference failure, unrelated to middleware gating. |
| 6 | Footer links (`/about`-type pages) error | **Real bug** | Route/data error pages; preview would redirect to `/special-edition`, not show these dedicated errors in normal flow. |
| 7 | Search cannot find existing article | **Mixed (likely real)** | If preview/lock redirects are active, search flow can be hijacked; however local normal route behavior still indicates search correctness must be validated as a real feature bug. |
| 8 | Main page shows no articles | **Mixed (preview artifact candidate)** | If `PREVIEW_MODE=true`, `/` is forcibly redirected to `/special-edition`; symptom can be environment artifact. Could also be real empty-feed/data filter issue. |
| 9 | Category pages all empty | **Mixed (preview artifact candidate)** | If `PREVIEW_MODE=true`, category paths should redirect to `/special-edition`; perceived emptiness may be preview artifact, but category feed population may also be genuinely empty. |
| 10 | Search keyword disappears after search | **Real bug** | Also consistent with lock-cookie redirect dropping query (`redirectUrl.search=""`), making this strongly real in locked state. |
| 11 | Login URL is `/admin/login` | **Real bug** | IA/product-routing decision issue, not preview behavior. |
| 12 | Article detail has many placeholders | **Real bug** | Data fallback/content completeness issue; middleware not relevant. |
| 13 | Footer copyright mismatch | **Real bug** | Static layout consistency defect, unrelated to middleware. |

## Triage conclusion
- Local environment does **not** have preview mode enabled.
- Middleware contains **two independent global redirect levers**:
  1. `PREVIEW_MODE` public-route gating to `/special-edition`
  2. `SPECIAL_ISSUE_LOCK_COOKIE` 12-hour forced redirect to `/share/{slug}`
- Reported issue set is mostly real product defects; only items **8/9** (and partially **7**) are strong preview/redirect artifact candidates.

## Phase 1 recommendations
1. **Environment hardening first**
   - Ensure `NEXT_PUBLIC_PREVIEW_MODE` is unset/`false` in production unless explicit launch event.
   - Add deployment checklist item to verify preview flag before release.
2. **Lock-cookie blast-radius reduction**
   - Limit lock redirect to a narrower route scope (or explicit opt-in flow) instead of all public paths.
   - Stop dropping query strings on redirect when preserving search/user context is required.
   - Consider short TTL or one-time lock semantics instead of 12-hour global lock.
3. **Then fix real defects in priority order**
   - Security/authentication regressions (#2, #3, #11)
   - Mobile navigation availability (#1)
   - Core discovery/content integrity (#6, #7, #8, #9, #10)
   - Content quality consistency (#4, #5, #12, #13)
