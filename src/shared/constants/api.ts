/**
 * API Mock Delay Constants
 *
 * Mock API 응답 시뮬레이션을 위한 딜레이 시간 정의
 * 실제 API 연동 시 제거됩니다.
 */
export const API_MOCK_DELAY = {
  /** 조회(GET) API 딜레이 (ms) */
  FETCH: 100,

  /** 생성/수정(POST/PUT/PATCH) API 딜레이 (ms) */
  MUTATE: 300,

  /** 검색(SEARCH) API 딜레이 (ms) */
  SEARCH: 200,
} as const;
