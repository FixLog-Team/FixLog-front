# FixLog v0 웹 디자인 리뉴얼 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v0 `fixlog-product-design` 디자인을 현재 Vite+React Router+FSD 코드베이스에 이식한다. 에디터 본문은 기존 BlockNote를 보존하고 나머지는 v0 디자인을 따른다.

**Architecture:** 공통 `AppShell`(v0 사이드바 + 메인)을 만들고, 각 라우트 페이지가 이를 감싼다. 디자인 토큰을 v0 팔레트로 교체하고 shared/ui 컴포넌트를 구축한 뒤 페이지를 하나씩 리디자인/신규 생성한다. BlockNote 위젯은 그대로 재사용한다.

**Tech Stack:** React 19, React Router v7, TypeScript, Tailwind v4, shadcn 토큰, lucide-react, BlockNote(@blocknote/react·shadcn), Inter(Google Fonts).

## 검증 방식 (이 계획의 "테스트")

이 작업은 시각적 UI 이식이라 단위테스트 대신 아래를 각 태스크의 검증 사이클로 사용한다:
- **Typecheck/build**: `npm run build` (= `tsc && vite build`) 통과 — 타입/임포트 오류 없음.
- **Dev 스모크**: `npm run dev` 후 브라우저(claude-in-chrome)로 해당 라우트를 열어 렌더 확인. v0 배포(https://fixlog-product-design.vercel.app)와 시각 대조.
- **BlockNote 기능 보존**: 에디터 라우트에서 슬래시 메뉴/블록 조작 동작 확인.

## Global Constraints

- 색상 토큰(정확값): Background `#F5F5F7`, Surface `#FFFFFF`, Border `#E4E4E7`, Primary text `#1D1D1F`, Secondary text `#6E6E73`, Accent `#0A6CFF`.
- 폰트: Inter (Google Fonts CDN). 타이포 스케일 — Page title 36/600/-0.022em, Section 24/600, Body 16/400/1.7, Caption 13/400.
- 라이트 모드 전용(이번 범위). `.dark` 블록은 미사용으로 유지.
- **에디터 "문서 작성 영역"은 `widgets/document-editor`(BlockNote)를 교체하지 않는다.** 테마/오버라이드만 조정.
- 절대경로 import(`@/` alias)만 사용. 컴포넌트 PascalCase, 파일명 일치. 컴포넌트 내부 선언 순서 state→hooks→variables→functions→effects→return.
- 커밋 메시지: `[type] [KAN-xxx] summary` 규칙(브랜치에 이슈번호 없으면 `[type] summary`). 커밋은 각 태스크 끝에서.
- v0 원본은 Next.js — 파일 복사 금지, FSD 구조로 재구성.

---

## 파일 구조 맵

**토큰/전역**
- Modify: `index.html` — Inter Google Fonts `<link>` 추가.
- Modify: `src/app/styles/globals.css` — `:root` 팔레트 v0 교체, body font Inter, BlockNote 오버라이드 accent 조정.

**shared/ui** (신규/확장)
- Modify: `src/shared/ui/button.tsx` — variants primary/secondary/ghost/link.
- Create: `src/shared/ui/badge.tsx` — status/tag/match.
- Modify: `src/shared/ui/card.tsx` — surface+hairline.
- Create: `src/shared/ui/input.tsx` — text/search input.
- Create: `src/shared/ui/avatar.tsx` — 이니셜 아바타.
- Create: `src/shared/ui/logo.tsx` — FixLog 로고.

**widgets**
- Create: `src/widgets/app-shell/ui/AppShell.tsx` + `index.ts`.
- Rewrite: `src/widgets/sidebar/ui/Sidebar.tsx` — v0 사이드바.
- Rewrite: `src/widgets/document-header/ui/DocumentHeader.tsx` — 목록/상세 헤더.
- Rewrite: `src/widgets/document-list-section/ui/DocumentListSection.tsx` — v0 테이블.
- Create: `src/widgets/ai-summary-panel/ui/AiSummaryPanel.tsx` + `index.ts`.
- Create: `src/widgets/document-history-panel/ui/DocumentHistoryPanel.tsx` + `index.ts`.
- Create: `src/widgets/search-results/ui/SearchResults.tsx` + `index.ts`.
- Keep: `src/widgets/document-editor/ui/DocumentEditor.tsx` (BlockNote).

**pages**
- Create: `src/pages/landing/ui/LandingPage.tsx`.
- Create: `src/pages/workspace-home/ui/WorkspaceHomePage.tsx`.
- Rewrite: `src/pages/document-list/ui/DocumentListPage.tsx`.
- Rewrite: `src/pages/document-editor/ui/DocumentEditorPage.tsx` (또는 document-detail).
- Rewrite: `src/pages/document-history/ui/DocumentHistoryPage.tsx`.
- Rewrite: `src/pages/search/ui/SearchPage.tsx`.
- Create: `src/pages/settings/ui/SettingsPage.tsx`.

**routing/data**
- Modify: `src/shared/constants/routes.ts` — WORKSPACE/SETTINGS/LANDING 추가, HOME 의미 변경.
- Modify: `src/app/router/index.tsx` — 라우트 재구성.
- Modify(필요 시): `src/domains/documents`·`domains/folders` mock/타입 — 작성자/태그/status/updated 필드 확장.

---

## Task 1: 디자인 토큰 & Inter 폰트 기반

**Files:**
- Modify: `index.html`
- Modify: `src/app/styles/globals.css`

**Interfaces:**
- Produces: CSS 변수 `--background/--foreground/--card/--border/--primary/--muted-foreground` 등이 v0 값. Tailwind 클래스 `bg-background`, `text-foreground`, `text-primary`, `bg-primary`, `border-border` 사용 가능. body 기본 폰트 Inter.

- [ ] **Step 1: index.html에 Inter 로드**

`<head>`에 추가:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: globals.css `:root` 팔레트 교체**

`:root`의 색상 토큰을 v0 값(hex)으로 교체(oklch 제거). 최소 매핑:
```css
--background: #F5F5F7;
--foreground: #1D1D1F;
--card: #FFFFFF;
--card-foreground: #1D1D1F;
--popover: #FFFFFF;
--popover-foreground: #1D1D1F;
--primary: #0A6CFF;
--primary-foreground: #FFFFFF;
--secondary: #FFFFFF;
--secondary-foreground: #1D1D1F;
--muted: #F5F5F7;
--muted-foreground: #6E6E73;
--accent: #EFF4FF;            /* accent 연한 배경(사이드바 active 등) */
--accent-foreground: #0A6CFF;
--border: #E4E4E7;
--input: #E4E4E7;
--ring: #0A6CFF;
--sidebar: #FFFFFF;
--sidebar-foreground: #1D1D1F;
--sidebar-accent: #EFF4FF;
--sidebar-accent-foreground: #0A6CFF;
--sidebar-border: #E4E4E7;
```
BlockNote 오버라이드 토큰(`--bn-*`)은 유지.

- [ ] **Step 3: body 폰트 Inter로 변경**

`body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif; }`

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: PASS (타입/CSS 오류 없음).

- [ ] **Step 5: 커밋**

```bash
git add index.html src/app/styles/globals.css
git commit -m "[refactor] v0 디자인 토큰 및 Inter 폰트 적용"
```

---

## Task 2: shared/ui 컴포넌트 세트

**Files:**
- Modify: `src/shared/ui/button.tsx`, `src/shared/ui/card.tsx`
- Create: `src/shared/ui/badge.tsx`, `src/shared/ui/input.tsx`, `src/shared/ui/avatar.tsx`, `src/shared/ui/logo.tsx`

**Interfaces:**
- Produces:
  - `Button({ variant?: 'primary'|'secondary'|'ghost'|'link', size?, ...props })`
  - `Badge({ variant: 'published'|'in-review'|'draft'|'tag'|'match', children })`
  - `Card({ className?, children })` (surface + border + rounded)
  - `Input({ icon?, ...props })`, `SearchInput` 파생
  - `Avatar({ name: string, size? })` — 이니셜 원형
  - `Logo({ withWordmark?: boolean })`

- [ ] **Step 1: Button variants 구현**

v0 스타일: primary=blue(`bg-primary text-white hover:opacity-90 rounded-full`), secondary=흰 배경+border, ghost=투명+hover 연회색, link=blue 텍스트. `class-variance-authority` 사용(이미 의존성 존재).

- [ ] **Step 2: Badge 구현**

status 배지는 점(dot)+텍스트: published=green, in-review=amber, draft=gray. tag=연회색 pill. match=blue dot + `NN% match`.

- [ ] **Step 3: Card / Input / Avatar / Logo 구현**

- Card: `bg-card border border-border rounded-xl`.
- Input: hairline border, focus ring accent, 좌측 아이콘 슬롯(sparkle 등).
- Avatar: 이름 이니셜 2글자, 원형, 배경 짙은 색/이니셜 흰색.
- Logo: 파란 rounded square 아이콘(lucide `FileText`/`BookText`) + "FixLog" 워드마크.

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/shared/ui
git commit -m "[feat] v0 디자인 공통 UI 컴포넌트 추가"
```

---

## Task 3: AppShell + v0 Sidebar

**Files:**
- Create: `src/widgets/app-shell/ui/AppShell.tsx`, `src/widgets/app-shell/index.ts`
- Rewrite: `src/widgets/sidebar/ui/Sidebar.tsx`
- Modify: `src/widgets/sidebar/index.ts`
- Modify(참고): `src/shared/constants/routes.ts` (Task 9와 연동되나 Sidebar 링크에 필요한 경로 상수 우선 사용)

**Interfaces:**
- Consumes: shared/ui(Avatar, Logo), 기존 folders 훅(`useRootFolders`).
- Produces:
  - `AppShell({ children, header? })` — `<div flex h-screen><Sidebar/><main flex-1 flex-col>{header}{children}</main></div>`
  - `Sidebar()` — props 없이 현재 라우트 기반 active 표시(`useLocation`). 워크스페이스 스위처(상단), 네비 6개, FOLDERS 섹션(기존 폴더 훅 재사용), 프로필(하단).

- [ ] **Step 1: Sidebar 재작성**

v0 구조:
- 상단 워크스페이스 스위처: Avatar("A") + "Acme Workspace" + "Acme Logistics, Inc." + chevron.
- 네비 리스트: Home→`/workspace`, AI Search→`/search`, Documents→`/documents`, Recent→`/documents?view=recent`, Favorites→`/documents?view=favorites`, Settings→`/settings`. 각 항목 lucide 아이콘. active = `bg-sidebar-accent text-sidebar-accent-foreground`.
- FOLDERS 섹션 헤더(+버튼) + 폴더 목록(# 아이콘). 기존 `useRootFolders`(mock)로 채우되 표시는 flat 목록으로 단순화.
- 하단 프로필: Avatar + 이름 + 이메일.
- `react-router-dom`의 `Link`/`NavLink` 사용, active는 `useLocation().pathname` 비교.

- [ ] **Step 2: AppShell 작성**

`AppShell`은 Sidebar + `<main className="flex-1 flex flex-col overflow-hidden bg-background">`. `header` prop(선택)을 main 상단에 렌더, `children`은 그 아래 스크롤 영역.

- [ ] **Step 3: 빌드 검증 + 임시 라우트 스모크**

Run: `npm run build` → PASS.
`npm run dev` 후 아무 앱 페이지에서 사이드바 렌더 확인(다음 태스크에서 실제 연결).

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/app-shell src/widgets/sidebar
git commit -m "[feat] v0 AppShell 및 사이드바 구현"
```

---

## Task 4: 문서 목록 `/documents` 리디자인

**Files:**
- Rewrite: `src/pages/document-list/ui/DocumentListPage.tsx`
- Rewrite: `src/widgets/document-header/ui/DocumentHeader.tsx`
- Rewrite: `src/widgets/document-list-section/ui/DocumentListSection.tsx`
- Modify(필요 시): `src/domains/folders` mock/타입(작성자/태그/status/updated/items 수).

**Interfaces:**
- Consumes: `AppShell`, shared/ui(Badge, Avatar, Input, Button), folders 훅/mock.
- Produces: `DocumentListPage()` — `AppShell`로 감싼 목록 화면.

- [ ] **Step 1: mock 데이터 확장**

`domains/folders`/`documents` mock에 v0 테이블 표시용 필드 보강: 문서 `owner{name}`, `tags[]`, `status:'published'|'in-review'|'draft'`, `updatedLabel`; 폴더 `itemCount`, `updatedLabel`. 타입도 함께 확장.

- [ ] **Step 2: DocumentHeader(목록 모드) 재작성**

브레드크럼(Workspace › Folder › …) + 우측 `New Folder`(secondary) / `New Document`(primary) 버튼. props: `breadcrumb`, `onCreateFolder`, `onCreateDocument`.

- [ ] **Step 3: DocumentListSection 재작성**

- 상단: SearchInput("Search this workspace…") + Filter/Sort 버튼.
- 힌트 배너: sparkle + "Not sure where a document lives? Use AI Search to find it by meaning."(AI Search 링크).
- 테이블 헤더: Name / Type / Owner / Last updated / Status.
- 폴더 행(폴더 아이콘+이름 / Folder / — / updated / `N items`), 문서 행(문서 아이콘+제목+태그 / Document / Owner 아바타+이름 / updated / status 배지).
- 행 클릭: 폴더=진입, 문서=`/documents/:id` 이동.

- [ ] **Step 4: DocumentListPage 재작성**

기존 folders 로딩 로직 유지, 렌더를 `AppShell header={<DocumentHeader .../>}` + `DocumentListSection`으로 교체. Sidebar/progress bar 관련 기존 마크업 제거(AppShell이 대체).

- [ ] **Step 5: 빌드 + 브라우저 스모크**

Run: `npm run build` → PASS.
`npm run dev` → `/documents` 열어 v0 배포와 대조(사이드바/테이블/배지/배너).

- [ ] **Step 6: 커밋**

```bash
git add src/pages/document-list src/widgets/document-header src/widgets/document-list-section src/domains
git commit -m "[feat] 문서 목록 페이지 v0 디자인 적용"
```

---

## Task 5: 에디터 `/documents/:documentId` (헤더+메타+AI 패널 v0 / 본문 BlockNote 유지)

**Files:**
- Create: `src/widgets/ai-summary-panel/ui/AiSummaryPanel.tsx`, `index.ts`
- Rewrite: `src/pages/document-editor/ui/DocumentEditorPage.tsx`
- Modify: `src/widgets/document-header/ui/DocumentHeader.tsx` (상세 모드 지원)
- Keep(불변): `src/widgets/document-editor/ui/DocumentEditor.tsx`

**Interfaces:**
- Consumes: `DocumentEditor`(BlockNote, 불변), shared/ui, `useParams`.
- Produces:
  - `AiSummaryPanel({ open, onClose })` — SUMMARY/KEY DECISIONS/ACTION ITEMS/RELATED DOCUMENTS + 하단 Ask 입력.
  - `DocumentHeader`에 상세 모드 props: `mode:'detail'`, `title` 브레드크럼 + 별/Share/Summarize/More.

- [ ] **Step 1: DocumentHeader 상세 모드 추가**

`mode?: 'list' | 'detail'`. detail일 때: 브레드크럼 + 우측 `Add to favorites`(별) / `Share` / `Summarize`(primary, sparkle) / `More`(…). `onSummarize` 콜백.

- [ ] **Step 2: AiSummaryPanel 작성**

우측 고정폭(약 360px) 패널. 헤더 "Document AI" + 닫기. 섹션: SUMMARY(문단), KEY DECISIONS(불릿), ACTION ITEMS(체크 가능 칩), RELATED DOCUMENTS(문서 링크). 하단: "Ask anything about this document…" 입력 + Ask 버튼. mock 콘텐츠로 채움.

- [ ] **Step 3: DocumentEditorPage 재작성**

레이아웃:
```
AppShell(header=<DocumentHeader mode="detail" onSummarize=toggle/>)
  └ flex: [본문 영역(스크롤, 중앙 max-w-3xl)] [AiSummaryPanel(open일 때)]
       본문 상단: 제목(h1 Page title) + 메타(Avatar+작성자 · Updated 날짜 · 폴더경로 · Status 배지)
       그 아래: <DocumentEditor />  ← BlockNote 그대로
```
`open` state로 AI 패널 토글(Summarize 버튼). BlockNote 위젯은 import만 하고 수정하지 않는다.

- [ ] **Step 4: 빌드 + 스모크 + BlockNote 기능 확인**

Run: `npm run build` → PASS.
`npm run dev` → `/documents/<mock-id>` 열어: v0 헤더/메타/AI 패널 확인 + **BlockNote 슬래시 메뉴·블록 편집 동작 확인**.

- [ ] **Step 5: 커밋**

```bash
git add src/widgets/ai-summary-panel src/pages/document-editor src/widgets/document-header
git commit -m "[feat] 에디터 헤더·AI요약 패널 v0 적용 (본문 BlockNote 유지)"
```

---

## Task 6: AI 검색 `/search` 리디자인

**Files:**
- Create: `src/widgets/search-results/ui/SearchResults.tsx`, `index.ts`
- Rewrite: `src/pages/search/ui/SearchPage.tsx`
- Consumes: `domains/documents` `searchDocuments` mock.

**Interfaces:**
- Produces: `SearchPage()` — AppShell(header="AI Search") + 대화형 결과 + 하단 입력.
  - `SearchResults({ results })` — 결과 카드 목록.

- [ ] **Step 1: SearchResults 작성**

결과 카드: 문서 아이콘 + 제목 + 폴더경로 + 설명 + 태그 + `NN% match`(우상단) + 하단(작성자 아바타·Updated 날짜 · `Open document`→`/documents/:id`).

- [ ] **Step 2: SearchPage 작성**

- 상단: 사용자 쿼리 버블(우측 정렬, blue) + AI 응답 문장.
- 결과 목록(`SearchResults`).
- 하단 고정 입력: "Ask FixLog to find a document…" + 전송 + 추천 칩. 입력 시 `searchDocuments` mock 호출로 결과 갱신.

- [ ] **Step 3: 빌드 + 스모크**

Run: `npm run build` → PASS. `/search` 대조.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/search-results src/pages/search
git commit -m "[feat] AI 검색 페이지 v0 디자인 적용"
```

---

## Task 7: 히스토리 `/documents/:documentId/history` 리디자인

**Files:**
- Create: `src/widgets/document-history-panel/ui/DocumentHistoryPanel.tsx`, `index.ts`
- Rewrite: `src/pages/document-history/ui/DocumentHistoryPage.tsx`

**Interfaces:**
- Produces: `DocumentHistoryPage()` — AppShell + 버전 목록. `DocumentHistoryPanel({ versions, onRestore })`.

- [ ] **Step 1: DocumentHistoryPanel 작성**

v0 토큰/Card로 신규 디자인. 각 버전 항목: 시각(캡션) + 작성자 아바타/이름 + 변경 요약 + `Restore`(secondary) 버튼. 최신순. mock versions 사용.

- [ ] **Step 2: DocumentHistoryPage 작성**

AppShell(header: 브레드크럼 "… › History") + 좌측 문서 제목/설명 + 버전 목록. `onRestore`는 콘솔 로그(기능 범위 외).

- [ ] **Step 3: 빌드 + 스모크**

Run: `npm run build` → PASS. `/documents/<id>/history` 렌더 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/document-history-panel src/pages/document-history
git commit -m "[feat] 문서 히스토리 페이지 v0 디자인 적용"
```

---

## Task 8: Home 대시보드 `/workspace` + 설정 `/settings` (신규)

**Files:**
- Create: `src/pages/workspace-home/ui/WorkspaceHomePage.tsx`
- Create: `src/pages/settings/ui/SettingsPage.tsx`

**Interfaces:**
- Produces: `WorkspaceHomePage()`, `SettingsPage()` — 둘 다 AppShell 사용.

- [ ] **Step 1: WorkspaceHomePage 작성**

AppShell(header: "Home" + New Document). 중앙: 인사말("Good afternoon, {name}") + "What are you looking for?" + 대형 AI 검색 입력 + 추천 칩 + 빠른 액션 3카드(New Document/New Folder/Import Documents) + Recent/Pinned 2열(mock).

- [ ] **Step 2: SettingsPage 작성**

AppShell(header: "Workspace Settings"). Card: Workspace profile(이름/회사/배포유형/리전/환경 배지) + Infrastructure(Dedicated database/storage/Private URL/Backup status — 각 아이콘+제목+설명+Active 배지). mock.

- [ ] **Step 3: 빌드 + 스모크**

Run: `npm run build` → PASS. `/workspace`, `/settings` 대조.

- [ ] **Step 4: 커밋**

```bash
git add src/pages/workspace-home src/pages/settings
git commit -m "[feat] Home 대시보드 및 설정 페이지 신규 생성"
```

---

## Task 9: 라우팅 재구성 + 랜딩 `/` (신규) + 최종 연결

**Files:**
- Create: `src/pages/landing/ui/LandingPage.tsx`
- Modify: `src/shared/constants/routes.ts`
- Modify: `src/app/router/index.tsx`

**Interfaces:**
- Consumes: 모든 페이지 컴포넌트.
- Produces: 최종 라우트 트리.

- [ ] **Step 1: routes.ts 갱신**

```ts
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  LOGIN_CALLBACK: '/login/callback',
  WORKSPACE: '/workspace',
  DOCUMENTS: '/documents',
  DOCUMENT_EDITOR: '/documents/:documentId',
  DOCUMENT_HISTORY: '/documents/:documentId/history',
  SEARCH: '/search',
  SETTINGS: '/settings',
} as const;
export const documentDetailPath = (id: string) => `/documents/${id}`;
export const documentHistoryPath = (id: string) => `/documents/${id}/history`;
```

- [ ] **Step 2: LandingPage 작성**

자체 마케팅 네비(FixLog 로고 / Product·How it works·Security·Design system / Sign in·Try FixLog) + Hero(배지 + 헤드라인 "Find and understand your company documents faster." + 서브카피 + CTA Try FixLog/View Demo + 제품 프리뷰 목업) + 이하 v0 섹션. AppShell 미사용. CTA는 `/workspace` 또는 `/login`으로.

- [ ] **Step 3: router/index.tsx 재구성**

각 ROUTES에 lazy 컴포넌트 연결: LANDING→LandingPage, WORKSPACE→WorkspaceHomePage, DOCUMENTS→DocumentListPage, DOCUMENT_EDITOR→DocumentEditorPage, DOCUMENT_HISTORY→DocumentHistoryPage, SEARCH→SearchPage, SETTINGS→SettingsPage, LOGIN/CALLBACK→기존.

- [ ] **Step 4: 전체 빌드 + 전 라우트 스모크**

Run: `npm run build` → PASS.
`npm run dev` → `/`, `/workspace`, `/documents`, `/documents/:id`, `/documents/:id/history`, `/search`, `/settings` 순회 렌더 + 사이드바 네비 이동 확인 + BlockNote 재확인.

- [ ] **Step 5: 커밋**

```bash
git add src/pages/landing src/shared/constants/routes.ts src/app/router
git commit -m "[feat] 랜딩 페이지 추가 및 라우팅 재구성"
```

---

## Self-Review (spec 대비 커버리지)

- 토큰/폰트(spec §2) → Task 1 ✅
- shared/ui(spec §4) → Task 2 ✅
- AppShell·Sidebar(spec §5) → Task 3 ✅
- 문서 목록(spec §6.3) → Task 4 ✅
- 에디터+AI패널+BlockNote 보존(spec §6.4) → Task 5 ✅
- AI 검색(spec §6.6) → Task 6 ✅
- 히스토리(spec §6.5) → Task 7 ✅
- Home 대시보드·설정(spec §6.2·6.7) → Task 8 ✅
- 랜딩·라우팅(spec §6.1·§3) → Task 9 ✅
- 범위 외(§8): design-system/실API/다크모드/버전비교/로그인 리디자인 — 태스크 없음(의도적) ✅
- 데이터 계층(§7): mock 확장 → Task 4 Step 1 ✅
