> 동일한 prop이 중간 컴포넌트를 거쳐 계속 내려가면 수정 범위가 쓸데없이 넓어진다.

# Props Drilling 지우기

## 왜 필요한가

중간 컴포넌트가 실제로 쓰지도 않는 prop을 전달만 하면,
나중에 prop 하나를 없앨 때 관련 파일을 너무 많이 건드리게 된다.

## FixLog 규칙

아래 상황이면 props drilling 제거를 검토한다.

- 2단계 이상 연속 전달
- 중간 컴포넌트가 prop을 사용하지 않음
- 하나의 모달/섹션 내부에서만 공유되는 상태
- editor sub tree에서 공통 상태를 여러 자식이 참조

## 해결 방법

- Compound Component
- Local Context
- Custom Hook + Provider
- slot pattern

## 예시

`DocumentEditorModal -> DocumentEditorBody -> Toolbar -> SaveButton`
로 `documentId`, `canEdit`, `onSave`, `saving`을 계속 넘기지 않는다.

대신:

- `DocumentEditorProvider`
- `useDocumentEditorContext`

를 사용한다.

## 주의

전역 상태로 올릴 필요가 없는 것은 로컬 context에 둔다.
props drilling을 없애겠다고 아무 상태나 zustand 전역 스토어로 올리면 오히려 더 나빠질 수 있다.
