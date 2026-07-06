# FixLog 프론트엔드 프로젝트 구조 가이드

> 이 문서는 FixLog 프론트엔드 프로젝트 구조를 정리한 문서이다.  
> 목적은 **폴더 이름을 예쁘게 나누는 것**이 아니라,  
> **변경 범위가 예측 가능하고**, **함께 바뀌는 코드가 함께 있도록** 구조를 설계하는 것이다.

---

# 1. 핵심 철학

이 구조는 아래 기준을 우선한다.

1. **함께 수정되는 파일은 가깝게 둔다.**
2. `components`, `hooks`, `utils`, `api` 같은 **종류별 창고형 구조를 피한다.**
3. **비즈니스 개념(domain)** 과 **사용자 행동(feature)** 을 구분한다.
4. **page는 조립**, **widget은 화면 블록**, **feature는 행동**, **domain은 기반** 역할을 갖는다.
5. `shared`는 정말 공통일 때만 사용한다.
6. 공통화는 무조건 좋은 것이 아니다.  
   **같이 바뀌지 않을 가능성이 높다면 중복을 허용한다.**

---

# 2. 최상위 구조

```txt
src/
  app/
  shared/
  domains/
  features/
  widgets/
  pages/
```

---

# 3. 각 레이어의 역할

## 3.1 `app/`
앱의 전역 설정과 부트스트랩을 둔다.

예:
- Provider 등록
- Router 설정
- 전역 스타일
- 환경 변수 설정
- QueryClient 설정

즉, **앱이 실행되기 위한 기반 설정**이다.

---

## 3.2 `shared/`
여러 도메인에서 공통으로 사용하는 것만 둔다.

예:
- 공통 UI 컴포넌트 (`Button`, `Input`, `Dialog`)
- 공통 유틸 (`formatDate`, `downloadFile`)
- 공통 HTTP 클라이언트
- 공통 상수
- 공통 훅 (`useDebounce`, `useDisclosure`)

중요:
- `shared`는 **공용 창고**가 아니다.
- "일단 애매하니 shared에 넣자"는 금지한다.
- 특정 도메인 의미가 들어가면 `shared`가 아니라 해당 `domain`이나 `feature`로 간다.

---

## 3.3 `domains/`
서비스가 다루는 **핵심 비즈니스 개념**을 둔다.

예:
- documents
- workspace
- member
- ai
- folder

`domain`은 특정 행동 하나가 아니라,  
그 행동들이 기대는 **비즈니스 기반**이다.

### 한 줄 정의
- **domain은 “무엇인가”를 설명한다.**
- 예: 문서가 무엇인지, 워크스페이스가 무엇인지

---

## 3.4 `features/`
사용자가 수행하는 **특정 행동**을 둔다.

예:
- 문서 이름 변경
- 문서 삭제
- 문서 생성
- 멤버 초대
- 워크스페이스 생성
- 문서 업로드

### 한 줄 정의
- **feature는 “무엇을 하는가”를 설명한다.**
- 예: 문서를 삭제한다, 문서 이름을 바꾼다

---

## 3.5 `widgets/`
페이지 안에서 보이는 **큰 UI 블록**을 둔다.

예:
- DocumentHeader
- DocumentListSection
- Sidebar
- AiSearchPanel
- ActivityPanel

`widget`은 보통 아래를 조합해서 만들어진다.

- `domain/ui`
- `feature/ui`
- `shared/ui`

### 한 줄 정의
- **widget은 화면에서 보이는 큰 조합 단위다.**

---

## 3.6 `pages/`
실제 라우트 페이지를 둔다.

예:
- `/documents/:id`
- `/documents`
- `/workspace/:id`
- `/settings`

`page`는 전체 화면 진입점이며,  
도메인/피처/위젯을 **조합해서 최종 화면을 만든다**.

### 한 줄 정의
- **page는 실제 URL에 대응되는 화면이다.**

---

# 4. 추천 디렉토리 구조

