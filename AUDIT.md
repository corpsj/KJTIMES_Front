# 광전타임즈 프로덕션 감사 결과

## 🔴 Critical

### 1. PREVIEW_MODE = true (middleware.ts)
- 메인 페이지 → /special-edition 리다이렉트
- 카테고리 페이지 등 접근 차단
- **수정**: PREVIEW_MODE = false로 변경

### 2. 회사소개 더미 데이터
- about: 전화번호 "010-1234-5678", 이메일 "test@kjtimes.co.kr"
- Footer: 실제 정보 기입됨 → 일관성 필요

### 3. 구독 페이지 미구현
- subscribe: "구독하기" 버튼만 있고 기능 없음

## 🟡 기능 보완

### 4. 기사 상세 페이지 (287줄)
- 관련 기사, 소셜 공유, 이전/다음 기사 네비게이션 확인 필요

### 5. 검색 페이지
- 검색 기능 동작 확인 필요

### 6. 카테고리 페이지
- 페이지네이션 없음 (limit 30 고정)
- 정렬 옵션 없음

### 7. 에디터 (write)
- 1267줄 — 이미 자동저장, 썸네일 선택, D&D 이미지 구현됨
- 검증 필요

### 8. 기사 데스크 (articles)
- 788줄 — 페이지네이션, 통계, 복제 구현됨
- 검증 필요

## 🟢 디자인/UX

### 9. 메인 페이지 (DesktopMain)
- 3컬럼 레이아웃 — 기사 없으면 빈 페이지
- 빈 상태 UI 필요

### 10. 모바일
- MobileMain, MobileHeader, MobileFooter 존재
- 실제 사용성 검증 필요

### 11. Footer
- 실제 사업자 정보 기입됨 (함평군, 등록번호 등) — OK

### 12. SEO
- sitemap, robots.ts, news-sitemap 존재
- OG 태그/JSON-LD 확인 필요

## 파일 수정 범위 (충돌 방지용)

### 에이전트 A: 미들웨어 + 공개 페이지 + SEO
- middleware.ts (PREVIEW_MODE 해제)
- app/(main)/*.tsx (about, subscribe, search 등)
- app/(main)/page.tsx (빈 상태 UI)
- components/home/*.tsx
- components/layout/CategoryPageTemplate.tsx
- app/sitemap.ts, app/robots.ts

### 에이전트 B: 기사 상세 + 모바일 UX
- components/desktop/DesktopArticleDetail.tsx
- components/mobile/MobileArticleDetail.tsx
- components/mobile/MobileMain.tsx
- components/mobile/MobileHeader.tsx
- components/mobile/MobileFooter.tsx
- app/(main)/article/[id]/page.tsx

### 에이전트 C: CMS 관리자 영역
- app/admin/articles/page.tsx
- app/admin/write/page.tsx
- app/admin/media/page.tsx
- app/admin/page.tsx (대시보드)
- components/admin/RichTextEditor.tsx
