---
name: self-review
description: Review changed files against FixLog dev-guidelines (project structure + all 17 code fundamentals)
disable-model-invocation: true
allowed-tools: Bash(git *), Read, Glob, Grep
---

# 셀프 리뷰 (가이드라인 준수 검사)

현재 브랜치에서 변경된 파일들이 FixLog dev-guidelines를 준수하는지 자동으로 검사합니다.

---

## 작업 순서

### 1. 변경 범위 수집

- `git log dev..HEAD --format="%H %s"` 로 dev 대비 커밋 목록 확인
- `git diff dev..HEAD --name-only` 로 변경된 파일 전체 목록 수집
- `git status --short` 로 미커밋 파일 확인 → 있으면 리뷰 범위에 포함, 리포트 상단에 명시
- 변경된 파일들의 내용을 Read 도구로 **직접 전부 읽어서** 분석 (파일 목록만 보고 판단 금지)

---

### 2. 검사 항목

아래 두 카테고리를 순서대로 검사한다.

---

## [A] 프로젝트 구조 (FIXLOG-FRONTEND-PROJECT-STRUCTURE-GUIDE.md)

각 파일의 위치와 파일명이 레이어 규칙에 맞는지 확인한다.

### 레이어 역할 규칙

| 레이어 | 허용 | 금지 |
|--------|------|------|
| `app/` | Provider, Router, 전역스타일, env, QueryClient 설정 | 비즈니스 로직, API 호출 |
| `shared/` | 공통 UI, 공통 유틸, HTTP 클라이언트, 공통 훅 — 도메인 의미 없는 것만 | 특정 도메인 의미 있는 코드, "일단 shared" 배치 |
| `domains/` | type, schema, api, constants, lib, domain hook, domain ui | 사용자 행동(feature) 로직, 직접 toast/redirect |
| `features/` | API 호출 + 성공/실패 처리 + query invalidation + toast 조합 | 순수 표현 컴포넌트, 도메인 규칙 |
| `widgets/` | domain/ui + feature/ui + shared/ui 조합 | 직접 API 호출, 비즈니스 로직 |
| `pages/` | 레이아웃 조립, widget/feature 조합 | 인증/권한 세부 로직, API 세부사항, 정규화 로직 |

### 파일명 규칙

- API 파일: `동사-명사.api.ts` (예: `get-document.api.ts`)
- 타입 파일: `명사.types.ts`, `명사.schema.ts`
- 훅 파일: `use-명사-동사.ts` (예: `use-document-list-query.ts`)
- UI 컴포넌트: 케밥 케이스 (예: `document-list-page.tsx`, `google-login-button.tsx`)

### 체크포인트

- [ ] 파일 위치가 해당 레이어 역할에 맞는가?
- [ ] `shared/`에 도메인 의미가 있는 코드가 들어가지 않았는가?
- [ ] `pages/`에 인증/권한 세부 로직이 직접 들어가지 않았는가?
- [ ] `domains/*/index.ts`에서 구현되지 않은 항목을 export하지 않는가?
- [ ] 파일명이 레이어별 명명 규칙을 따르는가?

---

## [B] 코드 fundamentals — 17개 규칙 전체 검사

변경된 파일 코드를 실제로 읽으며 아래 17개 규칙을 하나도 빠짐없이 확인한다.

---

### 가독성 (01~08)

#### 01. 같이 실행되지 않는 코드 분리 (`01-readability-separate-exclusive-paths.md`)

**규칙:**
- 상태가 서로 배타적이면 서브 컴포넌트로 분리한다
- `if`가 3개 이상 이어지면 "상태별 컴포넌트 분리"를 먼저 검토한다
- 한 화면에서 역할이 다른 CTA도 분리한다

**체크:**
- [ ] 로딩/에러/빈상태/정상화면이 한 컴포넌트에 모두 섞여 있지 않은가?
- [ ] if 분기가 3개 이상 이어지는 컴포넌트가 있다면 상태별 컴포넌트 분리를 적용했는가?
- [ ] 실제로 동시에 실행되지 않는 코드 경로가 한 곳에 뒤섞여 있지 않은가?