```txt
src/
  app/
    providers/
      QueryProvider.tsx
      RouterProvider.tsx
      ThemeProvider.tsx
    router/
      index.tsx
      guards.tsx
    styles/
      globals.css
    config/
      env.ts
      routes.ts
      query-keys.ts

  shared/
    ui/
      Button.tsx
      Input.tsx
      Dialog.tsx
      Spinner.tsx
      Badge.tsx
    lib/
      http/
        client.ts
        errors.ts
      utils/
        date.ts
        file.ts
        text.ts
    hooks/
      use-debounce.ts
      use-disclosure.ts
    constants/
      common.ts
    types/
      common.ts

  domains/
    documents/
      api/
        get-document.api.ts
        get-document-list.api.ts
        create-document.api.ts
        update-document.api.ts
        delete-document.api.ts
      types/
        document.types.ts
        document.schema.ts
      hooks/
        use-document-query.ts
        use-document-list-query.ts
      ui/
        DocumentTitle.tsx
        DocumentStatusBadge.tsx
        DocumentIcon.tsx
      lib/
        map-document-status.ts
      index.ts

    workspace/
      api/
      types/
      hooks/
      ui/
      lib/
      index.ts

    member/
      api/
      types/
      hooks/
      ui/
      lib/
      index.ts

  features/
    documents/
      create-document/
        hooks/
          use-create-document.ts
        ui/
          CreateDocumentButton.tsx
          CreateDocumentDialog.tsx
        types/
          create-document.schema.ts

      rename-document/
        hooks/
          use-rename-document.ts
        ui/
          RenameDocumentButton.tsx
          RenameDocumentDialog.tsx
        types/
          rename-document.schema.ts

      delete-document/
        hooks/
          use-delete-document.ts
        ui/
          DeleteDocumentButton.tsx
          DeleteDocumentDialog.tsx

      upload-document/
        hooks/
          use-upload-document.ts
        ui/
          UploadDocumentButton.tsx
          UploadDocumentDialog.tsx

    workspace/
      create-workspace/
      invite-member/

  widgets/
    document-header/
      ui/
        DocumentHeader.tsx

    document-editor/
      ui/
        DocumentEditor.tsx

    document-activity-panel/
      ui/
        DocumentActivityPanel.tsx

    document-list-section/
      ui/
        DocumentListSection.tsx
        DocumentListToolbar.tsx

    sidebar/
      ui/
        Sidebar.tsx
        WorkspaceList.tsx

  pages/
    document-detail/
      ui/
        DocumentDetailPage.tsx
      hooks/
        use-document-detail-page.ts

    document-list/
      ui/
        DocumentListPage.tsx
      hooks/
        use-document-list-page.ts

    workspace-detail/
      ui/
        WorkspaceDetailPage.tsx

    settings/
      ui/
        SettingsPage.tsx
```

---

# 5. `documents` 도메인 기준으로 이해하기

## 5.1 `domains/documents`는 무엇을 담는가?

`domains/documents`는 **문서라는 비즈니스 개념의 기반**을 담는다.

여기에 들어가는 것:

- 문서 API
- 문서 타입
- 문서 schema
- 문서 조회 hook
- 문서를 표현하는 작은 UI
- 문서 상태 변환 로직

예시:

```txt
domains/documents/
  api/
    get-document.api.ts
    get-document-list.api.ts
    create-document.api.ts
    update-document.api.ts
    delete-document.api.ts
  types/
    document.types.ts
    document.schema.ts
  hooks/
    use-document-query.ts
    use-document-list-query.ts
  ui/
    DocumentTitle.tsx
    DocumentStatusBadge.tsx
  lib/
    map-document-status.ts
```

### 왜 `model`이 아니라 `types`인가?
이번 구조에서는 `model` 대신 `types`를 사용한다.

이유:
- 현재 팀 컨벤션에서 `type`, `interface`, `schema`를 함께 관리하는 목적이 더 명확하다.
- `model`은 의미가 넓고 추상적일 수 있다.
- FixLog에서는 프론트 기준으로 **타입과 schema 중심 관리**가 더 직관적이다.

