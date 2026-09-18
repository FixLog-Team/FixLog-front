/**
 * 권한/공유 도메인 타입. 서버 PermissionDto / ShareRequest / MyPermissionDto 와 대응 (FRONTEND_API_GUIDE 9장).
 *
 * 권한 모델(최신): permissionType(ALLOW) + canDownload. 레벨(VIEWER/EDITOR/OWNER)은 폐기됨.
 * - ALLOW: 조회 허용. 접근을 막으려면 공유를 취소한다(DENY 는 폐기됨).
 */

import type { DocumentDto } from '@/domains/documents/types/document';
import type { FolderItem } from '@/domains/folders/types/folder';

/** 권한 타입. ALLOW(허용) 하나로 통일됨. */
export type PermissionType = 'ALLOW';

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

/**
 * GET /api/documents/shared-with-me 응답 result.
 * 내가 만들지 않았지만 권한을 받은 폴더·문서를 두 목록으로 나눠 반환한다
 * (현재 워크스페이스 공유 + 다른 사용자 개인 워크스페이스에서 직접 공유받은 항목 합산).
 */
export interface SharedWithMeDto {
  folders: FolderItem[];
  documents: DocumentDto[];
}
