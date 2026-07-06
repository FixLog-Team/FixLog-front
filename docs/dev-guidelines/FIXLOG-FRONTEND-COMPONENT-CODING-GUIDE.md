# FixLog 프론트엔드 컴포넌트 코딩 가이드

> 이 문서는 FixLog 프론트엔드에서 React 컴포넌트를 작성할 때 따르는 공통 규칙을 정리한 문서이다.  
> 목적은 코드 스타일 취향을 맞추는 것이 아니라, **읽기 쉬운 구조**, **예측 가능한 선언 순서**, **일관된 import 규칙**을 팀 단위로 유지하는 데 있다.

---

# 1. 적용 범위

이 문서는 기본적으로 `src/` 내부에서 작성하는 React 컴포넌트 코드에 적용한다.

- 컴포넌트 파일명
- 컴포넌트명
- 컴포넌트 내부 선언 순서
- JSX에서 props를 전달하는 순서
- `src/` 내부 import 경로 규칙

운영 원칙:

- 새로 작성하는 코드는 이 규칙을 바로 적용한다.
- 기존 코드는 수정이 발생할 때 함께 정렬한다.
- 한 번에 대규모 rename만 수행하는 정리는 별도 작업으로 분리한다.

---

# 2. 컴포넌트 네이밍 규칙

파일 이름과 컴포넌트 이름은 모두 **PascalCase**를 엄격하게 사용한다.

규칙:

- 파일명은 반드시 첫 글자를 대문자로 시작한다.
- 컴포넌트명은 반드시 첫 글자를 대문자로 시작한다.
- 파일명에 `-`와 `_`를 사용하지 않는다.
- `camelCase` 컴포넌트명은 허용하지 않는다.

왜 필요한가?

- JSX에서 컴포넌트는 타입처럼 읽힌다.
- 파일명과 컴포넌트명이 일치하면 탐색이 빠르다.
- 운영체제별 대소문자 차이에서 생기는 혼란을 줄일 수 있다.

## 2.1 잘못된 예

```txt
user-profile.tsx
user_profile.tsx
userProfile.tsx
```

```tsx
const userProfile = () => {
  return <div />;
};
```

## 2.2 올바른 예

```txt
UserProfile.tsx
DocumentHeader.tsx
RenameDocumentButton.tsx
```

```tsx
export const UserProfile = () => {
  return <div />;
};
```

```tsx
export function DocumentHeader() {
  return <header />;
}
```

## 2.3 권장 패턴

컴포넌트 파일과 export 이름은 최대한 동일하게 맞춘다.

```txt
src/widgets/document-header/ui/DocumentHeader.tsx
```

```tsx
export function DocumentHeader() {
  return <header />;
}
```

---

# 3. 컴포넌트 내부 선언 순서

컴포넌트 내부 로직은 **React의 데이터 흐름과 생명주기 순서**에 맞춰 위에서 아래로 배치한다.

기본 순서:

1. 상태 (`useState`, `useReducer`)
2. 파생/기타 훅 (`useContext`, `useMemo`, `useCallback`, `useRef`, router hook, query hook 등)
3. 일반 변수
4. 함수
5. 부수 효과 (`useEffect`, `useLayoutEffect`)
6. `return`

핵심 원칙:

- 읽는 사람은 위에서 아래로 내려가며 컴포넌트를 이해할 수 있어야 한다.
- effect는 부수 효과이므로 함수/변수보다 아래에 둔다.
- `return` 위에 필요한 선언이 모두 끝나 있어야 한다.
- 같은 그룹 안에서는 의존성이 먼저 오는 순서로 정렬한다.