즉:

```txt
domains/documents/types/
  document.types.ts
  document.schema.ts
```

형태를 사용한다.

---

## 5.2 `domains/documents/api`의 역할

여기는 **문서 리소스를 다루는 순수 API 함수**를 둔다.

예:

```ts
// domains/documents/api/update-document.api.ts
export async function updateDocument(
  documentId: string,
  payload: { title?: string }
) {
  return http.patch(`/documents/${documentId}`, payload);
}
```

중요:
- 여기서는 토스트를 띄우지 않는다.
- 모달을 닫지 않는다.
- 페이지 이동을 하지 않는다.
- React Query invalidate도 하지 않는다.

즉, **서버 요청 자체만 담당한다.**

---

## 5.3 `domains/documents/hooks`의 역할

보통 **조회성 hook**을 둔다.

예:
- `useDocumentQuery`
- `useDocumentListQuery`

```ts
// domains/documents/hooks/use-document-query.ts
import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../api/get-document.api';

export function useDocumentQuery(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocument(documentId),
    enabled: !!documentId,
  });
}
```

### 왜 domain에 조회 hook을 두는가?
문서 조회는 특정 행동이라기보다  
**문서라는 대상을 읽어오는 기반 기능**이기 때문이다.

---

## 5.4 `domains/documents/ui`의 역할

이게 자주 헷갈리는 부분이다.

여기에는 **문서라는 비즈니스 대상을 표현하는 작은 UI**를 둔다.

예:
- `DocumentTitle`
- `DocumentStatusBadge`
- `DocumentIcon`

```tsx
// domains/documents/ui/DocumentTitle.tsx
interface Props {
  title: string;
}

export function DocumentTitle({ title }: Props) {
  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
```

### 왜 domain에 ui가 있는가?
모든 UI가 행동 UI는 아니기 때문이다.

예:
- 문서 제목 표시
- 문서 상태 표시
- 문서 아이콘 표시

이건 어떤 행동을 수행하는 UI가 아니라,  
**문서라는 대상을 표현하는 UI**다.

즉:

- `domain/ui` = 대상 표현 UI
- `feature/ui` = 행동 수행 UI

---

# 6. `features/documents`는 무엇을 담는가?

`features/documents`는 **문서에 대한 특정 행동**을 담는다.

예:
- 문서 생성
- 문서 이름 변경
- 문서 삭제
- 문서 업로드

---

## 6.1 `feature` 안에는 무엇이 들어가는가?

- 행동용 hook
- 행동용 UI
- 행동용 schema
- 행동 성공/실패 후처리

예시:

```txt
features/documents/rename-document/
  hooks/
    use-rename-document.ts
  ui/
    RenameDocumentButton.tsx
    RenameDocumentDialog.tsx
  types/
    rename-document.schema.ts
```

---

## 6.2 `feature`는 왜 api를 직접 가지지 않는가?

기본 원칙:
- **API 함수는 `domain/api`에 둔다.**
- **feature는 그 API를 가져다 행동 흐름을 만든다.**

즉 역할이 다르다.

### `domain/api`
- 서버와 통신하는 순수 함수

### `feature`
- 그 API를 이용해서
  - mutation 실행
  - 성공/실패 처리
  - 토스트 표시
  - 캐시 갱신
  - 모달 닫기
  - 페이지 이동

같은 **행동 흐름**을 만든다.

---

## 6.3 예시: 문서 이름 변경

### domain api

```ts
// domains/documents/api/update-document.api.ts
export async function updateDocument(
  documentId: string,
  payload: { title?: string }
) {
  return http.patch(`/documents/${documentId}`, payload);
}
```

### feature hook

```ts
// features/documents/rename-document/hooks/use-rename-document.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDocument } from '@/domains/documents/api/update-document.api';

export function useRenameDocument(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      updateDocument(documentId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
      toast.success('문서 이름이 변경되었습니다.');
    },
    onError: () => {
      toast.error('문서 이름 변경에 실패했습니다.');
    },
  });
}
```

