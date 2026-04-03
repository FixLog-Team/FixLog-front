/**
 * Time Constants in Milliseconds
 *
 * 시간 관련 계산을 위한 밀리초 단위 상수 정의
 */
export const TIME_MS = {
  /** 1초 (밀리초) */
  SECOND: 1000,

  /** 1분 (밀리초) */
  MINUTE: 1000 * 60,

  /** 1시간 (밀리초) */
  HOUR: 1000 * 60 * 60,

  /** 1일 (밀리초) */
  DAY: 1000 * 60 * 60 * 24,

  /** 1주 (밀리초) */
  WEEK: 1000 * 60 * 60 * 24 * 7,
} as const;
