# FixLog 웹 디자인 리뉴얼 (v0 적용) — 설계 문서

- 작성일: 2026-07-07
- 브랜치: `feature/apply-new-web-design`
- 기준 디자인: v0 `fixlog-product-design` (배포: https://fixlog-product-design.vercel.app)

---

## 1. 목표

v0에서 완성된 FixLog 제품 디자인(Apple 디자인 시스템 기반, 미니멀)을 현재 코드베이스에 이식한다.

- **기존 페이지**는 디자인만 v0에 맞춰 변경한다.
- **없는 페이지**는 v0 디자인을 따라 신규 생성한다.
- **에디터 페이지의 "문서 작성 영역"은 현재 브랜치의 BlockNote 기반 구현을 유지**한다. 그 외(헤더, 히스토리, AI 문서 요약)는 v0 디자인을 따른다.

### 제약: 스택 차이

- v0 원본: **Next.js(App Router)**
- 현재 앱: **Vite + React Router v7 + FSD(Feature-Sliced Design) + Tailwind v4 + shadcn 토큰 + BlockNote**
- → v0 파일을 그대로 복사할 수 없다. 화면/디자인을 **현재 FSD 구조에 맞게 재구성**한다.

---

## 2. 디자인 토큰 & 타이포그래피

### 2.1 색상 (v0 팔레트 전면 적용)

`src/app/styles/globals.css`의 `:root` 토큰을 아래 값으로 교체한다. 기존 shadcn oklch 중성 팔레트 → v0 팔레트.

| 토큰                 | 값        | 용도                     |
| -------------------- | --------- | ------------------------ |
| Background           | `#F5F5F7` | 앱 배경 (soft off-white) |
| Surface              | `#FFFFFF` | 카드/패널/표면           |
| Border               | `#E4E4E7` | hairline 보더            |
| Primary text         | `#1D1D1F` | 본문/제목                |
| Secondary text       | `#6E6E73` | 보조 텍스트/캡션         |
| Accent (FixLog blue) | `#0A6CFF` | 모든 인터랙티브 요소     |

- 상태 배지: Published(green), In review(amber), Draft(gray), match%(blue dot).
- shadcn 토큰 매핑: `--background`, `--foreground`, `--card`, `--border`, `--primary`(= accent blue), `--muted-foreground`(= secondary) 등을 위 값으로 재정의한다. Tailwind v4 `@theme inline` 매핑은 유지.
- 다크모드: v0 배포는 라이트 기준. 이번 범위는 **라이트 전용**으로 진행하고 `.dark` 블록은 후순위(그대로 두되 미사용).

### 2.2 타이포그래피 (Inter)

- 폰트: **Inter** — Google Fonts CDN으로 로드 (`index.html`에 `<link>` 추가), `body` font-family를 Inter 우선으로 변경.
- 스케일:
  - Page title: 36px / 600 / letter-spacing -0.022em
  - Section title: 24px / 600
  - Body: 16px / 400 / line-height 1.7
  - Caption: 13px / 400

---

## 3. 라우팅 맵

`src/shared/constants/routes.ts` 및 `src/app/router/index.tsx` 갱신.

| 경로                             | 페이지            | 상태                                                | 셸                     |
| -------------------------------- | ----------------- | --------------------------------------------------- | ---------------------- |
| `/`                              | Landing (마케팅)  | **신규**                                            | 없음(자체 마케팅 네비) |
| `/login`, `/login/callback`      | 로그인            | 기존 유지(기능)                                     | 없음                   |
| `/workspace`                     | Home 대시보드     | **신규**                                            | AppShell               |
| `/documents`                     | 문서 목록(테이블) | 리디자인                                            | AppShell               |
| `/documents/:documentId`         | 문서 상세/에디터  | 리디자인(헤더·AI·히스토리 v0 / 본문 BlockNote 유지) | AppShell(내부)         |
| `/documents/:documentId/history` | 문서 히스토리     | 리디자인(신규 디자인)                               | AppShell               |
| `/search`                        | AI 검색(대화형)   | 리디자인(현재 스텁)                                 | AppShell               |
| `/settings`                      | 워크스페이스 설정 | **신규**                                            | AppShell               |

- **라우팅 변경 핵심**: 현재 `/`(HOME)는 DocumentListPage를 렌더 → 앞으로 `/`는 **랜딩**, 문서 목록은 `/documents`로 이동. 앱 진입 후 홈은 `/workspace`.
- v0의 `/editor`는 우리 앱에서 `/documents/:documentId`로 대응(파라미터 유지).
- v0 사이드바 링크 기준: Home→`/workspace`, AI Search→`/search`, Documents→`/documents`, Recent→`/documents?view=recent`, Favorites→`/documents?view=favorites`, Settings→`/settings`.

---

## 4. 공통 컴포넌트 (shared/ui)

작고 일관된 v0 컴포넌트 세트를 `src/shared/ui`에 구축/보강한다.

- `Button` — variants: `primary`(blue) / `secondary` / `ghost` / `text-link`. (기존 button.tsx 확장)
- `Badge` — `status`(published/in-review/draft) / `tag` / `match`(%).
- `Card` — surface + hairline border + radius. (기존 card.tsx 확장)
- `Input` / `SearchInput` — 검색/폼 인풋, sparkle 아이콘 옵션.
- `Avatar` — 이니셜 원형(사용자/작성자).
- `Logo` — FixLog 로고(파란 아이콘 + 워드마크).

아이콘: 기존 `lucide-react` 유지.

---

## 5. 위젯 (widgets) — 앱 셸

기존 FSD의 빈 위젯 폴더를 채운다.

- `widgets/app-shell` — **신규**. `AppShell`: 좌측 Sidebar + 우측 메인 영역 레이아웃(사이드바 고정폭, 메인 스크롤). 앱 페이지 공통 래퍼.
- `widgets/sidebar` — **전면 교체**. v0 사이드바:
  - 상단: 워크스페이스 스위처(아바타 + 이름 + 회사 + chevron)
  - 네비: Home / AI Search / Documents / Recent / Favorites / Settings (active 상태 = 연한 blue 배경 + blue 텍스트)
  - FOLDERS 섹션: 폴더 목록(#아이콘) + 추가(+) 버튼
  - 하단: 사용자 프로필(아바타 + 이름 + 이메일)
  - 현재 Sidebar의 폴더 트리/데이터 훅(`useRootFolders` 등)은 FOLDERS 섹션에 재사용.
- `widgets/document-header` — 목록/상세용 상단 헤더. 목록: 브레드크럼 + New Folder/New Document. 상세: 브레드크럼 + 별(즐겨찾기) + Share + Summarize + More.
- `widgets/document-list-section` — 문서/폴더 테이블(Name/Type/Owner/Last updated/Status). 검색바 + AI Search 힌트 배너 포함.
- `widgets/ai-summary-panel` — **Document AI 패널**: SUMMARY / KEY DECISIONS / ACTION ITEMS / RELATED DOCUMENTS + 하단 "Ask anything…" 입력. Summarize 토글로 열고 닫음.
- `widgets/document-history-panel` — 히스토리 목록(버전 카드 + 롤백 버튼). v0 디자인 언어로 신규 구성.
- `widgets/search-results` — AI 검색 결과 카드 목록.
- `widgets/document-editor` — **유지**. BlockNote 기반 본문(현재 구현). 토큰 변경에 맞춰 BlockNote 테마/오버라이드만 조정, 편집 기능·구조는 보존.

---

## 6. 페이지별 설계

### 6.1 Landing `/` (신규)

- 마케팅 네비: FixLog 로고 · Product / How it works / Security / Design system · Sign in / Try FixLog(blue).
- Hero: 배지("Off-premises AI Document Platform") + 대형 헤드라인 "Find and understand your company documents faster." + 서브카피 + CTA(Try FixLog / View Demo) + 하단 제품 프리뷰 목업.
- 이후 섹션(features 등)은 v0 랜딩을 따라 구성.

### 6.2 Home 대시보드 `/workspace` (신규)

- 상단 헤더: "Home" + New Document.
- 중앙: 인사말("Good afternoon, {name}") + "What are you looking for?" + 대형 AI 검색 입력 + 추천 칩.
- 빠른 액션 3개: New Document / New Folder / Import Documents.
- 하단: Recent documents + Pinned(고정) 2열.

### 6.3 문서 목록 `/documents` (리디자인)

- AppShell 내부. 헤더(브레드크럼 + New Folder/New Document).
- 검색바 + "Not sure where a document lives? Use AI Search" 힌트 배너.
- 테이블: 폴더 행(폴더 아이콘 + 이름 + items 수) / 문서 행(문서 아이콘 + 제목 + 태그 + Type + Owner 아바타 + Last updated + Status 배지).
- 기존 folders 데이터 훅/mock 재사용.

### 6.4 문서 상세/에디터 `/documents/:documentId` (리디자인 + 본문 유지)

- 상단 v0 헤더: 브레드크럼 + 별 + Share + **Summarize** + More.
- 본문 영역 상단: 제목 + 메타(작성자 아바타/이름 · Updated 날짜 · 폴더 경로 · Status 배지) — v0 스타일.
- **문서 작성 영역**: 현재 `widgets/document-editor`의 **BlockNote 유지**(교체 금지). 메타 아래에 BlockNote 본문 배치.
- 우측 **Document AI 패널**(ai-summary-panel): Summarize 버튼으로 토글.
- 레이아웃: 좌(본문 max-width 중앙 정렬) / 우(AI 패널 고정폭). 패널 닫으면 본문 전체폭.

### 6.5 문서 히스토리 `/documents/:documentId/history` (리디자인)

- v0 디자인 언어(카드 + hairline)로 버전 목록 구성. 각 항목: 버전 시각/작성자/요약 + **롤백** 버튼.
- (히스토리는 v0 배포에 전용 화면이 없어 v0 토큰/컴포넌트로 신규 디자인. 비교 UI는 MVP 제외.)

### 6.6 AI 검색 `/search` (리디자인)

- 대화형: 사용자 쿼리 버블(blue) + AI 응답 텍스트 + 결과 카드 목록(제목/폴더경로/설명/태그/match%/작성자·날짜/Open document).
- 하단 고정 입력: "Ask FixLog to find a document…" + 추천 칩.
- 기존 `searchDocuments` mock 재사용해 결과 채움.

### 6.7 설정 `/settings` (신규)

- 워크스페이스 설정 카드: Workspace profile(이름/회사/배포유형/리전/환경 배지) + Infrastructure(DB/Storage/URL/Backup 상태 리스트, Active 배지).

---

## 7. 데이터 계층

- 이번 작업은 **디자인/UI 이식**이 목표. 기존 mock(`domains/documents`, `domains/folders`)을 재사용하고, v0 화면에 필요한 필드(작성자, 태그, status, 폴더경로, updated)가 부족하면 mock 데이터/타입을 확장한다.
- 실제 API 연동은 범위 외(기존 `// TODO: Replace with actual API call` 유지).

---

## 8. 범위 외 (Out of Scope)

- `/design-system` 페이지(디자인 레퍼런스일 뿐 제품 페이지 아님) — 구현하지 않음.
- 실제 백엔드 API 연동.
- 다크모드 마감.
- 문서 버전 비교 UI.
- 로그인 페이지 리디자인(기능 유지, 스타일은 최소한만 토큰 반영).

---

## 9. 빌드 순서 (제안)

1. **토큰/폰트 기반**: globals.css 팔레트 교체 + Inter 로드 + BlockNote 오버라이드 조정.
2. **shared/ui**: Button/Badge/Card/Input/Avatar/Logo.
3. **공통 셸**: AppShell + Sidebar(v0) + document-header.
4. **문서 목록** `/documents`(테이블 + 배너).
5. **에디터** `/documents/:id`(헤더 + 메타 + BlockNote 유지 + AI 패널).
6. **AI 검색** `/search`.
7. **히스토리** `/documents/:id/history`.
8. **Home 대시보드** `/workspace`.
9. **설정** `/settings`.
10. **랜딩** `/`.
11. 라우터/routes.ts 정리 + 네비 연결 + 스모크 확인.

---

## 10. 검증

- `npm run dev`로 각 라우트 렌더 확인(브라우저 스모크).
- `npm run build`(tsc + vite) 통과.
- BlockNote 편집(슬래시 메뉴, 블록 조작) 정상 동작 확인 — 본문 기능 보존 검증.
