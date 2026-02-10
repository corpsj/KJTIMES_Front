# CMS V2 Design Specification — 광전타임즈 편집국

> **Version**: 2.0.0  
> **Date**: 2026-02-11  
> **Author**: PM Agent (CMS Redesign)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Mantine 8.3, TipTap 3.19, Supabase, Tailwind CSS 4, @tabler/icons-react

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Layout Architecture](#2-layout-architecture)
3. [Page Specifications](#3-page-specifications)
4. [Component Breakdown](#4-component-breakdown)
5. [Implementation Plan](#5-implementation-plan)
6. [Migration Notes](#6-migration-notes)

---

## 1. Design System

### 1.1 Color Palette

All colors are defined via Mantine theme in `app/admin/theme.ts`. **No raw hex values in component code** — always reference theme tokens.

#### Sidebar (Dark)

| Token                   | Value      | Usage                        |
|------------------------|-----------|------------------------------|
| `sidebar.bg`           | `#1a1b1e` | Sidebar background           |
| `sidebar.bgHover`      | `#25262b` | Nav item hover state         |
| `sidebar.bgActive`     | `#2c2e33` | Active nav item background   |
| `sidebar.text`         | `#a1a1aa` | Default nav text             |
| `sidebar.textActive`   | `#ffffff` | Active nav text              |
| `sidebar.border`       | `#2c2e33` | Subtle borders/dividers      |
| `sidebar.accent`       | `#e03131` | Brand accent (광전 red)       |
| `sidebar.accentSubtle` | `rgba(224, 49, 49, 0.12)` | Accent background tint |

#### Content Area (Light)

| Token               | Value      | Usage                         |
|---------------------|-----------|-------------------------------|
| `content.bg`        | `#f8f9fa` | Main content background       |
| `content.surface`   | `#ffffff` | Card/panel backgrounds        |
| `content.text`      | `#1a1b1e` | Primary text                  |
| `content.textMuted` | `#868e96` | Secondary/meta text           |
| `content.border`    | `#dee2e6` | Card borders, dividers        |
| `content.borderLight`| `#e9ecef`| Subtle inner borders          |

#### Semantic Colors

| Token        | Value      | Usage                            |
|-------------|-----------|----------------------------------|
| `status.published`  | `#2b8a3e` | Published badge/dot     |
| `status.draft`      | `#868e96` | Draft badge             |
| `status.pending`    | `#e8590c` | Pending review badge    |
| `status.shared`     | `#1971c2` | Shared/special badge    |
| `status.scheduled`  | `#5c7cfa` | Scheduled badge         |
| `status.rejected`   | `#e03131` | Rejected/error badge    |
| `status.archived`   | `#495057` | Archived badge          |

### 1.2 Typography

#### UI Font Stack

```
"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, 
"Apple SD Gothic Neo", "Noto Sans KR", sans-serif
```

> **Decision**: Switch from Noto Sans KR to **Pretendard** for sharper UI rendering. Add Pretendard via `next/font/local` or CDN. Fallback to Noto Sans KR if Pretendard not available.

#### Display / Article Preview Font

```
"Noto Serif KR", Georgia, serif
```

Keep existing `Noto_Serif_KR` import for article content previews and hero titles.

#### Type Scale (applied via Mantine `fontSizes`)

| Token    | Size   | Usage                                   |
|----------|-------|-----------------------------------------|
| `xs`     | `11px` | Badges, meta labels, timestamps         |
| `sm`     | `13px` | Secondary text, table cells, nav items  |
| `md`     | `14px` | Body text, form labels                  |
| `lg`     | `16px` | Card titles, section headers            |
| `xl`     | `20px` | Page titles                             |
| `xxl`    | `28px` | Dashboard hero greeting                 |

#### Font Weights

| Name       | Weight | Usage                               |
|------------|--------|-------------------------------------|
| `regular`  | `400`  | Body text                           |
| `medium`   | `500`  | Form labels, secondary emphasis     |
| `semibold` | `600`  | Nav items, card titles, table heads |
| `bold`     | `700`  | Page titles, stat values            |

### 1.3 Spacing Scale

Use Mantine's default spacing scale. Key overrides:

| Token  | Value  | Usage                            |
|--------|--------|----------------------------------|
| `xs`   | `8px`  | Tight gaps (icon + label)        |
| `sm`   | `12px` | Inner card padding, small gaps   |
| `md`   | `16px` | Standard card padding            |
| `lg`   | `24px` | Section gaps, generous padding   |
| `xl`   | `32px` | Page-level spacing               |

### 1.4 Border Radius

| Token  | Value  | Usage                    |
|--------|--------|--------------------------|
| `xs`   | `4px`  | Badges, small chips      |
| `sm`   | `6px`  | Buttons, inputs          |
| `md`   | `8px`  | Cards, panels            |
| `lg`   | `12px` | Modals, large containers |
| `xl`   | `16px` | Special hero cards       |

> **Decision**: Move away from the current `999px` pill-shaped buttons. V2 uses modest `6px` border-radius for buttons and `8px` for cards — a cleaner, more professional look inspired by Linear/Ghost.

### 1.5 Shadows

| Token           | Value                                       | Usage            |
|-----------------|---------------------------------------------|------------------|
| `shadow.sm`     | `0 1px 2px rgba(0, 0, 0, 0.05)`            | Subtle cards     |
| `shadow.md`     | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)` | Default cards |
| `shadow.lg`     | `0 4px 12px rgba(0, 0, 0, 0.08)`           | Elevated modals  |
| `shadow.sidebar`| `4px 0 12px rgba(0, 0, 0, 0.08)`           | Sidebar right edge |

### 1.6 Component Tokens (Mantine Theme Overrides)

Defined in `app/admin/theme.ts`:

```typescript
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom brand red for Mantine color array
const kjRed: MantineColorsTuple = [
  '#fff0f0', '#ffe0e0', '#ffc7c7', '#ffa3a3',
  '#ff7b7b', '#ff4d4d', '#e03131', '#c92a2a',
  '#b02525', '#962020',
];

export const adminTheme = createTheme({
  primaryColor: 'kjRed',
  colors: { kjRed },
  fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
  headings: {
    fontFamily: '"Pretendard Variable", "Pretendard", sans-serif',
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
  components: {
    Button: {
      defaultProps: { radius: 'sm' },
    },
    Paper: {
      defaultProps: { radius: 'md', shadow: 'sm' },
    },
    TextInput: {
      defaultProps: { radius: 'sm' },
    },
    Select: {
      defaultProps: { radius: 'sm' },
    },
    Badge: {
      defaultProps: { radius: 'xs', variant: 'light' },
    },
    Modal: {
      defaultProps: { radius: 'lg' },
    },
  },
});
```

### 1.7 Animation & Transitions

| Property          | Value                    | Usage                        |
|-------------------|--------------------------|------------------------------|
| `transition.fast` | `150ms ease`             | Button hover, badge color    |
| `transition.base` | `200ms ease`             | Card hover, sidebar toggle   |
| `transition.slow` | `300ms ease-out`         | Modal enter, panel slide     |

**Rules**:
- All hover transforms removed (no `translateY(-2px)` on every card — too distracting)
- Subtle opacity/background-color transitions only
- Respect `prefers-reduced-motion`

---

## 2. Layout Architecture

### 2.1 Overall Structure

```
┌──────────┬──────────────────────────────────────────┐
│          │  AdminHeader (breadcrumb + page title)    │
│  Admin   ├──────────────────────────────────────────┤
│  Sidebar │                                          │
│  (240px) │  Page Content                            │
│          │  (scrollable)                            │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 2.2 AdminShell Component

The `AdminShell` wraps every admin page (except login). It renders:

1. **AdminSidebar** — fixed left
2. **Main content area** — `<main>` element with internal scroll
3. **AdminHeader** — sticky top within the content area

```
File: components/admin/layout/AdminShell.tsx
```

**Props**: `children: React.ReactNode`

**CSS Modules file**: `AdminShell.module.css`

**Layout CSS**:
```css
.shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--content-bg, #f8f9fa);
}

.main {
  flex: 1;
  min-width: 0; /* prevent flex overflow */
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px 32px 40px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
```

### 2.3 AdminSidebar

```
File: components/admin/layout/AdminSidebar.tsx
CSS: AdminSidebar.module.css
```

**Width**: `240px` expanded / `64px` collapsed

**Structure (top to bottom)**:

1. **Logo area** (height: `64px`)
   - Expanded: Brand logo image (`KJ_sloganLogo.png` or simplified icon + "광전타임즈")
   - Collapsed: Small icon mark only
   - Click → navigate to `/admin`

2. **Navigation** (flex-grow, scrollable if needed)
   ```
   대시보드       — IconLayoutDashboard
   기사 데스크     — IconArticle
   기사 작성       — IconPencilPlus
   미디어          — IconPhoto
   뉴스 피드       — IconRss
   ```
   - Each item: icon (20px) + label + optional count badge
   - Active state: background `sidebar.bgActive`, text `sidebar.textActive`, left accent bar (3px `sidebar.accent`)
   - Hover state: background `sidebar.bgHover`

3. **Divider** (`1px solid sidebar.border`)

4. **Quick Action Button**
   - "새 기사 작성" button — full-width, accent color
   - Collapsed: just the `+` icon

5. **Bottom section** (pinned to bottom)
   - External link: "사이트 보기" → opens `/` in new tab
   - User info block:
     - Avatar circle (initials-based)
     - User name + role label
     - Logout button (icon only)
   - Collapse toggle button (chevron icon)

**Responsive Behavior**:
- `≥1024px`: Sidebar always visible, user can collapse/expand
- `768px – 1023px`: Sidebar collapsed by default (icon-only), expandable via toggle
- `<768px`: Sidebar hidden, accessible via hamburger menu in AdminHeader (slides in as overlay)

**State Management**: Sidebar collapsed state stored in `localStorage` key `admin-sidebar-collapsed`.

### 2.4 AdminHeader

```
File: components/admin/layout/AdminHeader.tsx
CSS: AdminHeader.module.css
```

**Height**: `56px`  
**Position**: `sticky; top: 0; z-index: 10`  
**Background**: `white` with `border-bottom: 1px solid content.border`

**Structure (left to right)**:

1. **Mobile hamburger** (hidden on desktop)
2. **Breadcrumb**: `홈 / {section}` — uses Mantine `Breadcrumbs`
3. **Page title** (optional — can be set by page)
4. **Right actions**:
   - Today's date (small text)
   - Notification indicator (future — just a placeholder dot for now)

**Props**:
```typescript
interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode; // Slot for page-specific action buttons
}
```

---

## 3. Page Specifications

### 3.1 Login Page (`/admin/login`)

**Layout**: Standalone (no sidebar/header). Full-viewport centered.

**Design**:
```
┌────────────────────────────────────────────┐
│                                            │
│            [Brand Logo]                    │
│         광전타임즈 편집국                     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │         편집국 로그인                  │  │
│  │                                      │  │
│  │  아이디                               │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │ admin                        │    │  │
│  │  └──────────────────────────────┘    │  │
│  │                                      │  │
│  │  비밀번호                             │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │ ••••••••                     │    │  │
│  │  └──────────────────────────────┘    │  │
│  │                                      │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │         로그인                │    │  │
│  │  └──────────────────────────────┘    │  │
│  │                                      │  │
│  │  보안 접속: 모든 세션은 암호화됩니다.   │  │
│  └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

**Details**:
- Background: `#f8f9fa` with subtle gradient or pattern (very understated)
- Card: `max-width: 400px`, centered vertically and horizontally
- Logo above the card, outside it
- Use Mantine `Paper` with `shadow="md"`, `p="xl"`, `radius="lg"`
- Use Mantine `TextInput` for inputs (not raw `<input>`)
- Use Mantine `Button` with `fullWidth`, `color="dark"` for submit
- Error state: Mantine `Alert` with `color="red"` (existing pattern but Mantine-ified)
- Remove signup link (admin accounts are provisioned, not self-registered)
- Remove existing `login.css` — all styles via Mantine + CSS module

**Keep from v1**: Auth logic (supabase signInWithPassword with email format `${id}@kwangjeon.local`)

### 3.2 Dashboard Page (`/admin`)

**Header**: title = "대시보드", breadcrumbs = `[{ label: "홈" }]`

**Structure**:

```
┌─────────────────────────────────────────────────────────┐
│  환영합니다, {userName}님              2026년 2월 11일 화요일  │
│  오늘의 편집 현황을 확인하세요.                              │
└─────────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 전체 기사  │ │ 게시      │ │ 작성      │ │ 승인 대기  │
│ 2,481    │ │ 1,892    │ │ 342      │ │ 12       │
│          │ │ ↑3 today │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌───────────────────────────────┐ ┌─────────────────────┐
│  최근 기사                     │ │  빠른 작업            │
│                               │ │                     │
│  [article list - 5 items]     │ │  ✍️ 새 기사 작성      │
│  title · status · timestamp   │ │  📋 기사 데스크       │
│  ...                          │ │  🖼️ 미디어           │
│                               │ │  📡 뉴스 피드        │
│  전체 보기 →                   │ │                     │
└───────────────────────────────┘ └─────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  오늘의 기사: 7건  (어제보다 3건 증가 ↑)                     │
└─────────────────────────────────────────────────────────┘
```

**Components used**:
- `StatsRow` — 4 stat cards in a row using `SimpleGrid cols={4}`
- `RecentArticles` — Latest 5 articles in a list
- `QuickActions` — Grid of link cards

**Stat Card (`StatCard`) Design**:
- Mantine `Paper` with `withBorder`
- Left colored accent bar (`4px` left border)
- Label (xs, uppercase, muted) + Value (xl, bold) + optional delta text (xs)
- Each card has a `color` prop for the accent bar

**Recent Articles section**:
- Mantine `Paper` wrapper
- List of items: title (link to write page) + status badge + timestamp
- "전체 보기 →" link at bottom

**Quick Actions section**:
- Grid of `UnstyledButton` cards with icon + title + subtitle
- Hover: subtle background darken

**Data fetching**: Keep existing Supabase queries from `page.tsx`. Refactor into dedicated component files.

### 3.3 Articles Desk Page (`/admin/articles`)

**Header**: title = "기사 데스크", breadcrumbs = `[{ label: "홈", href: "/admin" }, { label: "기사 데스크" }]`  
**Header actions slot**: `<Button>새 기사 작성</Button>` (links to `/admin/write`)

This is the most complex page. It has two view modes.

#### 3.3.1 View Toggle

Top-right of the page (below header): segmented control to switch between:
- **목록 (List)** — Table view (default)
- **보드 (Board)** — Kanban-style board

Store preference in `localStorage` key `admin-articles-view`.

#### 3.3.2 Stats Row

Same 4-stat row as dashboard but specific to articles. Uses `StatsRow` component. Always visible regardless of view mode.

#### 3.3.3 Filter Bar (`ArticleFilters`)

Located between stats and the view content.

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 [Search input............]  상태:[전체 ▾]  정렬:[최신순 ▾] │
│                                                   [초기화]   │
└──────────────────────────────────────────────────────────────┘
```

**Filters**:
- **Search** — `TextInput` with `IconSearch` left section. Triggers on Enter.
- **Status** — `Select` with options: 전체, 게시, 공유, 승인 대기, 작성, 예약, 반려, 보관
- **Sort** — `Select`: 최신순, 오래된순
- **Reset button** — Ghost button, appears only when filters are active

#### 3.3.4 List View (`ArticleTable`)

A clean, professional table using Mantine `Table` component.

**Table Columns**:
| Column    | Width   | Content                                    |
|-----------|---------|--------------------------------------------|
| Checkbox  | `40px`  | Selection checkbox                         |
| 제목      | flex    | Title (link) + special issue indicator     |
| 상태      | `100px` | `StatusBadge` component                    |
| 카테고리   | `100px` | Category name text                         |
| 수정일    | `140px` | Formatted date                              |
| 조회수    | `80px`  | Number                                      |
| 작업      | `200px` | Action buttons                              |

**Table Header**: Sticky. Gray-100 background.

**Row Hover**: Very subtle blue tint (`#f8f9ff`)

**Batch Operations Bar**:
- Appears below table header when items are selected
- Shows: "선택 {n}건" + status change dropdown + Apply button + Delete button
- Uses Mantine `Group` with `Paper` wrapper, subtle background

**Pagination**:
- Bottom of table. "← 이전 | 페이지 N / M | 다음 →"
- Use Mantine `Pagination` component instead of custom buttons

**Action Buttons per row**:
- 편집 (link to write page)
- 공유 (if applicable)
- 복제
- Status `Select` dropdown (inline)
- 삭제 (red, opens `ConfirmModal`)

**Delete Confirmation**: Use shared `ConfirmModal` component (Mantine `Modal`).

#### 3.3.5 Board View (`ArticleKanban`)

Kanban board with 4 columns:

| Column        | Filter                          |
|---------------|--------------------------------|
| 작성 (Draft)   | `status = "draft"`            |
| 승인 대기      | `status = "pending_review"`    |
| 게시           | `status = "published"`         |
| 보관           | `status = "archived"`          |

**Each column**:
- Header: column title + count badge
- Scrollable card list
- Each card is an `ArticleCard` component

**`ArticleCard`**:
- Title (truncated at 2 lines)
- Category badge
- Timestamp
- Click → navigates to `/admin/write?id={id}`

**Drag & Drop**: NOT in v2.0. Just display-only for now. Future enhancement.

**Data**: Same query as list view but grouped client-side by status.

### 3.4 Write/Edit Page (`/admin/write`)

**Header**: title = "기사 작성" or "기사 수정", breadcrumbs = `[{ label: "홈", href: "/admin" }, { label: "기사 데스크", href: "/admin/articles" }, { label: isEditing ? "수정" : "작성" }]`

This page has two modes controlled by a toggle:
- **Standard mode** (default) — Sidebar with editor
- **Focus mode** — Full-width editor, sidebar collapsed

#### 3.4.1 Standard Mode Layout

```
┌────────────────────────────────────────────────────┐
│  Sticky Action Bar                                  │
│  [← 돌아가기]  기사 작성  [미리보기] [저장] [발행]    │
│  Auto-save indicator: "자동 저장됨" / "변경사항 있음"   │
└────────────────────────────────────────────────────┘

┌──────────────────────────────┐ ┌──────────────────┐
│                              │ │  PublishSidebar   │
│  Title Input (large)         │ │                  │
│  Subtitle Input              │ │  [발행 설정]      │
│                              │ │  카테고리 선택     │
│  ┌──────────────────────┐   │ │  슬러그           │
│  │  EditorToolbar       │   │ │  태그 입력         │
│  ├──────────────────────┤   │ │                  │
│  │                      │   │ │  [대표 이미지]     │
│  │  RichTextEditor      │   │ │  이미지 미리보기    │
│  │  (TipTap content)    │   │ │  [본문에서 선택]    │
│  │                      │   │ │  [직접 업로드]     │
│  │                      │   │ │                  │
│  └──────────────────────┘   │ │  [SEO] (collapse) │
│                              │ │  제목 / 설명 /키워드│
│  ┌──────────────────────┐   │ │                  │
│  │ 글자 수: 2,341 | 읽기 3분│   │ │                  │
│  └──────────────────────┘   │ │                  │
│                              │ │                  │
└──────────────────────────────┘ └──────────────────┘
```

**Grid**: `Grid` with `span={{ base: 12, lg: 8 }}` for editor and `span={{ base: 12, lg: 4 }}` for sidebar. Same as current but cleaner styling.

#### 3.4.2 Focus Mode

When toggled:
- Sidebar panel hides (Grid changes to single column)
- Action bar simplifies (only save + auto-save indicator)
- Editor goes full width, max-width constrained to `800px` for readability
- Background becomes pure white
- Toggle via button in action bar or keyboard shortcut `Ctrl/Cmd + \`

#### 3.4.3 Sticky Action Bar

Replaces current floating toolbar.

```
File: (embedded in write/page.tsx or extracted as EditorActionBar)
```

**Position**: `position: sticky; top: 0; z-index: 10`  
**Background**: White with border-bottom  
**Height**: `56px`

**Left side**:
- Back arrow → `/admin/articles`
- "기사 작성" / "기사 수정" label

**Center**:
- Auto-save status indicator
  - 💾 "변경사항 없음" (dimmed, when `dirty = false`)
  - 🟡 "저장되지 않은 변경사항" (orange, when `dirty = true`)
  - 🔄 "자동 저장 중..." (blue, when `autoSaveStatus = 'saving'`)
  - ✅ "자동 저장됨" (green, fades after 3s)

**Right side**:
- Focus mode toggle (icon button)
- 미리보기 button (variant="default")
- 임시저장 button (variant="default")
- 승인 요청 button (variant="light", color="orange")
- 공유 발행 button (variant="light", color="dark") — for special issue category
- 발행 button (variant="filled", color="blue")

#### 3.4.4 Editor Area

- **Title input**: Large, unstyled `TextInput` (font-size `2rem`, font-weight `800`)
- **Subtitle input**: `Textarea`, muted color (font-size `1.2rem`)
- **RichTextEditor**: Existing TipTap component (keep as-is, enhance toolbar extraction)
- **Footer bar**: Character count, word count, reading time — in a subtle bar below the editor

#### 3.4.5 Publish Sidebar (`PublishSidebar`)

```
File: components/admin/editor/PublishSidebar.tsx
```

A sticky sidebar with collapsible sections using Mantine `Accordion` (or `Paper` sections with `Collapse`).

**Sections** (each in its own `Paper`):

1. **발행 설정** (default open)
   - Category `Select` (searchable)
   - Slug display + regenerate button
   - Tag `TagsInput`
   - Special issue link copy button (conditional)

2. **대표 이미지** (default open)
   - Thumbnail preview (if set)
   - "본문에서 선택" button → opens `ThumbnailPicker` modal
   - "직접 업로드" `FileButton`
   - "제거" button (if thumbnail exists)

3. **SEO** (default collapsed)
   - SEO title `TextInput`
   - Meta description `Textarea`
   - Keywords `TextInput`
   - "자동 채우기" button

Each section: gray header with icon + title, white body content.

#### 3.4.6 Preview Modal

Keep current Mantine `Modal` for preview. Polish the styling:
- Article rendered with serif font
- Category badge at top
- Title + subtitle + estimated read time
- Content rendered via `dangerouslySetInnerHTML`

#### 3.4.7 ThumbnailPicker

```
File: components/admin/editor/ThumbnailPicker.tsx
```

Mantine `Modal` showing a grid of images extracted from article content.
- `SimpleGrid cols={3}`
- Each image clickable, highlighted with blue border when selected
- Click selects and closes modal
- "이미지가 없습니다" empty state if no images in content

### 3.5 Media Library Page (`/admin/media`)

**Header**: title = "미디어 라이브러리", breadcrumbs = `[{ label: "홈", href: "/admin" }, { label: "미디어" }]`  
**Header actions**: View toggle (Grid/List) + Upload button

#### 3.5.1 Top Section

```
┌─────────────────────────────────────────────────────────┐
│  Drop Zone                                               │
│  📤 이미지를 드래그하여 업로드 (또는 클릭하여 파일 선택)      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🔍 [Search by filename..........]                       │
└─────────────────────────────────────────────────────────┘
```

**Upload progress**: Upload progress bars shown below dropzone during upload.

#### 3.5.2 Grid View (`MediaGrid`)

Default view. Uses Mantine `SimpleGrid`:

```
cols={{ base: 2, xs: 3, md: 4, lg: 5 }}
```

**Each card** (`Card` component):
- `AspectRatio ratio={1}` for square thumbnails
- Image with `object-fit: cover`
- Filename (truncated)
- File size + date
- Selection checkbox (top-left corner, visible on hover)

**Click on image** → opens `MediaDetailPanel` (slide-in from right)

#### 3.5.3 List View

Simple table:
| Thumbnail (60px) | Filename | Size | Upload Date | Actions |

#### 3.5.4 MediaDetailPanel (Slide-in Drawer)

```
File: components/admin/media/MediaDetailPanel.tsx
```

Uses Mantine `Drawer` positioned at `right`, width `400px`.

**Content**:
- Large image preview
- Filename (editable in future)
- URL (copy button)
- File size
- Upload date
- Alt text (editable in future)
- Delete button (with confirmation)

#### 3.5.5 Bulk Operations

- When images are selected (via checkboxes), a floating bar appears at bottom:
  - "선택 {n}개" + "일괄 삭제" button
- Select all: checkbox in grid header area

#### 3.5.6 Storage Usage

At top of page (or in sidebar): simple indicator showing total storage used.
- Query: aggregate `file_size` from media table
- Display: `{used} / {limit}` with progress bar
- For v2.0: hardcode limit display as informational (e.g., "1.2 GB 사용 중")

### 3.6 News Feed Page (`/admin/news-feed`)

**Header**: title = "뉴스 피드", breadcrumbs = `[{ label: "홈", href: "/admin" }, { label: "뉴스 피드" }]`

**Minimal changes** — this page already works well. Polish to match new design system:

1. Replace custom CSS tab buttons with Mantine `SegmentedControl` or `Tabs`
2. Replace custom `.nf-input` with Mantine `TextInput` / `Select` / `DateInput`
3. Replace custom `.nf-modal-overlay` with Mantine `Modal`
4. Replace custom chip buttons with Mantine `Chip` / `Chip.Group`
5. Replace custom toast with Mantine `notifications` (from `@mantine/notifications`)
6. Replace `admin2-panel`, `admin2-queue-item` wrappers with Mantine `Paper` and styled list items
7. Keep all business logic unchanged

**Subscription modal** → Mantine `Modal` with Mantine form components inside.

---

## 4. Component Breakdown

### 4.1 Layout Components

#### `AdminShell` — `components/admin/layout/AdminShell.tsx`

```typescript
// Wraps sidebar + header + content area
// Manages sidebar collapsed state
// Handles mobile drawer

interface AdminShellProps {
  children: React.ReactNode;
}

// Internal state:
// - sidebarCollapsed: boolean (from localStorage)
// - mobileDrawerOpen: boolean
```

**Behavior**:
- Reads `admin-sidebar-collapsed` from `localStorage` on mount
- Provides context for sidebar state to children (optional, via React context)
- On mobile (`<768px`), sidebar is a `Drawer` component from Mantine

#### `AdminSidebar` — `components/admin/layout/AdminSidebar.tsx`

```typescript
interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; role: string; initial: string } | null;
  onLogout: () => void;
}
```

**Nav items** (hardcoded array):
```typescript
const navItems = [
  { href: '/admin', label: '대시보드', icon: IconLayoutDashboard },
  { href: '/admin/articles', label: '기사 데스크', icon: IconArticle },
  { href: '/admin/write', label: '기사 작성', icon: IconPencilPlus },
  { href: '/admin/media', label: '미디어', icon: IconPhoto },
  { href: '/admin/news-feed', label: '뉴스 피드', icon: IconRss },
];
```

**Active detection**: `pathname === item.href` (exact match) or `pathname.startsWith(item.href)` for nested routes. Special case: `/admin` should only match exactly.

#### `AdminHeader` — `components/admin/layout/AdminHeader.tsx`

```typescript
interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  onMenuClick?: () => void; // Mobile hamburger
}
```

Uses Mantine `Breadcrumbs`, `Text`, `Group`.

### 4.2 Shared Components

#### `StatCard` — `components/admin/shared/StatCard.tsx`

```typescript
interface StatCardProps {
  label: string;           // "전체 기사"
  value: string | number;  // "2,481"
  color: string;           // Mantine color: "dark", "green", "blue", "orange"
  delta?: string;          // "↑3 today" (optional)
  loading?: boolean;       // Show skeleton
}
```

Renders: Mantine `Paper` with colored left border (via `style={{ borderLeft: '4px solid var(--mantine-color-{color}-6)' }}`).

#### `StatusBadge` — `components/admin/shared/StatusBadge.tsx`

```typescript
interface StatusBadgeProps {
  status: string; // 'published' | 'draft' | 'pending_review' | etc.
}
```

Maps status to Mantine `Badge` with appropriate color:
```typescript
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published:      { label: '게시',     color: 'green' },
  shared:         { label: '공유',     color: 'blue' },
  pending_review: { label: '승인 대기', color: 'orange' },
  draft:          { label: '작성',     color: 'gray' },
  scheduled:      { label: '예약',     color: 'indigo' },
  rejected:       { label: '반려',     color: 'red' },
  archived:       { label: '보관',     color: 'gray' },
};
```

#### `EmptyState` — `components/admin/shared/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;  // Tabler icon
  title: string;           // "기사가 없습니다"
  description?: string;    // "새 기사를 작성해 보세요"
  action?: React.ReactNode; // Optional CTA button
}
```

Centered layout with large icon (48px), title, description, and optional button.

#### `ConfirmModal` — `components/admin/shared/ConfirmModal.tsx`

```typescript
interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;    // Default: "확인"
  cancelLabel?: string;     // Default: "취소"
  confirmColor?: string;    // Default: "red"
  loading?: boolean;
}
```

Uses Mantine `Modal` with:
- Icon (warning/danger)
- Title and message
- Cancel + Confirm buttons

Replaces `window.confirm()` and the custom delete modal from articles page.

#### `Toast` (Notification System)

**Decision**: Use `@mantine/notifications` package. No custom Toast component needed.

Setup in `app/admin/layout.tsx`:
```typescript
import { Notifications } from '@mantine/notifications';

