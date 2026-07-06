/**
 * React Query 관련 설정 상수
 */
export const QUERY_CONFIG = {
  /**
   * 기본 staleTime: 1분
   * 데이터가 fresh 상태로 유지되는 시간
   */
  STALE_TIME_ONE_MINUTE: 1000 * 60,

  /**
   * 기본 재시도 횟수: 1회
   * 요청 실패 시 재시도 횟수
   */
  DEFAULT_RETRY_COUNT: 1,
} as const;
