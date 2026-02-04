# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains App Router pages, layouts, and route handlers (start with `app/page.tsx`).
- `components/` holds UI building blocks grouped by surface area (`desktop/`, `mobile/`, `layout/`, `admin/`, `home/`).
- `utils/` provides shared logic such as Supabase clients and device detection.
- `types/`, `constants/`, and `theme.ts` capture shared types, constants, and Mantine theme tokens.
- `public/` stores static assets.
- `e2e/` contains Playwright end-to-end tests.
- `schema.sql` and `migration_v2.sql` track database schema and migrations.

## Build, Test, and Development Commands
- `npm run dev` starts the Next.js dev server at `http://localhost:3000`.
- `npm run build` produces a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint with the Next.js config.
- `npx playwright test` runs e2e tests using `playwright.config.ts` (auto-starts a dev server).

## Coding Style & Naming Conventions
- TypeScript + React with the Next.js App Router; prefer absolute imports via `@/`.
- Follow existing formatting (most TSX uses 2-space indents). Keep diffs focused and avoid bulk reformatting.
- Component files in `components/` use `PascalCase.tsx`, with `PascalCase` component exports.
- Styling uses Mantine (see `theme.ts`) and Tailwind (see `app/globals.css`); prefer shared theme tokens for common UI patterns.

## Testing Guidelines
- Playwright e2e tests live in `e2e/` and use `*.spec.ts` naming.
- Run tests with `npx playwright test`; HTML reports land in `playwright-report/` and artifacts in `test-results/`.

## Commit & Pull Request Guidelines
- Recent commits use short, sentence-case summaries without prefixes. Example: `Update footer details`.
- Keep commits focused on a single change and mention user-visible behavior when relevant.
- PRs should include a clear summary, testing notes (commands run), and screenshots or recordings for UI changes. Link related issues when available.

## Configuration & Secrets
- Supabase clients read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from environment variables. Prefer `.env.local` for local development and keep secrets out of the repo.