**금지 패턴:**
```tsx
// 금지: 한 컴포넌트에서 auth guard + loading + empty + content 모두 처리
function DocumentListPage() {
  if (!isLoggedIn) return <Redirect />;
  if (isLoading) return <Skeleton />;
  if (isEmpty) return <EmptyView />;
  return <DocumentGrid />;
}
```

---

#### 02. 구현 상세 추상화 (`02-readability-abstract-implementation-details.md`)

**규칙:**
- 라우팅 보호, 인증 체크, 권한 체크, 리다이렉트, feature flag 판정은 Wrapper/Hook으로 숨긴다
- 페이지는 비즈니스 문장 수준으로 읽혀야 한다
- 구현 상세는 page가 아니라 feature/domain/shared로 내린다

**체크:**
- [ ] page 컴포넌트에서 `location.href`, `window.history`, raw role string 비교를 직접 남발하지 않는가?
- [ ] 인증 체크나 리다이렉트가 page 내부에 직접 드러나지 않는가?
- [ ] page를 읽었을 때 "이 화면이 무엇을 보여주는지" 바로 파악되는가?

**금지 패턴:**
```tsx
// 금지: page에서 직접 window.location, role 비교
function EditorPage() {
  if (!localStorage.getItem('token')) window.location.href = '/login';
  if (user.role !== 'ADMIN') return <Forbidden />;
  // ...
}
```

---

#### 03. 로직 종류에 따라 함수 쪼개기 (`03-readability-split-by-logic-kind.md`)

**규칙:**
하나의 Hook/함수는 아래 중 **한 종류의 책임**만 가진다:
- URL 상태 관리 / 폼 상태 관리 / 서버 상태 조회 / 서버 상태 변경 / 데이터 변환·정규화 / UI 이벤트 조합 / 에디터 인스턴스 제어

**체크:**
- [ ] 하나의 Hook이 search params 읽기 + API 요청 + 응답 정규화 + toast + modal 열기를 모두 하지 않는가?
- [ ] feature hook은 "행동"만 조합하고, domain은 API/정규화, shared는 범용 유틸만 가지는가?

**금지 패턴:**
```ts
// 금지: 한 Hook이 URL 조회 + API + 정규화 + toast까지
function useDocumentPageState() {
  const params = useSearchParams();
  const { data } = useQuery(...);
  const normalized = normalizeResponse(data);
  toast.success('로드 완료');
  return normalized;
}
```

---

#### 04. 복잡한 조건에 이름 붙이기 (`04-readability-name-complex-conditions.md`)

**규칙:**
- `&&`, `||`, `some`, `every`, `filter`가 중첩되면 조건을 변수/함수로 뽑는다
- 불리언 변수는 `is`, `has`, `can`, `should` 접두어 사용
- `checkCondition`, `flag`, `statusOk` 같은 맥락 없는 이름 금지

**체크:**
- [ ] 중첩 `&&`/`||`/`filter` 조건에 의미 있는 이름이 붙어 있는가?
- [ ] 조건식이 바로 읽혀도 무엇을 만족하는지 이해되는가?

**금지 패턴:**
```ts
// 금지: 조건이 중첩되고 의미가 없음
const visible = docs.filter(d =>
  d.ownerId === user.id && d.status !== 'ARCHIVED' && !d.isDeleted
);
```

---

#### 05. 매직 넘버에 이름 붙이기 (`05-readability-name-magic-numbers.md`)

**규칙:**
아래 값은 반드시 상수화한다:
- debounce 시간, polling interval, max file size, page size
- editor autosave interval, AI job retry count, upload timeout, staleTime

위치 규칙:
- 전역 정책 → `shared/constants`
- 도메인 규칙 → `domain/*/constants`
- 특정 feature 전용 → 해당 feature 내부

