# 광전타임즈 현대적 디자인 전면 개선

## TL;DR

> **Quick Summary**: 광전타임즈(KJTIMES) 뉴스 사이트의 프론트엔드 디자인을 NYT/한겨레 스타일의 깔끔한 모던 디자인으로 전면 개선. 홈페이지 시각적 위계 강화, 기사 카드 현대화, 모바일 바텀 네비게이션 추가, 헤더/푸터 리디자인, 기사 상세 읽기 경험 개선.
>
> **Deliverables**:
> - 홈페이지 레이아웃 현대화 (비대칭 그리드, 히어로 섹션 강화)
> - 기사 카드(ArticleCard) 디자인 전면 개선
> - 모바일 바텀 네비게이션 바 신규 추가
> - 헤더 리디자인 (스크롤 축소, 모바일 최적화)
> - 푸터 현대적 리디자인
> - 카테고리 페이지 개선
> - 기사 상세 페이지 읽기 경험 개선
> - 마이크로 애니메이션 및 트랜지션 추가
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (theme tokens) → Task 2 (ArticleCard) → Task 3-6 (pages) → Task 7-9 (nav/footer/animations)

---

## Context

### Original Request
광전타임즈 프로젝트를 세세히 검토하고 완성도 높은 언론사 홈페이지가 되도록 개선. 디자인적으로 현대적인 디자인. 특히 모바일 UI/UX 개선.

### Interview Summary
**Key Discussions**:
- **컴포넌트 구조**: 기존 분리 구조 유지 결정 (단, Metis 분석으로 MobileMain/DesktopMain 등이 고아 컴포넌트임을 확인 → 통합 반응형 방식 유지)
- **다크모드**: 이번 제외
- **속보 배너**: 이번 제외 (백엔드 변경 필요)
- **모바일 바텀탭**: 추가
- **디자인 톤**: 깔끔한 모던 (NYT/한겨레 스타일)

**Research Findings**:
- 현대 뉴스 사이트 트렌드: 비대칭 그리드, 모듈러 카드, 20-30% 더 넉넉한 여백
- 모바일 UX: 바텀 네비게이션, 스와이프 카테고리, 48px 이상 터치 타겟
- 한국 뉴스 사이트 기준: 본문 최소 16px, 줄간격 1.6-1.8

### Metis Review
**Identified Gaps** (addressed):
- **고아 컴포넌트 발견**: MobileMain, MobileHeader, MobileArticleDetail, DesktopMain, DesktopArticleDetail는 현재 사용되지 않음 → 삭제 후 통합 반응형 컴포넌트에서 개선
- **애니메이션 라이브러리 부재**: framer-motion 미설치 → CSS transitions만 사용 결정
- **E2E 테스트 셀렉터 보존 필수**: ARIA 라벨, 시맨틱 HTML, 특정 텍스트 보존 목록 정리
- **ArticleDetail.module.css 복잡도**: 1279줄 → 기존 클래스 리스타일 방식으로 진행

---

## Work Objectives

### Core Objective
광전타임즈를 한국의 대표적 지역 언론사 웹사이트 수준의 현대적이고 세련된 디자인으로 전면 개선하되, 기존 기능과 E2E 테스트를 보존한다.

### Concrete Deliverables
- 개선된 `theme.ts` (타이포그래피, spacing, shadow 토큰)
- 리디자인된 `ArticleCard.tsx` (더 큰 썸네일, 호버 효과, 모던한 카드)
- 리디자인된 홈페이지 섹션 컴포넌트들 (`Headline.tsx`, `MainNews.tsx`, `PopularNews.tsx`, `CategorySection.tsx`)
- 새로운 모바일 바텀 네비게이션 컴포넌트
- 리디자인된 `Header.tsx` (스크롤 축소 동작)
- 리디자인된 `Footer.tsx` (현대적 섹션 구조)
- 개선된 `CategoryPageTemplate.tsx`
- 개선된 기사 상세 스타일 (`ArticleDetail.module.css`)
- 고아 컴포넌트 정리 (미사용 컴포넌트 삭제)

### Definition of Done
- [ ] `npm run build` → Exit code 0
- [ ] `npm run lint` → Exit code 0
- [ ] `npx playwright test` → 기존 모든 테스트 패스 (약 94개)
- [ ] 모바일(375px) 뷰에서 바텀 네비게이션 표시 확인
- [ ] 데스크톱(1280px) 뷰에서 바텀 네비게이션 숨김 확인
- [ ] 모든 페이지에서 시각적 깨짐 없음

### Must Have
- NYT/한겨레 수준의 깔끔한 타이포그래피와 여백
- 모바일 바텀 네비게이션 바
- 더 큰 썸네일과 호버 효과가 있는 기사 카드
- 홈페이지 비대칭 그리드 히어로 섹션
- 스크롤 시 축소되는 헤더
- 마이크로 트랜지션 (CSS transitions, 150-300ms)