## 3.1 예시

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { getUserProfile } from '@/domains/user/api/get-user-profile.api';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  // 1. 상태
  const [user, setUser] = useState<null | { email: string; grade: string }>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. 파생/기타 훅
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPremiumUser = useMemo(() => user?.grade === 'premium', [user]);

  // 3. 일반 변수
  const defaultAvatarUrl = '/images/default-avatar.png';
  const displayEmail = user?.email ?? '이메일 없음';

  // 4. 함수
  const handleUpdateProfile = () => {
    console.log('프로필 업데이트 로직');
  };

  const handleDeleteAccount = () => {
    console.log('계정 삭제 로직');
  };

  // 5. 부수 효과
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);

      try {
        const profile = await getUserProfile(userId);
        setUser(profile);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [userId]);

  // 6. 렌더링
  return (
    <div ref={containerRef}>
      <img src={defaultAvatarUrl} alt="" />
      <div>{displayEmail}</div>
      <div>{isPremiumUser ? '프리미엄 사용자' : '일반 사용자'}</div>
      <button type="button" onClick={handleUpdateProfile} disabled={isLoading}>
        저장
      </button>
      <button type="button" onClick={handleDeleteAccount}>
        계정 삭제
      </button>
    </div>
  );
}
```

## 3.2 피해야 하는 예

```tsx
export function UserProfile() {
  useEffect(() => {
    console.log('mounted');
  }, []);

  const handleClick = () => {};
  const title = 'profile';
  const [isOpen, setIsOpen] = useState(false);

  return <div>{title}</div>;
}
```

위 예시는 effect, 함수, 변수, state가 섞여 있어 읽는 흐름이 자주 끊긴다.

---

# 4. Props 선언 순서

이 규칙은 **JSX에서 컴포넌트를 호출하며 props를 넘길 때의 순서**를 의미한다.

일반적인 데이터 props는 상단에 자유롭게 배치해도 되지만, **최하단 3개 구간의 순서는 고정**한다.

최하단 순서 규칙:

1. 함수 props
2. 명시적 boolean props
3. 축약형 boolean props

## 4.1 왜 이렇게 정렬하는가?

- 데이터 설정과 동작 연결을 구분해서 읽을 수 있다.
- 하단으로 갈수록 “행동”과 “상태 플래그”가 모여 보여서 JSX 스캔 속도가 빨라진다.
- shorthand boolean은 가장 눈에 잘 띄어야 하므로 마지막에 둔다.

## 4.2 예시

```tsx
return (
  <CustomButton
    title="프로필 저장"
    variant="primary"
    size="large"
    onClick={handleUpdateProfile}
    onHover={handleHoverEffect}
    isDarkTheme={false}
    disabled
    autoFocus
  />
);
```

## 4.3 피해야 하는 예

```tsx
return (
  <CustomButton
    disabled
    title="프로필 저장"
    onClick={handleUpdateProfile}
    autoFocus
    variant="primary"
    isDarkTheme={false}
  />
);
```

## 4.4 권장 보조 규칙

props 타입/interface를 선언할 때도 같은 읽기 흐름을 유지하면 더 좋다.

권장 순서:

- 일반 데이터
- 함수
- boolean

```tsx
interface CustomButtonProps {
  title: string;
  variant: 'primary' | 'secondary';
  size: 'small' | 'large';
  onClick: () => void;
  onHover?: () => void;
  isDarkTheme?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}
```

---

# 5. 절대 경로 import 규칙

`src/` 내부 코드에서는 모든 import를 **절대 경로**로 작성한다.

FixLog 프론트엔드의 기본 alias는 `@/` 이다.

규칙:

- `src/` 내부 import는 `@/` 절대 경로를 사용한다.
- `./`, `../` 상대 경로 import는 금지한다.
- 같은 폴더의 파일을 가져올 때도 절대 경로를 우선한다.
- 이 규칙은 주로 `src/` 내부 애플리케이션 코드에 적용한다.

왜 필요한가?

- 경로 깊이가 깊어져도 import 가독성이 유지된다.
- 파일 이동 시 import 수정 범위가 줄어든다.
- `../../../../` 형태의 path hell을 방지할 수 있다.

## 5.1 금지 예시

```tsx
import { Button } from '../../../shared/ui/Button';
import { formatDate } from '../../shared/lib/utils/date';
import { RenameDocumentDialog } from './RenameDocumentDialog';
```

## 5.2 권장 예시

```tsx
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/lib/utils/date';
import { RenameDocumentDialog } from '@/features/documents/rename-document/ui/RenameDocumentDialog';
```

## 5.3 현재 프로젝트 기준 alias 설정

현재 FixLog 프론트엔드는 이미 `@/` alias를 사용하도록 설정되어 있다.

`tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`vite.config.ts`

```ts
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

즉, FixLog에서는 `@components`, `@utils` 같은 여러 alias를 나누기보다,  
**`@/` 하나로 `src` 전체를 기준 삼아 import를 통일**한다.

---

# 6. 팀 운영 원칙

이 문서는 단순 참고 문서가 아니라 팀 기본 합의로 사용한다.

실무 적용 기준:

- 리뷰 시 파일명, 컴포넌트명, import 경로를 함께 확인한다.
- 새 컴포넌트는 생성 시점부터 PascalCase를 사용한다.
- JSX props 순서가 섞이면 정리 후 병합한다.
- 상대 경로 import를 발견하면 해당 변경에서 같이 바로잡는 것을 권장한다.

한 줄 요약:

- 컴포넌트는 PascalCase
- 내부는 `state -> other hooks -> variables -> functions -> effects -> return`
- JSX props 하단은 `function -> explicit boolean -> short boolean`
- `src/` 내부 import는 `@/` 절대 경로만 사용