### feature ui

```tsx
// features/documents/rename-document/ui/RenameDocumentButton.tsx
import { useState } from 'react';
import { RenameDocumentDialog } from './RenameDocumentDialog';

interface Props {
  documentId: string;
  initialTitle: string;
}

export function RenameDocumentButton({ documentId, initialTitle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>이름 변경</button>
      <RenameDocumentDialog
        open={open}
        onOpenChange={setOpen}
        documentId={documentId}
        initialTitle={initialTitle}
      />
    </>
  );
}
```

---

## 6.4 `feature`에 api가 아예 있으면 안 되는가?

기본적으로는 `domain/api`를 우선한다.

다만 아래는 예외로 둘 수 있다.

### 예외 1. 특정 행동에만 묶인 endpoint
예:
- `POST /documents/{id}/restore-from-trash`
- `POST /documents/{id}/generate-summary`

이건 CRUD보다 **특정 액션 endpoint** 느낌이 강해서,  
팀 컨벤션에 따라 feature 내부에서 다뤄도 된다.

### 예외 2. 여러 API를 묶는 orchestration
예:
- 문서 업데이트 후 로그 전송
- 문서 업로드 후 AI 인덱싱 요청

이 경우는 단순 문서 리소스 API가 아니라  
**행동 단위 시나리오**에 가깝다.

그래도 시작은 아래 원칙을 추천한다.

### 권장 원칙
- 리소스 기준 API 함수 → `domain/api`
- 행동 흐름 → `feature`

---

# 7. `widgets/`는 무엇을 담는가?

`widget`은 **화면에서 보이는 큰 UI 블록**이다.

예:
- 문서 상세 페이지 상단 헤더
- 문서 리스트 섹션
- 활동 로그 패널
- AI 질문 패널
- 좌측 사이드바

보통 widget은 아래를 조합한다.

- `domain/ui`
- `feature/ui`
- `shared/ui`

---

## 7.1 예시: 문서 상세 헤더

```txt
widgets/document-header/
  ui/
    DocumentHeader.tsx
```

```tsx
// widgets/document-header/ui/DocumentHeader.tsx
import { DocumentTitle } from '@/domains/documents/ui/DocumentTitle';
import { DocumentStatusBadge } from '@/domains/documents/ui/DocumentStatusBadge';
import { RenameDocumentButton } from '@/features/documents/rename-document/ui/RenameDocumentButton';
import { DeleteDocumentButton } from '@/features/documents/delete-document/ui/DeleteDocumentButton';

interface Props {
  documentId: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
}

export function DocumentHeader({ documentId, title, status }: Props) {
  return (
    <header className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <DocumentTitle title={title} />
        <DocumentStatusBadge status={status} />
      </div>

      <div className="flex items-center gap-2">
        <RenameDocumentButton documentId={documentId} initialTitle={title} />
        <DeleteDocumentButton documentId={documentId} />
      </div>
    </header>
  );
}
```

### 정리
- `DocumentTitle` → domain/ui
- `DocumentStatusBadge` → domain/ui
- `RenameDocumentButton` → feature/ui
- `DeleteDocumentButton` → feature/ui

이걸 합쳐서 **문서 헤더라는 화면 블록**을 만드는 것이 widget이다.

---

# 8. `pages/`는 무엇을 담는가?

`pages`는 **실제 URL에 대응되는 화면 진입점**이다.

예:
- 문서 상세 페이지
- 문서 목록 페이지
- 워크스페이스 상세 페이지

page는 다음 역할을 한다.

- URL 파라미터 받기
- 전체 화면 로딩/에러 처리
- widget 배치
- 화면 레이아웃 조합

---

## 8.1 예시: 문서 상세 페이지

```txt
pages/document-detail/
  ui/
    DocumentDetailPage.tsx
```