### Must NOT Have (Guardrails)
- 다크모드 구현 금지 (이번 스코프 외)
- 속보 배너 추가 금지 (백엔드 변경 필요)
- `app/admin/` 및 `components/admin/` 파일 수정 금지
- `app/api/`, `lib/api/`, `utils/supabase/` 파일 수정 금지
- `middleware.ts` 수정 금지
- `constants/navigation.ts`의 LINKS 배열 항목 변경 금지
- 새 NPM 패키지 추가 금지 (CSS transitions만 사용)
- ArticleCard props 인터페이스 변경 금지 (`article`, `variant`, `showThumbnail`, `showExcerpt`, `rank`)
- CategoryPageTemplate props 인터페이스 변경 금지
- Mantine `md` 브레이크포인트(64em) 변경 금지
- 다음 ARIA 라벨 변경 금지: `"메인 메뉴"`, `"카테고리 메뉴"`, `"메뉴 열기"`, `"검색"`, `"검색어"`
- `role="contentinfo"` (footer), `.skip-to-main`, `#main-content` 변경 금지
- 다음 텍스트 변경 금지: `"로그인"`, `"회원가입"`, `"더보기"`, `"최신순"`, `"인기순"`, `"주요뉴스"`, `"많이 본 뉴스"`
- HTML 시맨틱 구조 변경 금지: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<aside>`
- AI 슬롭 패턴 금지: 불필요한 추상화, 과도한 컴포넌트 분리, JSDoc 범벅, 15개 에러 핸들러

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> **FORBIDDEN**: "사용자가 직접 테스트...", "사용자가 눈으로 확인..."
> **ALL verification is executed by the agent** using tools (Playwright, Bash).

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (기존 E2E 유지 + 바텀탭 새 테스트)
- **Framework**: Playwright 1.58

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Playwright는 이미 설정되어 있음 (`playwright.config.ts`).
> 모든 작업 후 `npx playwright test` 실행하여 기존 테스트 보존 확인.
> UI 변경은 Playwright로 요소 존재/가시성/스타일 검증.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **모든 작업** | Bash (`npm run build`) | 빌드 성공 확인 |
| **모든 작업** | Bash (`npx playwright test`) | 기존 E2E 테스트 패스 확인 |
| **UI 변경** | Playwright (playwright skill) | 요소 가시성, 스타일 계산값, 스크린샷 |
| **모바일 UI** | Playwright (viewport 375x667) | 모바일 레이아웃 검증 |
| **데스크톱 UI** | Playwright (viewport 1280x720) | 데스크톱 레이아웃 검증 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 테마 토큰 및 타이포그래피 개선 [no dependencies]
└── Task 9: 고아 컴포넌트 정리 [no dependencies]

Wave 2 (After Wave 1):
├── Task 2: ArticleCard 리디자인 [depends: 1]
├── Task 5: 헤더 리디자인 [depends: 1]
└── Task 6: 푸터 리디자인 [depends: 1]

Wave 3 (After Wave 2):
├── Task 3: 홈페이지 레이아웃 현대화 [depends: 1, 2]
├── Task 4: 카테고리 페이지 개선 [depends: 1, 2]
└── Task 7: 기사 상세 페이지 개선 [depends: 1]

Wave 4 (After Wave 3):
├── Task 8: 모바일 바텀 네비게이션 [depends: 5]
└── Task 10: 마이크로 애니메이션 및 최종 폴리싱 [depends: all]

Critical Path: Task 1 → Task 2 → Task 3 → Task 10
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Theme) | None | 2, 3, 4, 5, 6, 7 | 9 |
| 2 (ArticleCard) | 1 | 3, 4 | 5, 6 |
| 3 (Homepage) | 1, 2 | 10 | 4, 7 |
| 4 (Category) | 1, 2 | 10 | 3, 7 |
| 5 (Header) | 1 | 8 | 2, 6 |
| 6 (Footer) | 1 | 10 | 2, 5 |
| 7 (Article Detail) | 1 | 10 | 3, 4 |
| 8 (Bottom Nav) | 5 | 10 | 3, 4, 7 |
| 9 (Cleanup) | None | None | 1 |
| 10 (Polish) | All | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 9 | task(category="quick") each |
| 2 | 2, 5, 6 | task(category="visual-engineering") each |
| 3 | 3, 4, 7 | task(category="visual-engineering") each |
| 4 | 8, 10 | task(category="visual-engineering") each |

---

## TODOs

- [x] 1. 테마 토큰 및 타이포그래피 시스템 개선

  **What to do**:
  - `theme.ts` 수정: 타이포그래피 스케일 세밀화 (headline, subheadline, body 각각 데스크톱/모바일)
  - spacing 토큰 추가 (section gap, card gap, compact gap)
  - shadow 토큰 추가 (card shadow, elevated shadow, subtle shadow)
  - 기존 12가지 색상 팔레트 유지하되, 필요시 shade 값 미세 조정
  - `globals.css`에 부드러운 기본 transition 추가 (`a`, `button` 요소)
  - 본문 line-height를 1.8 이상으로 조정 (한국어 가독성)

  **Must NOT do**:
  - 새 색상 팔레트 추가 금지 (기존 12가지 내에서 조정)
  - Mantine breakpoints 변경 금지 (xs:30em, sm:48em, md:64em, lg:74em, xl:90em)
  - 새 NPM 패키지 설치 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일(theme.ts + globals.css) 수정, 명확한 작업 범위
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 타이포그래피 및 디자인 토큰 전문성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 9)
  - **Blocks**: Tasks 2, 3, 4, 5, 6, 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `theme.ts:1-230` — 현재 전체 Mantine 테마 설정 (색상 12팔레트, 타이포그래피, 브레이크포인트). 이 파일의 `other.typography` 섹션을 확장하고 `shadows`, `spacing` 커스텀 토큰 추가
  - `app/globals.css:1-66` — 현재 글로벌 스타일. body 기본 스타일, tiptap-content 스타일, focus-visible 스타일. 여기에 기본 transition 추가

  **API/Type References**:
  - Mantine v8 `createTheme()` API — `other` 필드에 커스텀 토큰을 자유롭게 추가 가능

  **Test References**:
  - `e2e/accessibility.spec.ts` — 접근성 테스트가 특정 스타일 값을 검증하지는 않지만, 테마 변경 후 전체 E2E 패스 확인 필요

  **WHY Each Reference Matters**:
  - `theme.ts`는 전체 디자인 시스템의 핵심. 이후 모든 컴포넌트가 이 토큰을 참조하므로, 가장 먼저 올바르게 설정해야 함
  - `globals.css`의 transition 추가는 이후 컴포넌트들의 호버/인터랙션 기본 동작 결정

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 빌드 성공 및 기존 테스트 패스
    Tool: Bash
    Preconditions: Node.js, npm 설치됨
    Steps:
      1. cd /Users/zoopark-studio/Documents/dev/KJTIMES_Front
      2. npm run build
      3. Assert: exit code 0
      4. npx playwright test
      5. Assert: 모든 기존 테스트 패스
    Expected Result: 빌드와 테스트 모두 성공
    Evidence: 빌드 로그, 테스트 결과 캡처

  Scenario: 테마 토큰 적용 확인
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to: http://localhost:3000
      2. Wait for: body visible (timeout: 10s)
      3. Evaluate: document.body에서 computed font-family에 'Noto Sans KR' 포함 확인
      4. Evaluate: 홈페이지 첫 번째 기사 제목의 computed line-height >= 1.3
      5. Screenshot: .sisyphus/evidence/task-1-theme-tokens.png
    Expected Result: 테마 토큰이 올바르게 적용됨
    Evidence: .sisyphus/evidence/task-1-theme-tokens.png
  ```

  **Commit**: YES
  - Message: `Enhance theme tokens with improved typography, spacing, and shadow system`
  - Files: `theme.ts`, `app/globals.css`
  - Pre-commit: `npm run build`