**체크:**
- [ ] `1000 * 60`, `3000`, `20`, `5000`, `300` 같은 숫자 리터럴이 직접 박혀 있지 않은가?
- [ ] `'access_token'`, API URL path 같은 문자열 리터럴이 상수화 없이 여러 곳에 흩어져 있지 않은가?
- [ ] `await delay(300)` 같은 패턴에서 300이 무엇을 의미하는지 이름이 있는가?

**금지 패턴:**
```ts
staleTime: 1000 * 60          // 금지: 1분이라는 의미가 사라짐
localStorage.getItem('access_token')  // 금지: 문자열 리터럴 직접 사용
http.get('/fixlog/main')      // 금지: API 경로 리터럴 직접 사용
```

---

#### 06. 시점 이동 줄이기 (`06-readability-reduce-temporal-jumps.md`)

**규칙:**
- 화면 바로 앞에서 필요한 핵심 판단은 너무 멀리 숨기지 않는다
- 단순한 표시 조건은 화면 근처에 둔다
- 너무 추상적인 boolean 하나로 실제 의미를 감추지 않는다

**체크:**
- [ ] 조건 변수를 이해하려고 다른 파일/함수로 계속 이동해야 하는 상황이 있는가?
- [ ] `policy.canEdit` 같이 다른 곳으로 따라가야만 의미가 파악되는 추상 boolean이 있는가?
- [ ] 선언과 사용이 너무 멀리 떨어져 있지 않은가?

**금지 패턴:**
```tsx
// 금지: canEdit가 무엇인지 다른 파일을 열어야 알 수 있음
const policy = getPolicyByRole(user.role);
<Button disabled={!policy.canEdit}>수정</Button>
```

---

#### 07. 삼항 연산자 단순하게 하기 (`07-readability-simplify-ternaries.md`)

**규칙:**
- 중첩 삼항 금지
- JSX에서 삼항 2회 이상 중첩 금지
- 상태가 3개 이상이면 함수 분리 또는 상태 맵(Record) 사용

**체크:**
- [ ] 삼항 연산자가 중첩되어 있지 않은가?
- [ ] 상태가 3개 이상인 경우 Record 맵 또는 함수로 분리되어 있는가?

**금지 패턴:**
```tsx
// 금지: 중첩 삼항
const badge = status === 'FAILED' ? '실패' : status === 'DONE' ? '완료' : '대기';
```

---

#### 08. 왼쪽에서 오른쪽으로 읽히게 하기 (`08-readability-read-left-to-right.md`)

**규칙:**
- 비교 기준을 통일한다
- `a >= b && a <= c` 같은 패턴은 의미 함수로 바꾼다
- 범위 비교는 `isBetween` 같은 헬퍼로 감싼다

**FixLog에서 자주 쓰는 곳:** 파일 크기 제한, 페이지 번호 범위, 점수·유사도 범위, AI confidence threshold

**체크:**
- [ ] `value >= min && value <= max` 패턴이 헬퍼 없이 직접 쓰이고 있지 않은가?
- [ ] 범위 비교가 사람이 자연스럽게 읽히는 방향으로 작성되었는가?

---

### 예측 가능성 (09~11)

#### 09. 이름 겹치지 않게 관리하기 (`09-predictability-avoid-name-collisions.md`)

**규칙:**
- 외부 라이브러리 wrapper는 원본 이름과 다르게 짓는다
- domain 타입과 API 응답 타입 이름을 구분한다
- UI model, server model, form model 이름을 분리한다

**추천 접미사:** `Response`, `Payload`, `Params`, `Values`, `Model`, `Item`, `Entity`

**금지 이름:** `data`, `result`, `item`, `info` 같은 맥락 없는 범용 이름

**체크:**
- [ ] axios를 감싼 클라이언트 파일/변수명이 `http`인 경우, 외부에서 axios와 구분되는가? (`apiClient`가 더 명확)
- [ ] 서버 응답 타입과 화면 표시 모델이 같은 이름 `Document`를 쓰고 있지 않은가?
- [ ] `data`, `result`, `item` 같은 맥락 없는 이름을 변수/타입명으로 남발하지 않는가?

