# KJTIMES_Front (광전타임즈)

Korean news website built with Next.js, featuring a modern newspaper-style design and comprehensive CMS admin system.

## Project Overview

KJTIMES_Front is a full-featured news publishing platform designed for Korean audiences. The site features a large newspaper-style layout inspired by major Korean news outlets like 조선일보 and 동아일보, with responsive design for desktop, tablet, and mobile devices.

### Key Features

- **Public News Site**: Homepage, category pages, article detail, search functionality
- **Reader Authentication**: Login/signup UI (placeholder for future backend integration)
- **Admin CMS**: Article management, media library, mail system, news feed integration
- **Responsive Design**: Mobile-first approach with Mantine UI components
- **Accessibility**: ARIA landmarks, keyboard navigation, skip links, screen reader support
- **Performance**: Next.js Image optimization, code splitting, SEO metadata
- **Testing**: Comprehensive E2E test suite with Playwright

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **UI Library**: Mantine UI 8
- **Database**: Supabase (PostgreSQL)
- **Testing**: Playwright
- **Styling**: Mantine + Tailwind CSS (hybrid approach)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun
- Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd KJTIMES_Front
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEWS_RECEIVE_SECRET=your_news_api_secret (optional)
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL`: Site URL (use `http://localhost:3000` for development)

**Optional Variables:**
- `NEWS_RECEIVE_SECRET`: Secret key for news API endpoint (if using news feed integration)

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx playwright test` - Run E2E tests
- `npx playwright test --ui` - Run tests in UI mode
- `npx playwright test --project=chromium` - Run tests on specific browser
- `npx playwright test --project=firefox` - Run tests on Firefox
- `npx playwright test --project=webkit` - Run tests on WebKit (Safari)

### Development Tips

- The app uses Next.js App Router - pages are in `app/` directory
- Hot reload is enabled - changes auto-update in the browser
- TypeScript errors will show in the terminal and browser
- Use `npm run build` to check for build errors before committing

## Testing

### E2E Tests with Playwright

The project includes comprehensive E2E tests covering all core user flows:

```bash
# Run all tests
npx playwright test

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run tests on specific browser
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Test Coverage

- **Homepage**: Load, sections, navigation, responsive behavior (12 tests)
- **Article Detail**: Content display, sidebar, breadcrumb, share buttons (9 tests)
- **Search**: Functionality, filters, sort, highlighting (11 tests)
- **Category Pages**: All 6 categories, filtering, sorting, pagination (18 tests)
- **Navigation**: Header/footer links, mobile drawer, skip link (18 tests)
- **Accessibility**: ARIA landmarks, heading hierarchy, keyboard nav (20 tests)
- **Admin**: Authentication, redirect protection, login form (12 tests)

**Total**: 100+ E2E tests

## Project Structure

```
KJTIMES_Front/
├── app/                    # Next.js App Router
│   ├── (main)/            # Public site pages
│   ├── admin/             # Admin CMS pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Header, Footer, DeviceLayout
│   ├── home/             # Homepage components
│   ├── shared/           # Shared components (ArticleCard, ArticleDetail)
│   ├── reader/           # Reader auth UI (LoginForm, SignupForm)
│   ├── category/         # Category page components
│   ├── search/           # Search page components
│   └── admin/            # Admin CMS components
├── lib/                   # Utility functions
│   └── api/              # Data access layer (Supabase queries)
├── e2e/                   # Playwright E2E tests
├── public/                # Static assets
├── types/                 # TypeScript type definitions
├── constants/             # Constants and configuration
├── theme.ts               # Mantine theme configuration
├── middleware.ts          # Next.js middleware (auth, device detection)
└── playwright.config.ts   # Playwright configuration
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - `NEWS_RECEIVE_SECRET` (if using news feed)
4. Deploy

### Build Verification

Before deploying, verify the build succeeds:

```bash
npm run build
```

The build should complete without errors. Check for:
- TypeScript compilation errors
- Missing environment variables
- Build warnings

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Project-Specific Resources

- [Mantine UI Documentation](https://mantine.dev/) - UI component library
- [Supabase Documentation](https://supabase.com/docs) - Database and authentication
- [Playwright Documentation](https://playwright.dev/) - E2E testing framework

## License

Copyright © 2026 광전타임즈 (KJTIMES). All rights reserved.