---

- [ ] 2. ArticleCard 컴포넌트 리디자인

  **What to do**:
  - `components/shared/ArticleCard.tsx` 전면 리디자인
  - **featured variant**: 히어로 이미지 높이 증가 (300px → 최소 400px 데스크톱, 240px 모바일), aspect-ratio 사용, 이미지 위 그라데이션 오버레이에 제목 배치
  - **compact variant**: 썸네일 크기 확대 (80x60 → 120x90 이상), 호버 시 미묘한 shadow + translateY(-2px) 트랜지션, 카테고리 뱃지 추가
  - **headline variant**: 이미지 aspect-ratio 16:9 적용, 카드형 디자인 (border + shadow)
  - **list variant**: 랭킹 번호 스타일 개선 (원형 뱃지 또는 볼드 숫자), 호버 시 배경색 변경
  - 모든 variant에 부드러운 hover transition 추가 (transform, shadow, 150-200ms)
  - 모바일에서 터치 타겟 최소 48px 보장
  - 날짜 표시 추가 (현재 compact/list variant에 누락)
  - props 인터페이스 변경 금지 — 내부 렌더링만 변경

  **Must NOT do**:
  - `ArticleCardProps` 인터페이스 변경 금지 (article, variant, showThumbnail, showExcerpt, rank)
  - 새 variant 추가 금지
  - 새 NPM 패키지 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 컴포넌트 리디자인, 시각적 품질이 핵심
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 카드 디자인, 호버 효과, 시각적 위계 전문성

  **Parallelization**:
  - **Can Run In Parallel**: NO (Task 1 완료 후)
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `components/shared/ArticleCard.tsx:1-154` — 현재 전체 구현. 4가지 variant (featured, compact, list, headline). props 인터페이스 line 8-14 확인 필수 — 변경 불가
  - `components/home/Headline.tsx:1-44` — ArticleCard의 featured/headline variant 사용 패턴
  - `components/home/MainNews.tsx:1-32` — ArticleCard의 compact variant 사용 패턴
  - `components/home/PopularNews.tsx:1-32` — ArticleCard의 list variant 사용 (rank 포함)

  **API/Type References**:
  - `types/index.ts:15-29` — Article 타입 정의. thumbnail_url, title, summary, excerpt, categories 등

  **Test References**:
  - `e2e/homepage.spec.ts` — 홈페이지 기사 카드 렌더링 검증. `a[href^="/article/"]` 셀렉터 사용
  - `e2e/article.spec.ts` — 기사 링크 클릭 검증

  **WHY Each Reference Matters**:
  - ArticleCard는 홈페이지, 카테고리 페이지, 검색 결과 등 전체 사이트에서 재사용되는 핵심 컴포넌트. 이 컴포넌트의 디자인 품질이 전체 사이트 인상을 결정

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: ArticleCard featured variant 리디자인 확인 (데스크톱)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000, 기사 데이터 존재
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720
      3. Wait for: a[href^="/article/"] visible (timeout: 10s)
      4. Assert: 첫 번째 기사 이미지 높이 >= 350px
      5. Assert: 기사 카드에 hover 시 transform 변화 확인 (hover pseudoclass)
      6. Screenshot: .sisyphus/evidence/task-2-card-desktop.png
    Expected Result: Featured 카드가 더 크고 시각적으로 임팩트 있음
    Evidence: .sisyphus/evidence/task-2-card-desktop.png

  Scenario: ArticleCard compact variant 리디자인 확인 (모바일)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 375x667
      3. Wait for: 기사 리스트 영역 visible (timeout: 10s)
      4. Assert: 썸네일 이미지 width >= 100px
      5. Assert: 각 기사 항목의 최소 높이 >= 48px (터치 타겟)
      6. Screenshot: .sisyphus/evidence/task-2-card-mobile.png
    Expected Result: 모바일에서 더 큰 썸네일, 적절한 터치 타겟
    Evidence: .sisyphus/evidence/task-2-card-mobile.png

  Scenario: 기존 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npm run build && npx playwright test
      2. Assert: 모든 기존 테스트 패스
    Expected Result: 기존 테스트 깨짐 없음
    Evidence: 테스트 결과 캡처
  ```

  **Commit**: YES
  - Message: `Redesign ArticleCard with larger thumbnails, hover effects, and modern card styling`
  - Files: `components/shared/ArticleCard.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 3. 홈페이지 레이아웃 현대화

  **What to do**:
  - `app/(main)/page.tsx` 수정: 홈페이지 전체 레이아웃 구조 개선
  - **히어로 섹션 강화**: `Headline.tsx` 수정 — 메인 기사를 화면 폭 활용하는 대형 히어로로, 서브 기사 2개는 오버레이 또는 아래 카드
  - **MainNews 그리드 개선**: `MainNews.tsx` 수정 — 단순 리스트 → 2열 그리드 (첫 기사 크게, 나머지 작게 배치하는 비대칭 레이아웃)
  - **PopularNews 개선**: `PopularNews.tsx` 수정 — 순위 스타일 개선, 스티키 사이드바로 동작
  - **CategorySection 개선**: `CategorySection.tsx` 수정 — 카테고리명 뱃지 스타일, 카드 4열 그리드, 호버 효과
  - 모바일에서는 1열 스택, 적절한 간격과 구분선
  - 섹션 간 넉넉한 여백 (40-60px)
  - 각 카테고리 섹션 시각적 분리 (배경색 교차 또는 구분선)

  **Must NOT do**:
  - 데이터 fetching 로직 변경 금지 (fetchArticles, fetchCategoryArticles 호출 유지)
  - `revalidate = 60` 변경 금지
  - metadata 변경 금지
  - EmptyState 컴포넌트 삭제 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 그리드 레이아웃, 반응형 디자인, 시각적 위계
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 뉴스 사이트 레이아웃 전문성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 4, 7)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `app/(main)/page.tsx:1-140` — 현재 홈페이지 전체 구현. 데이터 fetching (line 69-82), 레이아웃 구조 (line 84-137). 데이터 fetching은 그대로 유지하고 JSX만 변경
  - `components/home/Headline.tsx:1-44` — 현재 히어로 섹션. Grid 기반 1+2 레이아웃
  - `components/home/MainNews.tsx:1-32` — 현재 주요뉴스 섹션. 단순 Grid
  - `components/home/PopularNews.tsx:1-32` — 현재 인기뉴스. 단순 리스트
  - `components/home/CategorySection.tsx:1-60` — 현재 카테고리 섹션. 4열 그리드
  - `components/home/Opinion.tsx:1-50` — 현재 오피니언 (참고용, DesktopMain에서만 사용되며 현재 홈페이지에서 미사용)

  **Test References**:
  - `e2e/homepage.spec.ts` — "주요뉴스" 헤딩, 기사 링크 존재, 카테고리 섹션 검증. 이 텍스트들 보존 필수

  **WHY Each Reference Matters**:
  - `page.tsx`의 데이터 로직은 건드리지 않고 렌더링만 개선해야 테스트와 기능이 보존됨
  - 각 home 컴포넌트의 현재 구조를 이해해야 어디까지 변경 가능한지 판단 가능

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 홈페이지 데스크톱 레이아웃 검증
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 기사 데이터 존재
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720
      3. Wait for: h2:text("주요뉴스") visible (timeout: 10s)
      4. Assert: 히어로 섹션 이미지 높이 >= 350px
      5. Assert: "주요뉴스" 섹션 존재
      6. Assert: "많이 본 뉴스" 섹션 존재
      7. Assert: 카테고리 섹션들 존재 (정치, 경제, 사회)
      8. Screenshot: .sisyphus/evidence/task-3-home-desktop.png
    Expected Result: 비대칭 그리드, 넉넉한 여백의 현대적 홈페이지
    Evidence: .sisyphus/evidence/task-3-home-desktop.png

  Scenario: 홈페이지 모바일 레이아웃 검증
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 375x667
      3. Wait for: 기사 링크 visible (timeout: 10s)
      4. Assert: 모든 콘텐츠가 뷰포트 너비 내 (overflow-x 없음)
      5. Assert: 기사 카드가 세로 스택으로 배치
      6. Screenshot: .sisyphus/evidence/task-3-home-mobile.png
    Expected Result: 모바일에서 깔끔한 1열 레이아웃
    Evidence: .sisyphus/evidence/task-3-home-mobile.png

  Scenario: 기존 E2E 홈페이지 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test e2e/homepage.spec.ts
      2. Assert: 모든 테스트 패스
    Expected Result: 기존 홈페이지 테스트 깨짐 없음
    Evidence: 테스트 결과 캡처
  ```

  **Commit**: YES
  - Message: `Modernize homepage layout with asymmetric hero grid and improved sections`
  - Files: `app/(main)/page.tsx`, `components/home/Headline.tsx`, `components/home/MainNews.tsx`, `components/home/PopularNews.tsx`, `components/home/CategorySection.tsx`
  - Pre-commit: `npm run build && npx playwright test e2e/homepage.spec.ts`

---

- [ ] 4. 카테고리 페이지 개선

  **What to do**:
  - `components/layout/CategoryPageTemplate.tsx` 수정
  - 첫 번째 기사를 히어로로 크게 표시 (featured variant 활용)
  - 나머지 기사 그리드 개선: 모바일 1열, 태블릿 2열, 데스크톱 3열
  - `CategoryHeader.tsx` 개선: 카테고리명 더 눈에 띄게, 기사 수 뱃지
  - `CategorySidebar.tsx` 개선: 카드 스타일, 인기 기사 랭킹
  - `FilterSort.tsx` 개선: 모바일에서도 접근 가능한 필터 (현재 사이드바에만 있어 모바일에서 안 보임)
  - 더보기 버튼 스타일 개선
  - 모바일에서 필터/정렬을 상단에 표시 (사이드바 대신)

  **Must NOT do**:
  - `CategoryPageTemplate` props 인터페이스 변경 금지
  - 데이터 fetching 로직 변경 금지 (각 카테고리 page.tsx의 fetchCategoryArticles 호출)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 그리드 레이아웃, 반응형 디자인
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 리스트/그리드 UX 전문성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 7)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `components/layout/CategoryPageTemplate.tsx:1-100` — 현재 전체 구현. Grid 기반 2열 레이아웃 (main 8, sidebar 4). sortBy/displayCount 상태 관리. props 인터페이스 line 11-18
  - `components/category/CategoryHeader.tsx` — 카테고리 헤더
  - `components/category/CategorySidebar.tsx` — 사이드바 (popularArticles, relatedCategories)
  - `components/category/FilterSort.tsx` — 정렬 필터
  - `app/(main)/politics/page.tsx` — 카테고리 페이지 사용 예시 (모든 카테고리 페이지가 동일 패턴)

  **Test References**:
  - `e2e/category.spec.ts` — 카테고리 페이지 테스트 (~15개). "최신순"/"인기순" 텍스트, 기사 존재 확인

  **WHY Each Reference Matters**:
  - CategoryPageTemplate이 모든 6개 카테고리 페이지에서 공유되므로, 하나를 수정하면 모든 카테고리에 반영됨

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 카테고리 페이지 데스크톱 레이아웃
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000/politics
      2. Set viewport: 1280x720
      3. Wait for: 기사 카드 visible (timeout: 10s)
      4. Assert: 첫 번째 기사가 히어로 스타일로 크게 표시
      5. Assert: 사이드바 visible
      6. Assert: "최신순"/"인기순" 정렬 버튼 visible
      7. Screenshot: .sisyphus/evidence/task-4-category-desktop.png
    Expected Result: 히어로 기사 + 그리드 + 사이드바 레이아웃
    Evidence: .sisyphus/evidence/task-4-category-desktop.png

  Scenario: 카테고리 페이지 모바일 필터 접근성
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000/politics
      2. Set viewport: 375x667
      3. Assert: 정렬 옵션이 모바일에서 접근 가능 (상단에 표시)
      4. Assert: 사이드바가 숨겨짐 (visibleFrom="md")
      5. Screenshot: .sisyphus/evidence/task-4-category-mobile.png
    Expected Result: 모바일에서도 필터/정렬 사용 가능
    Evidence: .sisyphus/evidence/task-4-category-mobile.png

  Scenario: 기존 카테고리 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test e2e/category.spec.ts
      2. Assert: 모든 테스트 패스
    Expected Result: 기존 카테고리 테스트 깨짐 없음
  ```

  **Commit**: YES
  - Message: `Improve category pages with hero article, responsive filters, and modern grid`
  - Files: `components/layout/CategoryPageTemplate.tsx`, `components/category/CategoryHeader.tsx`, `components/category/CategorySidebar.tsx`, `components/category/FilterSort.tsx`
  - Pre-commit: `npm run build && npx playwright test e2e/category.spec.ts`