---

#### 10. 같은 종류의 함수는 반환 타입 통일하기 (`10-predictability-unify-return-types.md`)

**규칙:**
- **Query Hook**: `useQuery` 결과 객체 전체 반환 (data, isLoading, error, refetch 제공)
- **Mutation Hook**: `useMutation` 결과 객체 반환 또는 `mutateAsync` 중심의 일관된 shape — 팀 규칙 고정
- **Selector Hook만** 순수 값 반환 허용

**체크:**
- [ ] 서버 조회 Hook이 `useQuery(...).data` 만 반환하는 패턴이 있는가? (지양)
- [ ] 같은 계열의 Query Hook들이 일관된 반환 타입을 가지는가?
- [ ] Mutation Hook 반환 타입이 서로 제각각이지 않은가?

**금지 패턴:**
```ts
// 지양: data만 꺼내 반환 — isLoading, error 정보 손실
export function useDocumentList() {
  return useQuery({ ... }).data;
}
```

---

#### 11. 숨은 로직 드러내기 (`11-predictability-reveal-hidden-logic.md`)

**규칙:**
아래 로직은 함수 이름에 드러나지 않으면 숨기지 않는다:
- logging, analytics, toast, redirect, cache invalidation
- localStorage/sessionStorage 기록, editor focus 이동, modal open/close

**원칙:**
- 조회 함수는 조회만
- 저장 함수는 저장만
- UI 행동은 feature/action hook에서 조합

**체크:**
- [ ] "조회 함수"인데 내부에서 localStorage 기록 / redirect / analytics 추적이 일어나지 않는가?
- [ ] HTTP interceptor 내부에서 `localStorage.removeItem` + `window.location.href` 같은 사이드 이펙트가 예측 불가능하게 실행되지 않는가?
- [ ] 함수 이름, 파라미터, 반환값만 보고 안에서 무슨 일이 일어나는지 예측 가능한가?

**금지 패턴:**
```ts
// 금지: 조회 함수인데 analytics 추적이 숨어있음
async function fetchDocument() {
  const doc = await apiClient.get(...);
  analytics.track('document_fetched'); // 숨은 사이드 이펙트
  return doc;
}
```

---

### 응집도 (12~14)

#### 12. 함께 수정되는 파일을 같은 디렉토리에 두기 (`12-cohesion-colocate-files-that-change-together.md`)

**규칙:**
- `shared`는 전역 재사용만
- domain 내부에는 그 도메인에서만 바뀌는 파일을 모은다
- feature는 사용자 행동 단위로 파일을 묶는다
- widget은 화면 섹션 단위로 묶는다

**판단 기준:** 특정 기능을 바꿀 때 API + schema + action hook + button UI + modal이 함께 바뀐다면 → 가깝게 둔다

**체크:**
- [ ] 특정 기능을 수정할 때 관련 파일이 너무 여러 레이어에 흩어져 있지 않은가?
- [ ] 특정 도메인에서만 쓰이는 파일이 `shared/`에 잘못 올라가 있지 않은가?
- [ ] 삭제했을 때 관련 파일이 찌꺼기로 남을 위험이 있는 구조인가?

---

#### 13. 매직 넘버 없애기 (응집도 관점) (`13-cohesion-remove-magic-numbers.md`)

**규칙:**
정책 숫자는 반드시 **한 곳에서** 관리한다:
- 업로드 최대 파일 크기, chunk size, AI polling interval
- editor autosave interval, 검색 debounce, cache staleTime/gcTime, pagination size

위치:
- 도메인 정책 → `domain/*/constants`
- 앱 전체 정책 → `shared/config` 또는 `shared/constants`

**추가 규칙:**
- `staleTime`은 query key 설계와 함께 문서화할 것
- 애니메이션 duration은 CSS와 TS에서 같은 정책을 볼 것