```tsx
// pages/document-detail/ui/DocumentDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useDocumentQuery } from '@/domains/documents/hooks/use-document-query';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentEditor } from '@/widgets/document-editor/ui/DocumentEditor';
import { DocumentActivityPanel } from '@/widgets/document-activity-panel/ui/DocumentActivityPanel';

export function DocumentDetailPage() {
  const { documentId = '' } = useParams();
  const { data: document, isLoading, isError } = useDocumentQuery(documentId);

  if (isLoading) return <div>문서를 불러오는 중...</div>;
  if (isError || !document) return <div>문서를 불러오지 못했습니다.</div>;

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <section className="min-w-0">
        <DocumentHeader
          documentId={document.id}
          title={document.title}
          status={document.status}
        />
        <DocumentEditor content={document.content} />
      </section>

      <aside className="space-y-4">
        <DocumentActivityPanel documentId={document.id} />
      </aside>
    </div>
  );
}
```

---

# 9. 한 페이지에서 각 레이어가 어떻게 연결되는가

문서 상세 페이지(`/documents/:id`)를 기준으로 보면:

## 1단계. page
`DocumentDetailPage`가 URL 파라미터를 받는다.

## 2단계. domain
`useDocumentQuery(documentId)`로 문서 데이터를 조회한다.

## 3단계. page
받아온 데이터를 기준으로
- `DocumentHeader`
- `DocumentEditor`
- `DocumentActivityPanel`

같은 widget을 배치한다.

## 4단계. widget
`DocumentHeader` 안에서
- 문서 제목(domain/ui)
- 상태 배지(domain/ui)
- 이름 변경(feature/ui)
- 삭제(feature/ui)

를 조합한다.

## 5단계. feature
사용자가 "이름 변경"을 누르면:
- dialog 열기
- 제목 입력
- mutation 실행
- 성공 시 토스트
- 캐시 갱신

이 흐름을 처리한다.

---

# 10. domain / feature / widget / page를 구분하는 질문

파일을 만들 때 아래 질문으로 판단한다.

## 10.1 이건 비즈니스 대상을 설명하는가?
예:
- 문서 타입
- 문서 조회 API
- 문서 상태 badge

→ `domains/documents`

## 10.2 이건 사용자의 특정 행동인가?
예:
- 문서 이름 변경
- 문서 삭제
- 문서 업로드

→ `features/documents/...`

## 10.3 이건 페이지 안의 큰 화면 블록인가?
예:
- 문서 헤더
- 문서 리스트 섹션
- 사이드바
- 활동 로그 패널

→ `widgets/...`

## 10.4 이건 실제 URL 화면인가?
예:
- 문서 상세 페이지
- 문서 목록 페이지

→ `pages/...`

---

# 11. 가장 자주 헷갈리는 포인트 정리

## 11.1 `domain/ui`와 `feature/ui` 차이

### `domain/ui`
비즈니스 대상을 **표현하는 UI**

예:
- `DocumentTitle`
- `DocumentStatusBadge`

### `feature/ui`
특정 행동을 **수행하는 UI**

예:
- `RenameDocumentButton`
- `DeleteDocumentDialog`

### 한 줄 요약
- `domain/ui` = 대상 표현
- `feature/ui` = 행동 수행

## 11.2 `domain/api`와 `feature`는 겹치지 않는가?
겹치지 않는다.

### `domain/api`
- 서버 요청 함수

### `feature`
- 그 API를 사용해 사용자 행동을 완성하는 흐름

예:
- mutation 실행
- 토스트
- invalidate
- navigate
- dialog close

즉:

- `domain/api` = 재료
- `feature` = 요리법

## 11.3 `widget`은 document 전용 조합물인가?
엄밀히는  
“document에서만 사용하는 조합물”이라기보다,

**문서 화면에서 쓰이는 큰 UI 블록**

이라고 보는 것이 더 정확하다.

즉 재사용성보다  
**화면에서 맡는 역할**이 더 중요하다.

## 11.4 `page`는 문서 도메인의 진입점인가?
정확히는 아니다.

`page`는 도메인 진입점이 아니라  
**라우트 진입점**이다.

즉:
- `/documents`
- `/documents/:id`