---

- [ ] 5. 헤더 리디자인

  **What to do**:
  - `components/layout/Header.tsx` 전면 리디자인
  - **데스크톱 헤더**:
    - 로고 섹션과 네비게이션 통합 (현재 3단 구조 → 2단으로 정리)
    - 스크롤 시 축소 동작: 스크롤 다운 시 상단 유틸리티 바 숨기고 로고+네비만 남기는 컴팩트 모드 (CSS sticky + JS scroll listener)
    - 네비게이션 링크에 호버 시 밑줄 애니메이션
    - 검색바 디자인 개선
  - **모바일 헤더**:
    - 스티키 헤더 유지하되 더 컴팩트하게
    - 카테고리 스크롤 탭에 스냅 동작 추가 (CSS scroll-snap)
    - 카테고리 탭 가장자리에 페이드 그라디언트 (더 많은 항목 있음을 시각적 힌트)
    - 현재 카테고리 active 상태 더 뚜렷하게
  - **모바일 드로어**:
    - 드로어 디자인 개선: 검색바 + 카테고리 + 유틸리티 링크 정리
    - 부드러운 드로어 열기/닫기 트랜지션

  **Must NOT do**:
  - `aria-label="메인 메뉴"`, `"카테고리 메뉴"`, `"메뉴 열기"` 변경 금지
  - `.skip-to-main` 링크 제거 금지, `#main-content` 타겟 변경 금지
  - "로그인", "회원가입" 텍스트 변경 금지
  - `<header>`, `<nav>` 시맨틱 태그 제거 금지
  - `LINKS` 상수 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 스크롤 동작, 반응형 네비게이션
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 네비게이션 UX, 스크롤 인터랙션

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 6)
  - **Blocks**: Task 8 (Bottom Nav)
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `components/layout/Header.tsx:1-327` — 현재 전체 구현. 데스크톱(line 66-123) + 모바일(line 126-210) + 드로어(line 214-323). ARIA 라벨 위치 확인: line 104 `aria-label="메인 메뉴"`, line 143 `aria-label="메뉴 열기"`, line 176 `aria-label="카테고리 메뉴"`
  - `components/shared/SearchBar.tsx` — 검색바 컴포넌트 (Header에서 사용)
  - `constants/navigation.ts:1-13` — LINKS 배열. 수정 불가

  **Test References**:
  - `e2e/navigation.spec.ts` — 네비게이션 테스트 (~17개). 햄버거 메뉴, 카테고리 링크, 로그인 링크 검증
  - `e2e/accessibility.spec.ts` — skip-to-main 링크, ARIA 라벨 검증

  **WHY Each Reference Matters**:
  - Header는 모든 페이지에 렌더링되므로, 여기서 ARIA 라벨이나 시맨틱 구조를 깨뜨리면 거의 모든 E2E 테스트가 실패함

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 데스크톱 헤더 스크롤 축소 동작
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720
      3. Wait for: nav[aria-label="메인 메뉴"] visible (timeout: 5s)
      4. Scroll down: 300px
      5. Wait: 300ms (transition time)
      6. Assert: 헤더가 컴팩트 모드 (날짜/유틸리티 바 숨겨짐)
      7. Scroll back to top
      8. Assert: 헤더가 풀 모드 복원
      9. Screenshot: .sisyphus/evidence/task-5-header-compact.png
    Expected Result: 스크롤 시 부드러운 헤더 축소/복원
    Evidence: .sisyphus/evidence/task-5-header-compact.png

  Scenario: 모바일 카테고리 탭 스냅 스크롤
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 375x667
      3. Assert: 카테고리 스크롤 탭 visible
      4. Assert: 가장자리 페이드 그라디언트 존재
      5. Assert: aria-label="메뉴 열기" 버튼 visible
      6. Screenshot: .sisyphus/evidence/task-5-header-mobile.png
    Expected Result: 모바일 헤더가 컴팩트하고 사용하기 쉬움
    Evidence: .sisyphus/evidence/task-5-header-mobile.png

  Scenario: 기존 네비게이션 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test e2e/navigation.spec.ts e2e/accessibility.spec.ts
      2. Assert: 모든 테스트 패스
    Expected Result: 네비게이션/접근성 테스트 깨짐 없음
  ```

  **Commit**: YES
  - Message: `Redesign header with scroll-to-shrink behavior and improved mobile navigation`
  - Files: `components/layout/Header.tsx`
  - Pre-commit: `npm run build && npx playwright test e2e/navigation.spec.ts`

---

- [ ] 6. 푸터 현대적 리디자인

  **What to do**:
  - `components/layout/Footer.tsx` 리디자인
  - **데스크톱**:
    - 3-4 컬럼 그리드 구조: 로고+소개 | 카테고리 링크 | 회사정보 | 연락처
    - 소셜 미디어 아이콘 (빈 링크라도 자리 확보: 이메일 jebo@kjtimes.co.kr 아이콘)
    - 하단에 저작권 + 정책 링크 (이용약관, 개인정보처리방침 등)
    - 상단에 얇은 브랜드 컬러 라인
  - **모바일**:
    - 아코디언 또는 스택 형태로 정보 정리
    - 터치 타겟 48px 이상
    - 하단 바텀 네비게이션 높이만큼 패딩 추가
  - 배경색을 현재 `gray.0`에서 더 뉴스다운 색상으로 (`newsSurface` 팔레트 활용)
  - 뉴스레터 구독 CTA 영역 (UI만, 기능은 기존 /subscribe 링크 활용)

  **Must NOT do**:
  - `role="contentinfo"` 제거 금지
  - `<footer>` 태그 제거 금지
  - 링크 URL 변경 금지 (/about, /advertise, /terms, /privacy, /editorial, /corrections)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 시각적 디자인 중심
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `components/layout/Footer.tsx:1-87` — 현재 전체 구현. 모바일(line 12-47) + 데스크톱(line 49-82). `role="contentinfo"` 확인: line 10
  - `constants/navigation.ts:1-13` — 카테고리 링크 (footer에서도 사용 가능)

  **WHY Each Reference Matters**:
  - Footer의 `role="contentinfo"`는 E2E 접근성 테스트에서 검증됨. 반드시 보존

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 데스크톱 푸터 구조 검증
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720
      3. Scroll to: footer[role="contentinfo"]
      4. Assert: footer visible
      5. Assert: 회사 정보 텍스트 포함 ("광전타임즈", "함평군")
      6. Assert: 정책 링크 존재 (a[href="/terms"], a[href="/privacy"])
      7. Screenshot: .sisyphus/evidence/task-6-footer-desktop.png
    Expected Result: 멀티 컬럼의 현대적 푸터
    Evidence: .sisyphus/evidence/task-6-footer-desktop.png

  Scenario: 기존 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test
      2. Assert: 모든 테스트 패스 (footer role="contentinfo" 검증 포함)
  ```

  **Commit**: YES
  - Message: `Redesign footer with multi-column layout and modern styling`
  - Files: `components/layout/Footer.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 7. 기사 상세 페이지 읽기 경험 개선

  **What to do**:
  - `components/shared/ArticleDetail.module.css` 리스타일 (기존 클래스명 유지, 스타일값만 변경)
  - `components/shared/ArticleDetail.tsx` 마크업 미세 조정 (레이아웃 개선)
  - **본문 타이포그래피**: line-height 1.85-1.92, 자간 -0.01em, 최대 너비 680px
  - **히어로 이미지**: 더 큰 크기, 부드러운 radius, 캡션 스타일 개선
  - **인용문(blockquote)**: 더 눈에 띄는 좌측 보더, 배경색 개선
  - **관련 기사 섹션**: 카드 디자인 개선, 호버 효과
  - **기자 카드**: 더 현대적인 디자인 (둥근 아바타, 깔끔한 레이아웃)
  - **공유 버튼**: 더 눈에 띄게, 적절한 간격
  - **이전/다음 기사**: 카드 스타일, 호버 효과
  - 모바일에서 본문 font-size 16px 이상 보장 (한국어 가독성)
  - 모바일에서 이미지 풀 너비 활용

  **Must NOT do**:
  - CSS 클래스명 변경 금지 (`.chosunBody`, `.articleBody`, `.mobileTitle` 등 — 컴포넌트에서 import됨)
  - ArticleDetail 컴포넌트의 데이터 흐름 변경 금지
  - dangerouslySetInnerHTML 처리 방식 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS 집중 작업, 읽기 경험 디자인
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 4)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `components/shared/ArticleDetail.module.css:1-1279` — 현재 전체 CSS. 데스크톱 스타일(`.chosun*` prefix, line 1-558) + 공유 스타일(line 560-820) + 모바일 스타일(`.mobile*` prefix, line 966-1090) + 미디어 쿼리(line 1188-1279)
  - `components/shared/ArticleDetail.tsx` — 기사 상세 공유 컴포넌트 (CSS module import)
  - `components/desktop/DesktopArticleDetail.tsx:1-456` — 데스크톱 기사 상세 (고아 컴포넌트이나 CSS 클래스 참조 패턴 확인용)
  - `components/mobile/MobileArticleDetail.tsx:1-345` — 모바일 기사 상세 (고아 컴포넌트이나 CSS 클래스 참조 패턴 확인용)

  **Test References**:
  - `e2e/article.spec.ts` — 기사 상세 테스트 (~9개). 제목, 본문, 카테고리 뱃지 검증

  **WHY Each Reference Matters**:
  - CSS 파일이 1279줄로 매우 크므로, 클래스명 변경 없이 스타일 값만 수정하는 것이 안전. 고아 컴포넌트들도 같은 CSS module을 import하므로 클래스명 변경 시 빌드 에러 발생 가능

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 기사 상세 데스크톱 읽기 경험
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 기사가 존재
    Steps:
      1. Navigate to: http://localhost:3000 → 첫 기사 클릭
      2. Set viewport: 1280x720
      3. Wait for: article tag visible (timeout: 10s)
      4. Assert: 본문 max-width <= 720px
      5. Assert: 본문 line-height >= 1.8
      6. Assert: 기자 카드 visible
      7. Assert: 관련 기사 섹션 visible
      8. Screenshot: .sisyphus/evidence/task-7-article-desktop.png
    Expected Result: 깔끔한 읽기 경험
    Evidence: .sisyphus/evidence/task-7-article-desktop.png

  Scenario: 기사 상세 모바일 읽기 경험
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000 → 첫 기사 클릭
      2. Set viewport: 375x667
      3. Assert: 본문 font-size >= 16px
      4. Assert: 이미지가 전체 너비 활용
      5. Assert: overflow-x 없음
      6. Screenshot: .sisyphus/evidence/task-7-article-mobile.png
    Expected Result: 모바일에서 최적화된 읽기 경험
    Evidence: .sisyphus/evidence/task-7-article-mobile.png

  Scenario: 기존 기사 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test e2e/article.spec.ts
      2. Assert: 모든 테스트 패스
  ```

  **Commit**: YES
  - Message: `Improve article detail reading experience with better typography and layout`
  - Files: `components/shared/ArticleDetail.module.css`, `components/shared/ArticleDetail.tsx`
  - Pre-commit: `npm run build && npx playwright test e2e/article.spec.ts`

