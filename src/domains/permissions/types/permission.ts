/**
 * 권한/공유 도메인 타입. 서버 PermissionDto / ShareRequest 와 대응 (FRONTEND_API_GUIDE 9장).
 */

export type PermissionLevel = 'VIEWER' | 'EDITOR' | 'OWNER';
export type PrincipalType = 'USER' | 'GROUP';

/** 공유 대상 리소스 종류. */
export type ResourceKind = 'document' | 'folder';

/** GET /api/{documents|folders}/{id}/permissions 응답 요소. */
export interface PermissionDto {
  permissionId: string;
  principalType: PrincipalType;
  principalId: string;
  principalName: string;
  level: PermissionLevel;
  canDownload: boolean;
  createAt: string | null;
}

/**
 * POST /api/{documents|folders}/{id}/permissions 요청 바디.
 * 사용자는 email 로, 그룹은 principalType=GROUP + principalId 로 지정한다.
 * canDownload 생략 시 true.
 */
export interface ShareBody {
  email?: string;
  principalType?: PrincipalType;
  principalId?: string;
  level: PermissionLevel;
  canDownload?: boolean;
}
