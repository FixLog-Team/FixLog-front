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
  /** 권한 대상자의 이메일. principalType 이 USER 일 때만 값이 있다(동명이인 구별용). */
  principalEmail?: string | null;
  permissionType: PermissionType;
  canDownload: boolean;
  /**
   * 이 대상자의 편집 가능 여부.
   * 현재 서버에는 공유 시 canEdit 을 켜는 API 가 없어(생성자·워크스페이스 관리자만 true)
   * 공유로 부여된 권한은 사실상 항상 false 다. 표시용으로만 둔다.
   */
  canEdit?: boolean;
  /**
   * null 이면 직접 부여된 권한. 값이 있으면 그 폴더에서 상속된 권한이라
   * 이 리소스에서는 회수할 수 없다(해당 폴더에서 회수해야 한다).
   */
  inheritedFromFolderId?: string | null;
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
  /**
   * 편집(저장) 가능 여부. 서버가 VIEW 외 동작을 이 값으로 막는다.
   * 구버전 서버 호환을 위해 optional — 값이 없으면 편집 가능으로 본다.
   */
  canEdit?: boolean;
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