---

- [ ] 8. 모바일 바텀 네비게이션 바 신규 추가

  **What to do**:
  - 새 컴포넌트 `components/layout/BottomNav.tsx` 생성
  - 4-5개 탭: 홈, 카테고리(전체 카테고리 시트 오픈), 검색, 최신기사
  - `hiddenFrom="md"` (데스크톱에서 숨김)
  - 현재 경로에 따른 active 상태 표시
  - fixed position bottom, 높이 56-64px
  - Tabler Icons 사용 (이미 설치됨: `@tabler/icons-react`)
  - `DeviceLayout.tsx`에서 Footer 전에 BottomNav 렌더링
  - 바텀 네비 높이만큼 body 하단에 padding 추가 (콘텐츠 가림 방지)
  - 부드러운 탭 전환 트랜지션
  - Safe area inset 지원 (iPhone 하단 영역)

  **Must NOT do**:
  - 데스크톱에서 보이게 하지 않음
  - 기존 Header 모바일 카테고리 탭 제거 금지 (보완 관계, 대체 아님)
  - `DeviceLayout.tsx`의 기존 구조 파괴 금지 (Header + children + Footer 순서 유지)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 새 UI 컴포넌트, 모바일 UX
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 10
  - **Blocked By**: Task 5 (Header)

  **References**:

  **Pattern References**:
  - `components/layout/DeviceLayout.tsx:1-26` — 현재 레이아웃 구조. Header + main + Footer. BottomNav를 Footer 앞에 추가
  - `components/layout/Header.tsx:126-210` — 모바일 헤더의 카테고리 스크롤 탭 패턴 참고 (isActiveLink 로직 재사용 가능)
  - `constants/navigation.ts:1-13` — LINKS 배열 (바텀 네비에서 홈/카테고리 참조)

  **External References**:
  - `@tabler/icons-react` — IconHome, IconCategory, IconSearch, IconClock 등 사용 가능

  **WHY Each Reference Matters**:
  - DeviceLayout이 모든 페이지의 레이아웃 래퍼이므로, 여기에 BottomNav를 추가하면 자동으로 모든 페이지에 적용됨
  - Header의 isActiveLink 패턴을 그대로 활용 가능

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 모바일에서 바텀 네비게이션 표시
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 375x667
      3. Wait for: 바텀 네비게이션 컨테이너 visible (timeout: 5s)
      4. Assert: 바텀 네비 position fixed, bottom 0
      5. Assert: 최소 4개 탭 아이콘 visible
      6. Assert: "홈" 탭이 active 상태 (현재 경로 /)
      7. Click: 검색 탭 아이콘
      8. Wait for: navigation to /search
      9. Assert: URL이 /search로 변경됨
      10. Assert: 검색 탭이 active 상태
      11. Screenshot: .sisyphus/evidence/task-8-bottomnav-mobile.png
    Expected Result: 바텀 네비게이션이 정상 동작
    Evidence: .sisyphus/evidence/task-8-bottomnav-mobile.png

  Scenario: 데스크톱에서 바텀 네비게이션 숨김
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720
      3. Assert: 바텀 네비게이션 NOT visible (hiddenFrom="md")
      4. Screenshot: .sisyphus/evidence/task-8-bottomnav-hidden.png
    Expected Result: 데스크톱에서 바텀 네비 안 보임
    Evidence: .sisyphus/evidence/task-8-bottomnav-hidden.png

  Scenario: 콘텐츠 가림 없음
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 375x667
      3. Scroll to: footer
      4. Assert: footer 콘텐츠가 바텀 네비에 가려지지 않음 (하단 패딩 존재)
      5. Screenshot: .sisyphus/evidence/task-8-no-overlap.png
    Expected Result: 콘텐츠와 바텀 네비 겹침 없음
    Evidence: .sisyphus/evidence/task-8-no-overlap.png

  Scenario: 기존 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test
      2. Assert: 모든 기존 테스트 패스
  ```

  **Commit**: YES
  - Message: `Add mobile bottom navigation bar with home, categories, search, and latest tabs`
  - Files: `components/layout/BottomNav.tsx` (new), `components/layout/DeviceLayout.tsx`
  - Pre-commit: `npm run build`

---

- [x] 9. 고아 컴포넌트 정리

  **What to do**:
  - 다음 미사용 컴포넌트 삭제:
    - `components/mobile/MobileMain.tsx` — 홈페이지에서 미사용 (page.tsx에서 import 안 됨)
    - `components/mobile/MobileHeader.tsx` — DeviceLayout에서 미사용 (Header.tsx로 통합됨)
    - `components/mobile/MobileFooter.tsx` — DeviceLayout에서 미사용 (Footer.tsx로 통합됨)
    - `components/desktop/DesktopMain.tsx` — 홈페이지에서 미사용
  - 삭제 전 반드시 `lsp_find_references`로 참조 확인
  - 참조가 있는 파일은 삭제하지 않음
  - `components/mobile/MobileArticleDetail.tsx`와 `components/desktop/DesktopArticleDetail.tsx`는 ArticleDetail.module.css를 import하므로 주의 — CSS 클래스가 실제로 사용되는지 확인 후 판단

  **Must NOT do**:
  - 참조가 있는 컴포넌트 삭제 금지
  - `components/shared/` 파일 삭제 금지
  - `components/layout/` 파일 삭제 금지
  - `components/home/` 파일 삭제 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순한 파일 삭제 작업, LSP 확인만 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/layout/DeviceLayout.tsx:1-26` — 현재 Header + Footer만 import. MobileHeader, MobileFooter 미사용 확인
  - `app/(main)/page.tsx:1-140` — 홈페이지. Headline, MainNews, PopularNews, CategorySection만 import. MobileMain, DesktopMain 미사용 확인

  **WHY Each Reference Matters**:
  - 고아 컴포넌트가 남아있으면 향후 작업자가 혼동할 수 있음. 깨끗한 코드베이스 유지

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 삭제 후 빌드 성공
    Tool: Bash
    Steps:
      1. npm run build
      2. Assert: exit code 0 (삭제한 파일이 실제로 미사용임 확인)
    Expected Result: 빌드 성공 = 참조 없음 확인

  Scenario: 기존 E2E 테스트 보존
    Tool: Bash
    Steps:
      1. npx playwright test
      2. Assert: 모든 테스트 패스
    Expected Result: 삭제한 컴포넌트가 E2E에서도 사용되지 않음 확인
  ```

  **Commit**: YES
  - Message: `Remove orphaned mobile/desktop components that are no longer imported`
  - Files: (삭제된 파일들)
  - Pre-commit: `npm run build`

---

- [ ] 10. 마이크로 애니메이션 및 최종 폴리싱

  **What to do**:
  - 전체 사이트에 일관된 마이크로 트랜지션 적용:
    - 링크 호버: color transition 150ms
    - 카드 호버: shadow + translateY transition 200ms
    - 버튼 호버/클릭: scale(0.98) + color transition 150ms
    - 페이지 간 전환: opacity fade 200ms (Next.js App Router 기본)
  - `globals.css`에 기본 transition 규칙 추가
  - 모든 페이지 최종 검수:
    - 데스크톱(1280px)과 모바일(375px) 양쪽 스크린샷 캡처
    - 모든 페이지에서 overflow-x 문제 없음 확인
    - 모든 링크의 터치 타겟 48px 이상 확인
    - 글꼴 크기가 모바일에서 16px 이상 확인
  - 검색 페이지 (`app/(main)/search/page.tsx`) 미세 디자인 조정
  - 로그인/회원가입 페이지 디자인 조정 (있다면)
  - 전체 빌드 + 전체 E2E 테스트 최종 확인

  **Must NOT do**:
  - 새 NPM 패키지 추가 금지 (CSS transitions만)
  - framer-motion 설치 금지
  - 과도한 애니메이션 금지 (뉴스 사이트는 콘텐츠 집중)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 디자인 폴리싱, 크로스 페이지 일관성
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: 마이크로 인터랙션, 디자인 폴리싱
    - `playwright`: 전체 사이트 스크린샷 캡처 및 검증

  **Parallelization**:
  - **Can Run In Parallel**: NO (최종 작업)
  - **Parallel Group**: Wave 4 (after all)
  - **Blocks**: None (final task)
  - **Blocked By**: All previous tasks

  **References**:

  **Pattern References**:
  - `app/globals.css` — 기본 transition 규칙 추가 위치
  - `app/(main)/search/page.tsx:1-257` — 검색 페이지 구현
  - `app/login/page.tsx`, `app/signup/page.tsx` — 로그인/회원가입 페이지

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 사이트 데스크톱 스크린샷
    Tool: Playwright (playwright skill)
    Steps:
      1. 각 페이지 순회: /, /politics, /economy, /society, /culture, /sports, /opinion, /search, /about
      2. Set viewport: 1280x720
      3. 각 페이지에서 full-page 스크린샷 캡처
      4. Assert: 모든 페이지 로딩 성공 (no error pages)
    Expected Result: 모든 페이지가 현대적으로 개선됨
    Evidence: .sisyphus/evidence/task-10-desktop-*.png

  Scenario: 전체 사이트 모바일 스크린샷
    Tool: Playwright (playwright skill)
    Steps:
      1. 각 페이지 순회: /, /politics, /search, /about
      2. Set viewport: 375x667
      3. 각 페이지에서 full-page 스크린샷 캡처
      4. Assert: overflow-x 문제 없음
      5. Assert: 바텀 네비 visible (모든 페이지)
    Expected Result: 모바일에서 모든 페이지 정상
    Evidence: .sisyphus/evidence/task-10-mobile-*.png

  Scenario: 최종 전체 빌드 + E2E 테스트
    Tool: Bash
    Steps:
      1. npm run build
      2. Assert: exit code 0
      3. npm run lint
      4. Assert: exit code 0
      5. npx playwright test
      6. Assert: 모든 약 94개 테스트 패스
    Expected Result: 전체 빌드와 테스트 성공
    Evidence: 빌드 로그, 테스트 결과
  ```

  **Commit**: YES
  - Message: `Add micro-animations and final design polish across all pages`
  - Files: `app/globals.css`, 기타 미세 조정 파일들
  - Pre-commit: `npm run build && npx playwright test`

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 1 | `Enhance theme tokens with improved typography, spacing, and shadow system` | theme.ts, globals.css | npm run build |
| 2 | `Redesign ArticleCard with larger thumbnails, hover effects, and modern card styling` | ArticleCard.tsx | npm run build + playwright |
| 3 | `Modernize homepage layout with asymmetric hero grid and improved sections` | page.tsx, home components | playwright homepage tests |
| 4 | `Improve category pages with hero article, responsive filters, and modern grid` | CategoryPageTemplate, category components | playwright category tests |
| 5 | `Redesign header with scroll-to-shrink behavior and improved mobile navigation` | Header.tsx | playwright navigation tests |
| 6 | `Redesign footer with multi-column layout and modern styling` | Footer.tsx | npm run build |
| 7 | `Improve article detail reading experience with better typography and layout` | ArticleDetail.module.css, ArticleDetail.tsx | playwright article tests |
| 8 | `Add mobile bottom navigation bar with home, categories, search, and latest tabs` | BottomNav.tsx (new), DeviceLayout.tsx | npm run build + playwright |
| 9 | `Remove orphaned mobile/desktop components that are no longer imported` | (deleted files) | npm run build |
| 10 | `Add micro-animations and final design polish across all pages` | globals.css, various | full playwright suite |

---

## Success Criteria

### Verification Commands
```bash
# Full build
npm run build                    # Expected: Exit code 0

# Lint
npm run lint                     # Expected: Exit code 0

# Full E2E suite
npx playwright test              # Expected: ~94 tests pass across 3 browsers

# Mobile bottom nav check
npx playwright test --grep "bottom"  # Expected: New tests pass
```

### Final Checklist
- [ ] 모든 "Must Have" 항목 구현됨
- [ ] 모든 "Must NOT Have" 가드레일 준수됨
- [ ] `npm run build` 성공
- [ ] `npm run lint` 성공
- [ ] 기존 E2E 테스트 전부 패스 (~94개)
- [ ] 모바일(375px) 바텀 네비게이션 정상 표시
- [ ] 데스크톱(1280px) 바텀 네비게이션 숨김
- [ ] 모든 ARIA 라벨 보존
- [ ] 모든 시맨틱 HTML 보존
- [ ] admin 관련 파일 무수정
- [ ] API/데이터 관련 파일 무수정
