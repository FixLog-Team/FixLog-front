/**
 * 권한/공유 도메인 타입. 서버 PermissionDto / ShareRequest / MyPermissionDto 와 대응 (FRONTEND_API_GUIDE 9장).
 *
 * 권한 모델(최신): permissionType(ALLOW/DENY) + canDownload. 레벨(VIEWER/EDITOR/OWNER)은 폐기됨.
 * - ALLOW: 조회 허용, DENY: 명시적 차단(상속된 ALLOW보다 우선).
 * - 편집 여부(canEdit)는 서버 모델에 없다.
 */

/** 권한 타입. ALLOW(허용) / DENY(차단). */
export type PermissionType = 'ALLOW' | 'DENY';

/** 유효 권한의 출처(my-permission / effective 응답). */
export type PermissionSource = 'DIRECT' | 'INHERITED' | 'WORKSPACE_DEFAULT';

export type PrincipalType = 'USER' | 'GROUP';

/** 공유 대상 리소스 종류. */
export type ResourceKind = 'document' | 'folder';

/** GET /api/{documents|folders}/{id}/permissions 응답 요소. */
export interface PermissionDto {
  permissionId: string;
  principalType: PrincipalType;
  principalId: string;
  principalName: string;
  permissionType: PermissionType;
  canDownload: boolean;
  createAt: string | null;
}

/**
 * POST /api/{documents|folders}/{id}/permissions 요청 바디.
 * 사용자는 email 로, 그룹은 principalType=GROUP + principalId 로 지정한다.
 * permissionType 생략 시 ALLOW, canDownload 생략 시 true.
 */
export interface ShareBody {
  email?: string;
  principalType?: PrincipalType;
  principalId?: string;
  permissionType?: PermissionType;
  canDownload?: boolean;
}

/**
 * GET /api/{documents|folders}/{id}/my-permission 응답.
 * 내가 이 리소스에 대해 갖는 유효 권한과 출처 — 다운로드/편집 버튼 노출 판단에 사용.
 */
export interface MyPermissionDto {
  access: boolean;
  canDownload: boolean;
  source: PermissionSource;
  sourceDetail: string;
}
