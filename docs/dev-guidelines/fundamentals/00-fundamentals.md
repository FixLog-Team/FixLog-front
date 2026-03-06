# FixLog 최종 운영 규칙

위 17개를 FixLog에 실제로 적용할 때는 아래 8개를 팀 기본 합의로 두는 게 좋습니다. 이건 fundamentals 문서의 17개 실전 가이드를 FixLog 구조에 맞게 압축한 운영 버전입니다. 각 규칙은 가독성, 예측 가능성, 응집도, 결합도라는 4가지 축에 대응합니다.

page는 조립만 한다.
인증, 권한, API 세부사항, 정규화 로직을 page에 길게 두지 않는다.

domain은 도메인 규칙을 모은다.
type, schema, api, constants, lib는 domain 안에 둔다.

feature는 사용자 행동을 조합한다.
API 호출 + 성공/실패 처리 + query invalidation + toast는 feature hook에 둔다.

shared는 정말 공용일 때만 올린다.
“2번 썼다”가 아니라 “앞으로도 여러 도메인에서 함께 바뀐다”여야 한다.

서버 조회 Hook 반환 규칙을 통일한다.
TanStack Query 기반 조회 Hook은 query 객체 반환으로 통일.

숫자와 문자열 정책은 이름을 준다.
staleTime, debounce, page size, max size, status label은 상수나 맵으로 관리.

중간 전달 prop이 늘어나면 local context를 검토한다.

공통화보다 변경 방향을 먼저 본다.
요구사항이 조금씩 달라질 모달/리스트/툴바는 처음부터 억지로 합치지 않는다.

내가 보는 핵심 결론

FixLog에 가장 잘 맞는 방향은 이거예요.

토스 지침의 핵심 철학은 그대로 가져간다

하지만 FixLog는 문서/에디터/AI job/업로드처럼 도메인 성격이 강하므로

“종류별 정리”보다 “도메인 + 행동 + 조합” 중심 구조가 더 잘 맞는다

즉, FixLog의 dev-guidelines는 단순 클린코드 문서가 아니라
**“우리 폴더 구조와 Hook 규칙까지 포함한 팀 운영 규약”**이어야 합니다.
