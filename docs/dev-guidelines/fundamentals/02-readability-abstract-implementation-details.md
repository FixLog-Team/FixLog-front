> 페이지가 자기 역할을 설명하는 수준에서 읽혀야 한다는 내용이다. 로그인 체크와 리다이렉트 세부사항을 페이지에 그대로 드러내지 말고 감싸라고 제안해야 한다.

# 구현 상세 추상화하기

## 왜 필요한가

페이지는 "무엇을 하는지"가 먼저 읽혀야 한다.
세부 구현이 먼저 나오면 페이지의 역할이 흐려진다.

## FixLog 규칙

- 라우팅 보호, 인증 체크, 권한 체크, 리다이렉트, feature flag 판정은 Wrapper/Hook으로 숨긴다.
- 페이지는 비즈니스 문장 수준으로 읽혀야 한다.
- 구현 상세는 page가 아니라 feature/domain/shared로 내린다.

## 예시

### 안 좋은 예

`EditorPage`에서 직접:

- 로그인 여부 확인
- 문서 접근 권한 확인
- 없으면 `/login` 이동
- 초안 복구 여부 확인
- 협업 세션 초기화

### 좋은 예

- `RequireAuth`
- `RequireDocumentAccess`
- `useRestoreDraft`
- `useInitCollaborationSession`

page에서는:

- "에디터를 렌더링한다"
- "필요한 섹션을 조립한다"
  정도만 보여야 한다.

## 네이밍 예시

- `useDocumentAccessGuard`
- `withAuthGuard`
- `useInitializeEditorSession`

## 금지

- page 컴포넌트에서 직접 `location.href`, `window.history`, raw role string 비교 남발
