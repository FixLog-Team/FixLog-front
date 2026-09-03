/**
 * localStorage/sessionStorage 키 상수
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  /** 현재 선택된 워크스페이스. 없으면 개인 워크스페이스로 동작(헤더 생략). */
  WORKSPACE_ID: 'workspace_id',
} as const;
