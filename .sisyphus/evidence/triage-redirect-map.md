# Redirect Behavior Map (Playwright)

Environment: `http://localhost:3000`

## Scenario A: clean context (no `kj_special_issue_lock` cookie)

| Requested URL | Final URL | HTTP status | Redirect observed |
|---|---|---:|---|
| `/` | `/` | 200 | No |
| `/politics` | `/politics` | 200 | No |
| `/search?q=test` | `/search?q=test` | 200 | No |

Interpretation:
- With current local env (`PREVIEW_MODE` off), these routes do not redirect.

## Scenario B: after visiting `/share/preview-lock-test` (lock cookie set)

Cookie set by middleware:
- Name: `kj_special_issue_lock`
- Value: `preview-lock-test`
- TTL: 12 hours (`maxAge=43200`)

| Requested URL | Final URL | HTTP status | Redirect observed |
|---|---|---:|---|
| `/` | `/share/preview-lock-test` | 200 | Yes |
| `/politics` | `/share/preview-lock-test` | 200 | Yes |
| `/search?q=test` | `/share/preview-lock-test` | 200 | Yes (query removed by middleware) |

Interpretation:
- `SPECIAL_ISSUE_LOCK_COOKIE` forces broad redirects across public routes.
- This behavior can mask real page-level behavior during QA and can look like broken main/category/search flows.
