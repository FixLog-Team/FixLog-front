> 하나의 Hook이 URL 쿼리, 날짜 파싱, 필터 상태, API payload shaping까지 다 하면 읽기 어렵고 수정도 어렵다/# 로직 종류에 따라 합쳐진 함수 쪼개기

## 왜 필요한가

한 Hook이 여러 종류의 맥락을 동시에 다루면

- 읽기 어렵고
- 테스트가 어려워지고
- 수정 시 영향 범위를 예측하기 어려워진다.

## FixLog 규칙

하나의 Hook/함수는 아래 중 가능한 한 한 종류의 책임만 가진다.

- URL 상태 관리
- 폼 상태 관리
- 서버 상태 조회
- 서버 상태 변경
- 데이터 변환/정규화
- UI 이벤트 조합
- 에디터 인스턴스 제어

## 예시

### 안 좋은 예

`useDocumentPageState`

- search params 읽기
- query key 만들기
- API 요청
- 응답 정규화
- toast 처리
- modal 열기
- permission 판정

### 좋은 예

- `useDocumentSearchParams`
- `useDocumentListQuery`
- `normalizeDocumentListResponse`
- `useDeleteDocumentAction`
- `useDocumentPermission`

## 권장

feature hook은 "행동"만 조합하고,
domain은 타입/API/정규화,
shared는 범용 유틸만 가진다.