같은 실제 URL 화면이다.

---

# 12. 이 구조에서 금지하거나 조심할 것

## 12.1 금지: 최상위 창고 구조

```txt
src/
  components/
  hooks/
  utils/
  apis/
```

이런 구조는 점점 커질수록  
어떤 코드가 무엇과 함께 바뀌는지 보이지 않게 된다.

## 12.2 금지: page에 모든 걸 몰아넣기

예:
- query
- mutation
- dialog state
- validation
- toast
- layout

전부 `page.tsx`에 들어가면 파일이 비대해진다.

## 12.3 금지: 애매하면 shared로 보내기
`shared`는 마지막 선택지다.

아래를 모두 만족할 때만 올린다.

1. 여러 곳에서 쓰고
2. 앞으로도 재사용 가능성이 높고
3. 바뀔 때도 함께 바뀔 가능성이 높다

## 12.4 조심: domain 비대화
`domains/documents` 안에 아래를 다 넣기 시작하면 커진다.

- create
- rename
- delete
- share
- move
- restore
- upload

이런 **행동**은 feature로 뺀다.

---

# 13. 실무용 최종 규칙

## 규칙 1. API 함수는 기본적으로 `domain/api`
- 조회 API
- 목록 API
- 생성/수정/삭제 API

## 규칙 2. 조회 hook은 기본적으로 `domain/hooks`
예:
- `useDocumentQuery`
- `useDocumentListQuery`

## 규칙 3. 행동 hook은 기본적으로 `feature/hooks`
예:
- `useRenameDocument`
- `useDeleteDocument`
- `useUploadDocument`

## 규칙 4. 비즈니스 대상 표현 UI는 `domain/ui`
예:
- `DocumentTitle`
- `DocumentStatusBadge`

## 규칙 5. 행동 UI는 `feature/ui`
예:
- `RenameDocumentButton`
- `DeleteDocumentDialog`

## 규칙 6. 화면 섹션은 `widget`
예:
- `DocumentHeader`
- `DocumentListSection`

## 규칙 7. 실제 화면은 `page`
예:
- `DocumentDetailPage`
- `DocumentListPage`

---

# 14. 한 줄 최종 정리

- **domain은 “문서가 무엇인지”**
- **feature는 “문서로 무엇을 하는지”**
- **widget은 “문서 화면에서 어떤 큰 블록인지”**
- **page는 “실제 어떤 URL 화면인지”**

그리고 FixLog에서는 아래 디테일을 반영한다.

- `model` 대신 `types` 사용
- `types` 아래에서 `type/interface/schema` 함께 관리
- API 함수는 기본적으로 `domain/api`
- feature는 domain api를 가져다 행동 흐름을 만든다

---

# 15. 최종 예시 요약

```txt
domains/documents/
  api/      -> 문서 리소스 서버 통신
  types/    -> 문서 타입, schema
  hooks/    -> 문서 조회 hook
  ui/       -> 문서 표현 UI
  lib/      -> 문서 관련 변환/가공 로직

features/documents/rename-document/
  hooks/    -> 문서 이름 변경 mutation/후처리
  ui/       -> 이름 변경 버튼, 다이얼로그
  types/    -> 이름 변경 폼 schema

widgets/document-header/
  ui/       -> 문서 제목, 상태, 이름 변경 버튼, 삭제 버튼 조합

pages/document-detail/
  ui/       -> 실제 문서 상세 화면
```

---

# 16. 이 문서를 기준으로 폴더를 만들 때 체크리스트

새 파일을 만들기 전 아래를 체크한다.

- 이건 문서 **자체**를 설명하는가? → `domain`
- 이건 문서에 대한 **행동**인가? → `feature`
- 이건 페이지 안의 **큰 화면 블록**인가? → `widget`
- 이건 실제 URL에 대응되는 **최종 화면**인가? → `page`
- 이건 정말 여러 곳에서 같이 쓸 **공통**인가? → `shared`

이 기준만 지켜도 구조가 크게 흔들리지 않는다.