// Inside MantineProvider:
<Notifications position="bottom-right" />
```

Usage throughout:
```typescript
import { notifications } from '@mantine/notifications';

notifications.show({
  title: '저장 완료',
  message: '기사가 임시저장되었습니다.',
  color: 'green',
});
```

Replaces all `alert()`, `window.confirm()`, and custom toast implementations.

### 4.3 Article Components

#### `ArticleTable` — `components/admin/articles/ArticleTable.tsx`

```typescript
interface ArticleTableProps {
  articles: ArticleRow[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onStatusChange: (article: ArticleRow, status: string) => void;
  onDelete: (article: ArticleRow) => void;
  onClone: (article: ArticleRow) => void;
  actionLoadingId: string | null;
}
```

Uses Mantine `Table` with `Table.ScrollContainer` for horizontal scroll.

#### `ArticleKanban` — `components/admin/articles/ArticleKanban.tsx`

```typescript
interface ArticleKanbanProps {
  articles: ArticleRow[];
  loading: boolean;
}
```

Renders 4 columns in a `SimpleGrid cols={4}`. Each column is a `Paper` with a list of `ArticleCard` components. Columns stack to 2 on tablet, 1 on mobile.

#### `ArticleCard` — `components/admin/articles/ArticleCard.tsx`

```typescript
interface ArticleCardProps {
  article: ArticleRow;
  onClick?: () => void;
}
```

Small card for kanban view:
- Title (2-line clamp)
- Category + status badges
- Timestamp
- Click navigates to edit page

#### `ArticleFilters` — `components/admin/articles/ArticleFilters.tsx`

```typescript
interface ArticleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortFilter: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}
```

### 4.4 Editor Components

#### `RichTextEditor` — `components/admin/editor/RichTextEditor.tsx`

**Keep existing** with minor enhancements:
- Clean up inline styles in toolbar → use CSS module
- Ensure toolbar properly separates visual groups
- No functional changes to TipTap setup

#### `FigureImage` — `components/admin/editor/FigureImage.tsx`

**Keep as-is.** Already well-implemented.

#### `EditorToolbar` — `components/admin/editor/EditorToolbar.tsx`

**Optional extraction**: If the toolbar becomes complex, extract it from `RichTextEditor`. For v2.0, keep it inline within `RichTextEditor` — extracting purely for file size reasons isn't worth the prop-drilling complexity.

**Decision**: Do NOT extract toolbar separately. Keep within `RichTextEditor`.

#### `ThumbnailPicker` — `components/admin/editor/ThumbnailPicker.tsx`

Already described in section 3.4.7. Extract from current inline code in `write/page.tsx`.

```typescript
interface ThumbnailPickerProps {
  opened: boolean;
  onClose: () => void;
  imageUrls: string[];
  currentThumbnail: string | null;
  onSelect: (url: string) => void;
}
```

#### `PublishSidebar` — `components/admin/editor/PublishSidebar.tsx`

Already described in section 3.4.5. Extract from current inline code in `write/page.tsx`.

```typescript
interface PublishSidebarProps {
  // Publishing settings
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  categories: CategoryOption[];
  slug: string;
  onRegenerateSlug: () => void;
  slugLoading: boolean;
  tags: string[];
  onTagsChange: (values: string[]) => void;
  tagOptions: string[];
  