**체크:**
- [ ] 같은 정책 숫자가 여러 파일에 복붙되어 있지 않은가?
- [ ] 상수 이름만 만들고 실제 관계를 묶지 않은 경우는 없는가?
- [ ] 규칙 05(가독성)에서 잡은 매직 넘버가 올바른 위치의 상수 파일로 관리되고 있는가?

---

#### 14. 폼의 응집도 생각하기 (`14-cohesion-think-in-form-cohesion.md`)

**규칙:**
폼에서 함께 바뀌는 것: 입력값 + 검증 + 에러 표시 + 제출 + 서버 에러 매핑

- 필드 고유 검증은 필드 근처에 둔다
- 폼 전체 규칙은 schema에 둔다
- 서버 payload 변환은 submit action에서 처리한다
- 폼 상태와 제출 mutation과 성공 후 라우팅을 한 파일에 욱여넣지 않는다

**체크:**
- [ ] 폼이 있는 경우, validation rule과 에러 표시 문구가 너무 멀리 분리되어 있지 않은가?
- [ ] 폼 상태 + mutation + 성공 후 redirect가 하나의 컴포넌트/훅에 다 섞여 있지 않은가?
- [ ] schema, form hook, payload 변환 함수가 같은 feature 내에 모여 있는가?

---

### 결합도 (15~17)

#### 15. 책임을 하나씩 관리하기 (`15-coupling-manage-one-responsibility-per-unit.md`)

**규칙:**
- Hook 하나에 여러 계층 책임을 섞지 않는다
- 컴포넌트는 UI 표현을 우선한다
- feature hook은 사용자 액션 흐름을 조합한다
- domain은 서버 통신과 모델 변환을 담당한다

**판단 기준:** "이 파일을 고칠 때 왜 unrelated 동작 테스트까지 해야 하지?" 싶으면 책임이 섞인 것

**체크:**
- [ ] 하나의 Hook/함수가 URL 상태 + 데이터 변환 + UI 제어를 동시에 담당하지 않는가?
- [ ] HTTP 클라이언트(`shared/lib/http`)가 라우팅 결정(redirect)까지 담당하지 않는가?
- [ ] 컴포넌트가 UI 렌더링 외에 비즈니스 로직을 직접 처리하지 않는가?

---

#### 16. 중복 코드 허용하기 (`16-coupling-allow-duplication-when-needed.md`)

**규칙:**
다음 **5가지 질문에 모두 "예"**일 때만 공통화한다:
1. 지금도 동일한가?
2. 앞으로도 함께 바뀔 가능성이 높은가?
3. 이름을 자연스럽게 지을 수 있는가?
4. 옵션 객체가 비대해지지 않는가?
5. 사용하는 모든 곳의 테스트를 부담 없이 유지할 수 있는가?

**FixLog에서 특히 주의할 곳:** Modal 공통화, Toolbar 공통화, List/Card 공통화, Upload flow 공통화, AI job status panel 공통화

**체크:**
- [ ] "비슷해 보인다"는 이유만으로 무리하게 공통 컴포넌트/훅을 만들지 않았는가?
- [ ] 공통 추상화가 옵션 객체 비대화나 조건 분기 남발로 이어지지 않는가?
- [ ] 아직 확신이 없는 공통화보다 duplication을 허용했는가?

---

#### 17. Props Drilling 지우기 (`17-coupling-eliminate-props-drilling.md`)

**규칙:**
아래 상황이면 props drilling 제거를 검토한다:
- 2단계 이상 연속 전달
- 중간 컴포넌트가 prop을 실제로 사용하지 않음
- 하나의 모달/섹션 내부에서만 공유되는 상태
- editor sub tree에서 공통 상태를 여러 자식이 참조

**해결 방법:** Compound Component, Local Context, Custom Hook + Provider, slot pattern

**주의:** props drilling을 없애겠다고 아무 상태나 zustand 전역 스토어로 올리면 오히려 나빠진다

