/**
 * localStorage/sessionStorage 키 상수
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  /** 현재 선택된 워크스페이스. 없으면 개인 워크스페이스로 동작(헤더 생략). */
  WORKSPACE_ID: 'workspace_id',
  /** 사용자별 마지막 접속 워크스페이스 맵({ [userId]: workspaceId }). 계정 전환·재로그인 시 복원용. */
  LAST_WORKSPACE_BY_USER: 'last_workspace_by_user',
  /** 비로그인 상태로 초대 링크 진입 시 보존하는 토큰. 로그인 콜백에서 자동 수락에 사용. */
  PENDING_INVITE_TOKEN: 'pending_invite_token',
} as const;