  // Special issue
  isSpecialIssue: boolean;
  canCopyLink: boolean;
  onCopyLink: () => void;
  
  // Thumbnail
  thumbnailUrl: string | null;
  onThumbnailChange: (url: string | null) => void;
  contentImageUrls: string[];
  onImageUpload: (file: File) => Promise<string>;
  
  // SEO
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  keywords: string;
  onKeywordsChange: (value: string) => void;
  onAutoFillSeo: () => void;
  
  // State
  loading: boolean;
}
```

### 4.5 Media Components

#### `MediaGrid` — `components/admin/media/MediaGrid.tsx`

```typescript
interface MediaGridProps {
  items: MediaItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onItemClick: (item: MediaItem) => void;
  loading: boolean;
}
```

Uses Mantine `SimpleGrid` with `Card` items. Selection checkboxes appear on hover.

#### `MediaDropzone` — `components/admin/media/MediaDropzone.tsx`

```typescript
interface MediaDropzoneProps {
  onUpload: (files: File[]) => void;
  uploading: boolean;
  uploadProgress: UploadingFile[];
}
```

Uses Mantine `Paper` with drag-and-drop event handlers. Shows upload progress indicators.

Consider using `@mantine/dropzone` if available, otherwise keep custom implementation.

#### `MediaDetailPanel` — `components/admin/media/MediaDetailPanel.tsx`

```typescript
interface MediaDetailPanelProps {
  item: MediaItem | null;
  opened: boolean;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onDelete: (item: MediaItem) => void;
  deleteLoading: boolean;
}
```

Uses Mantine `Drawer` component.

### 4.6 Dashboard Components

#### `StatsRow` — `components/admin/dashboard/StatsRow.tsx`

```typescript
interface StatsRowProps {
  stats: Array<{
    label: string;
    value: string | number;
    color: string;
    delta?: string;
  }>;
  loading: boolean;
  cols?: number; // Default: 4
}
```

Renders a `SimpleGrid` of `StatCard` components. When `loading=true`, renders Mantine `Skeleton` in each card.

#### `RecentArticles` — `components/admin/dashboard/RecentArticles.tsx`

```typescript
interface RecentArticlesProps {
  articles: RecentArticle[];
  loading: boolean;
}
```

List of recent articles with title, status badge, and timestamp.

#### `QuickActions` — `components/admin/dashboard/QuickActions.tsx`

```typescript
interface QuickActionsProps {
  items: Array<{
    href: string;
    icon: string; // emoji
    title: string;
    description: string;
  }>;
}
```

Grid of link cards for quick navigation.

---

## 5. Implementation Plan

### Pre-requisites (Before Both Tracks)

| #  | Task                                        | Est.   |
|----|---------------------------------------------|--------|
| P1 | Install `@mantine/notifications`            | 5 min  |
| P2 | Create `app/admin/theme.ts` with full theme | 30 min |
| P3 | Add Pretendard font (next/font or CDN)      | 15 min |
| P4 | Create shared types file `types/admin.ts`   | 15 min |

### Track A: Layout Shell, Dashboard, Login, Shared Components

Track A establishes the foundation that Track B depends on.

| #  | Task                                                  | Files                                                | Dependencies | Est.    |
|----|-------------------------------------------------------|------------------------------------------------------|-------------|---------|
| A1 | Build `AdminSidebar` component + CSS module           | `components/admin/layout/AdminSidebar.tsx`, `.module.css` | P2       | 2 hr    |
| A2 | Build `AdminHeader` component + CSS module            | `components/admin/layout/AdminHeader.tsx`, `.module.css`  | P2       | 1 hr    |
| A3 | Build `AdminShell` (sidebar + header + content layout)| `components/admin/layout/AdminShell.tsx`, `.module.css`   | A1, A2   | 1.5 hr  |
| A4 | Build shared `StatCard` component                     | `components/admin/shared/StatCard.tsx`                    | P2       | 30 min  |
| A5 | Build shared `StatusBadge` component                  | `components/admin/shared/StatusBadge.tsx`                 | P2       | 20 min  |
| A6 | Build shared `EmptyState` component                   | `components/admin/shared/EmptyState.tsx`                  | P2       | 20 min  |
| A7 | Build shared `ConfirmModal` component                 | `components/admin/shared/ConfirmModal.tsx`                | P2       | 20 min  |
| A8 | Set up Mantine Notifications in layout                | `app/admin/layout.tsx`                                   | P1       | 15 min  |
| A9 | Rewrite `app/admin/layout.tsx` to use `AdminShell`    | `app/admin/layout.tsx`                                   | A3, A8   | 1 hr    |
| A10| Build dashboard components (`StatsRow`, `RecentArticles`, `QuickActions`) | `components/admin/dashboard/*`         | A4, A5   | 1.5 hr  |
| A11| Rewrite `app/admin/page.tsx` (Dashboard)              | `app/admin/page.tsx`                                     | A9, A10  | 1 hr    |
| A12| Rewrite `app/admin/login/page.tsx`                    | `app/admin/login/page.tsx`                               | P2       | 1 hr    |
| A13| Delete `app/admin/login/login.css`                    | (delete file)                                            | A12      | 1 min   |
| A14| Visual QA + responsive testing for layout/dashboard   |                                                          | A11, A12 | 1 hr    |

**Track A Total**: ~10.5 hours

### Track B: Articles Desk, Editor, Media Library, News Feed

Track B can begin in parallel from B1-B4 but must integrate with Track A's layout once A9 is complete.

| #  | Task                                                  | Files                                                | Dependencies | Est.    |
|----|-------------------------------------------------------|------------------------------------------------------|-------------|---------|
| B1 | Build `ArticleFilters` component                      | `components/admin/articles/ArticleFilters.tsx`            | P2       | 45 min  |
| B2 | Build `ArticleTable` component                        | `components/admin/articles/ArticleTable.tsx`              | A5, A7   | 2 hr    |
| B3 | Build `ArticleCard` component                         | `components/admin/articles/ArticleCard.tsx`               | A5       | 30 min  |
| B4 | Build `ArticleKanban` component                       | `components/admin/articles/ArticleKanban.tsx`             | B3       | 1.5 hr  |
| B5 | Rewrite `app/admin/articles/page.tsx`                 | `app/admin/articles/page.tsx`                            | A9, B1-B4| 2.5 hr  |
| B6 | Extract `PublishSidebar` component                    | `components/admin/editor/PublishSidebar.tsx`              | P2       | 1.5 hr  |
| B7 | Extract `ThumbnailPicker` component                   | `components/admin/editor/ThumbnailPicker.tsx`            | P2       | 30 min  |
| B8 | Rewrite `app/admin/write/page.tsx` (styling + extraction) | `app/admin/write/page.tsx`                          | A9, B6, B7| 3 hr   |
| B9 | Add focus mode to write page                          | `app/admin/write/page.tsx`                               | B8       | 1 hr    |
| B10| Build `MediaGrid` component                           | `components/admin/media/MediaGrid.tsx`                   | P2       | 1 hr    |
| B11| Build `MediaDropzone` component                       | `components/admin/media/MediaDropzone.tsx`                | P2       | 45 min  |
| B12| Build `MediaDetailPanel` (Drawer)                     | `components/admin/media/MediaDetailPanel.tsx`             | P2       | 1 hr    |
| B13| Rewrite `app/admin/media/page.tsx`                    | `app/admin/media/page.tsx`                               | A9, B10-B12| 2 hr  |
| B14| Polish `app/admin/news-feed/page.tsx`                 | `app/admin/news-feed/page.tsx`                           | A9       | 2 hr    |
| B15| Visual QA + responsive testing for all Track B pages  |                                                          | B5-B14   | 2 hr    |

**Track B Total**: ~19 hours

### Final Steps (After Both Tracks)

| #  | Task                                           | Dependencies    | Est.    |
|----|------------------------------------------------|----------------|---------|
| F1 | Delete `app/admin/admin2.css`                  | All A + B done  | 1 min   |
| F2 | Remove `admin2.css` import from layout         | F1              | 1 min   |
| F3 | Remove Noto_Serif_KR variable class from layout| A9              | 1 min   |
| F4 | Sweep: remove all `admin2-*` CSS class references | All          | 30 min  |
| F5 | Full integration test                          | F1-F4           | 2 hr    |
| F6 | Cross-browser test (Chrome, Safari, Firefox)   | F5              | 1 hr    |
| F7 | Accessibility audit (keyboard nav, aria labels)| F5              | 1 hr    |

---

## 6. Migration Notes

### 6.1 Files to KEEP (with modifications)

| File                              | Action                                    |
|-----------------------------------|-------------------------------------------|
| `app/admin/layout.tsx`            | **Rewrite** — new shell layout            |
| `app/admin/page.tsx`              | **Rewrite** — new dashboard               |
| `app/admin/articles/page.tsx`     | **Rewrite** — uses new components         |
| `app/admin/write/page.tsx`        | **Refactor** — extract sidebar, polish UI |
| `app/admin/media/page.tsx`        | **Rewrite** — uses new components         |
| `app/admin/login/page.tsx`        | **Rewrite** — Mantine-based               |
| `app/admin/news-feed/page.tsx`    | **Polish** — replace CSS classes only     |
| `components/admin/RichTextEditor.tsx` | **Keep mostly** — minor style cleanup |
| `components/admin/FigureImage.tsx`| **Keep as-is**                            |

### 6.2 Files to DELETE

| File                        | Reason                                    |
|-----------------------------|-------------------------------------------|
| `app/admin/admin2.css`      | Replaced by Mantine theme + CSS modules   |
| `app/admin/login/login.css` | Replaced by Mantine components            |

### 6.3 Files to CREATE

| File                                              | Purpose                    |
|---------------------------------------------------|----------------------------|
| `app/admin/theme.ts`                              | Mantine theme config       |
| `components/admin/layout/AdminShell.tsx`           | Layout wrapper             |
| `components/admin/layout/AdminShell.module.css`    | Layout styles              |
| `components/admin/layout/AdminSidebar.tsx`         | Sidebar nav                |
| `components/admin/layout/AdminSidebar.module.css`  | Sidebar styles             |
| `components/admin/layout/AdminHeader.tsx`          | Page header                |
| `components/admin/layout/AdminHeader.module.css`   | Header styles              |
| `components/admin/shared/StatCard.tsx`             | Reusable stat card         |
| `components/admin/shared/StatusBadge.tsx`          | Status badge               |
| `components/admin/shared/EmptyState.tsx`           | Empty state                |
| `components/admin/shared/ConfirmModal.tsx`         | Confirm dialog             |
| `components/admin/articles/ArticleTable.tsx`       | List view table            |
| `components/admin/articles/ArticleKanban.tsx`      | Kanban board               |
| `components/admin/articles/ArticleCard.tsx`        | Kanban card                |
| `components/admin/articles/ArticleFilters.tsx`     | Filter bar                 |
| `components/admin/editor/PublishSidebar.tsx`       | Editor sidebar             |
| `components/admin/editor/ThumbnailPicker.tsx`      | Thumbnail selection modal  |
| `components/admin/media/MediaGrid.tsx`             | Media grid view            |
| `components/admin/media/MediaDropzone.tsx`         | Upload drop zone           |
| `components/admin/media/MediaDetailPanel.tsx`      | Detail drawer              |
| `components/admin/dashboard/StatsRow.tsx`          | Stats overview             |
| `components/admin/dashboard/RecentArticles.tsx`    | Recent articles list       |
| `components/admin/dashboard/QuickActions.tsx`      | Quick action buttons       |
| `types/admin.ts`                                   | Shared TypeScript types    |

### 6.4 Business Logic Preservation

The following logic MUST be preserved exactly as-is during migration:

1. **Auth flow** — Supabase auth check in layout, redirect to login, signOut
2. **Article CRUD** — All create, update, delete, clone logic in articles page
3. **Slug generation** — `buildInternalSlug`, `generateInternalSlug`, category code mapping
4. **Auto-save** — 30-second timer, `handleAutoSave` function, status indicators
5. **Special issue handling** — Category detection, shared status override, share link copy
6. **Tag synchronization** — `syncArticleTags` function
7. **Media upload** — Supabase storage upload to `news-images` bucket
8. **News Factory integration** — `nfFetch`, subscription CRUD, import article
9. **Image handling in editor** — TipTap figure image extension, drag/drop/paste upload
10. **Keyboard shortcuts** — `Cmd/Ctrl+S` for save, `beforeunload` for dirty state

### 6.5 Shared Types (`types/admin.ts`)

Extract and consolidate types currently duplicated across pages:

```typescript
export type ArticleStatus = 
  | 'published' 
  | 'shared' 
  | 'pending_review' 
  | 'draft' 
  | 'scheduled' 
  | 'rejected' 
  | 'archived';

export interface ArticleRow {
  id: string;
  title: string;
  slug?: string | null;
  status: ArticleStatus;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  views?: number | null;
  categories?: CategoryRef[] | CategoryRef | null;
}

export interface CategoryRef {
  name?: string | null;
  slug?: string | null;
}

export interface CategoryOption {
  label: string;
  value: string;
  slug: string;
  isSpecialIssue: boolean;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt_text?: string | null;
  created_at: string;
  file_size?: number | null;
}

export interface RecentArticle {
  id: string;
  title: string;
  status: ArticleStatus;
  created_at: string;
  updated_at?: string | null;
}

export const STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string }> = {
  published:      { label: '게시',     color: 'green' },
  shared:         { label: '공유',     color: 'blue' },
  pending_review: { label: '승인 대기', color: 'orange' },
  draft:          { label: '작성',     color: 'gray' },
  scheduled:      { label: '예약',     color: 'indigo' },
  rejected:       { label: '반려',     color: 'red' },
  archived:       { label: '보관',     color: 'gray' },
};
```

### 6.6 CSS Module Conventions

- File naming: `{ComponentName}.module.css`
- Class naming: camelCase (e.g., `.navItem`, `.sidebarCollapsed`)
- No global styles except in `theme.ts`
- No `!important` ever
- All colors reference Mantine CSS variables: `var(--mantine-color-{name}-{shade})`

### 6.7 Import Conventions

```typescript
// Mantine components — destructured import
import { Paper, Text, Group, Button, ... } from '@mantine/core';

// Icons — individual imports (tree-shaking)
import { IconArticle, IconPhoto } from '@tabler/icons-react';

// Local components — relative imports
import { StatCard } from '@/components/admin/shared/StatCard';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

// Types
import type { ArticleRow, ArticleStatus } from '@/types/admin';

// CSS modules
import classes from './AdminSidebar.module.css';
```

---

## Appendix A: Decision Log

| #  | Decision                                                | Rationale                                                      |
|----|---------------------------------------------------------|----------------------------------------------------------------|
| D1 | Sidebar nav instead of top nav                          | More scalable, better use of horizontal space for content      |
| D2 | Pretendard font over Noto Sans KR for UI                | Sharper rendering, better Korean typography for UI elements    |
| D3 | No drag-and-drop in Kanban v2.0                         | Reduces complexity; add in v2.1 with `@dnd-kit` if needed     |
| D4 | Mantine Notifications over custom toast                 | Built-in, well-tested, consistent with design system           |
| D5 | CSS Modules over Tailwind for admin components          | Better encapsulation; Tailwind used for public pages only      |
| D6 | Keep toolbar inside RichTextEditor (no extraction)      | Avoiding unnecessary prop drilling; toolbar tightly coupled    |
| D7 | Don't extract EditorToolbar separately                  | Same as D6                                                     |
| D8 | Remove all hover transform animations                   | Cleaner, more professional feel; less visual noise             |
| D9 | Mantine Drawer for media detail instead of modal        | Drawer keeps context (grid visible), more efficient workflow   |
| D10| localStorage for sidebar/view preferences               | Simple, works offline, no server state needed                  |
| D11| Remove signup link from login page                      | Admin accounts are provisioned, not self-registered            |
| D12| 6px button radius instead of 999px pill                 | Professional, modern look; pill buttons feel dated             |
| D13| `@mantine/notifications` required as new dependency     | Needed for toast system replacement                            |
| D14| Focus mode for editor                                   | Distraction-free writing; common in modern CMS (Ghost, etc.)  |

---

## Appendix B: File Tree (Final State)

```
app/admin/
├── layout.tsx              — (rewritten) Uses AdminShell
├── page.tsx                — (rewritten) Dashboard  
├── theme.ts                — (NEW) Mantine theme
├── articles/
│   └── page.tsx            — (rewritten) Articles desk
├── write/
│   └── page.tsx            — (refactored) Editor
├── media/
│   └── page.tsx            — (rewritten) Media library
├── login/
│   └── page.tsx            — (rewritten) Login
└── news-feed/
    └── page.tsx            — (polished) News feed

components/admin/
├── layout/
│   ├── AdminShell.tsx
│   ├── AdminShell.module.css
│   ├── AdminSidebar.tsx
│   ├── AdminSidebar.module.css
│   ├── AdminHeader.tsx
│   └── AdminHeader.module.css
├── shared/
│   ├── StatCard.tsx
│   ├── StatusBadge.tsx
│   ├── EmptyState.tsx
│   └── ConfirmModal.tsx
├── articles/
│   ├── ArticleTable.tsx
│   ├── ArticleKanban.tsx
│   ├── ArticleCard.tsx
│   └── ArticleFilters.tsx
├── editor/
│   ├── RichTextEditor.tsx      — (enhanced)
│   ├── FigureImage.tsx         — (unchanged)
│   ├── PublishSidebar.tsx
│   └── ThumbnailPicker.tsx
├── media/
│   ├── MediaGrid.tsx
│   ├── MediaDropzone.tsx
│   └── MediaDetailPanel.tsx
└── dashboard/
    ├── StatsRow.tsx
    ├── RecentArticles.tsx
    └── QuickActions.tsx

types/
└── admin.ts                — Shared TypeScript types

DELETED:
├── app/admin/admin2.css
└── app/admin/login/login.css
```