**체크:**
- [ ] `A -> B -> C -> D`로 같은 prop이 계속 전달되지 않는가?
- [ ] 중간 컴포넌트가 자신은 쓰지 않는 prop을 전달만 하고 있지 않은가?
- [ ] 로컬 상태를 불필요하게 zustand 전역 스토어로 올리지 않았는가?

---

### 3. 리뷰 리포트 출력

```markdown
# 셀프 리뷰 리포트

**브랜치**: [브랜치명]
**리뷰 대상 커밋 수**: N개 (dev 대비)
**미커밋 변경사항**: 있음 / 없음
**리뷰 기준일**: [오늘 날짜]

---

## [A] 프로젝트 구조

| 파일 | 적합성 | 판단 이유 |
|------|--------|----------|
| src/... | ✅ / ⚠️ / ❌ | [이유] |

**소견**: [전체 구조 평가]

---

## [B] Code Fundamentals

| # | 규칙 | 상태 | 파일:라인 | 구체적 내용 |
|---|------|------|----------|------------|
| 01 | 배타적 경로 분리 | ✅ / ⚠️ / ❌ | - | - |
| 02 | 구현 상세 추상화 | | | |
| 03 | 로직 종류별 분리 | | | |
| 04 | 복잡한 조건 네이밍 | | | |
| 05 | 매직 넘버 이름 붙이기 | | | |
| 06 | 시점 이동 줄이기 | | | |
| 07 | 삼항 연산자 단순화 | | | |
| 08 | 왼쪽→오른쪽 읽기 | | | |
| 09 | 이름 충돌 방지 | | | |
| 10 | 반환 타입 통일 | | | |
| 11 | 숨은 로직 드러내기 | | | |
| 12 | 파일 응집 (colocate) | | | |
| 13 | 매직 넘버 응집 관리 | | | |
| 14 | 폼 응집도 | | | |
| 15 | 단일 책임 | | | |
| 16 | 중복 허용 기준 | | | |
| 17 | Props Drilling 제거 | | | |

**소견**: [전체 fundamentals 평가]

---

## 종합 평가

| 카테고리 | 결과 |
|---------|------|
| A. 프로젝트 구조 | ✅ 통과 / ⚠️ 검토 / ❌ 위반 |
| B. Code Fundamentals | ✅ 통과 / ⚠️ 검토 / ❌ 위반 |

### 즉시 수정 필요 (❌)

**[파일:라인] 문제 설명**
수정 방법 설명
> 참고: `docs/dev-guidelines/fundamentals/XX-규칙명.md`

### 검토 권장 (⚠️)

**[파일:라인] 개선 제안**
개선 방향 설명
> 참고: `docs/dev-guidelines/fundamentals/XX-규칙명.md`

### 잘 된 점 (✅)
- [가이드라인을 잘 따른 구체적 부분]
```

---

### 4. 수정 필요 항목 처리

- ❌ 항목이 있으면 "수정 후 재실행을 권장합니다" 안내
- 수정이 필요한 파일과 라인, 구체적인 개선 방향 제시
- 사용자가 수정 원하면 직접 코드 수정 도움 제공

---

## 주의사항

1. **실제 코드를 읽어야 함**: 파일 목록만 보고 판단하지 말고, 변경된 파일을 반드시 Read로 읽어 분석
2. **17개 규칙 전체 검사**: 적용 가능한 규칙 일부만 보는 것이 아니라 17개를 하나씩 모두 확인
3. **변경 범위에만 집중**: 변경되지 않은 기존 코드는 검사하지 않음
4. **False Positive 주의**: 명확한 위반만 ❌, 맥락을 고려해 판단
5. **개선 제안은 구체적으로**: "가독성이 나쁨" ❌ → "client.ts:23의 `401`을 `HTTP_STATUS.UNAUTHORIZED` 상수로 추출하세요" ✅
6. **스캐폴딩/미구현 단계 고려**: 아직 구현되지 않은 placeholder 코드는 해당 규칙 N/A로 처리

## 실행 방법

```
/self-review
```
