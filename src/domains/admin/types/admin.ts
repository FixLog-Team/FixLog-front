/**
 * FixLog Admin 도메인 타입. 서버 /api/workspaces/{id}/admin/* 응답 DTO 와 1:1.
 * 모든 조회는 요청자가 관리자인 워크스페이스로 범위가 한정된다(전역 조회 없음).
 */

export type AdminResourceType = 'DOCUMENT' | 'FOLDER';
export type AdminPrincipalType = 'USER' | 'GROUP';
/** 권한 타입(최신 모델). ALLOW(허용) / DENY(차단). 레벨(VIEWER/EDITOR/OWNER)은 폐기. */
export type AdminPermissionType = 'ALLOW' | 'DENY';
export type AuditAction =
  // 접근 기록
  | 'VIEW'
  | 'DOWNLOAD'
  | 'EDIT'
  | 'DELETE'
  | 'SHARE'
  | 'RESTORE'
  // 권한 변경 기록(서버 V12~)
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE'
  | 'ROLE_CHANGE'
  | 'MEMBER_INVITE'
  | 'MEMBER_REMOVE'
  | 'GROUP_MEMBER_CHANGE'
  | 'ACCESS_POLICY_CHANGE';
export type AuditResult = 'ALLOWED' | 'DENIED';
/** 워크스페이스 역할. 초대 발송 시 부여 역할로도 쓴다. */
export type AdminWorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
/** 초대 상태(서버 InvitationStatus). */
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
/** 계정 상태(서버 UserStatus). */
export type AdminUserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'WITHDRAW';
/** 유효 권한 출처(서버 PermissionSource). */
export type AdminPermissionSource = 'DIRECT' | 'INHERITED' | 'WORKSPACE_DEFAULT';

/**
 * GET .../admin/users/{userId}/access 응답 요소 (서버 EffectivePermissionDto).
 * 상속·워크스페이스 기본값까지 계산된 리소스별 최종 접근 결과.
 */
export interface AdminEffectivePermission {
  resourceType: AdminResourceType;
  resourceId: string;
  resourceName: string | null;
  access: boolean;
  source: AdminPermissionSource;
  sourceDetail: string;
  canDownload: boolean;
}

/** GET .../admin/users, .../admin/users/{userId} 응답 (서버 AdminUserDto). */
export interface AdminUser {
  userId: string;
  userName: string;
  email: string;
  role: AdminWorkspaceRole;
  userStatus: AdminUserStatus;
  joinedAt: string; // ISO-8601
  lastLoginAt: string | null; // ISO-8601
}

/** GET .../admin/stats — 문서·폴더 현황. */
export interface WorkspaceStats {
  documentCount: number;
  folderCount: number;
  trashedDocumentCount: number;
  trashedFolderCount: number;
  /** 작성자 이름 → 문서 수. */
  documentCountByUser: Record<string, number>;
}

/** GET .../admin/permissions, .../admin/shares 항목 (서버 AdminPermissionDto). */
export interface AdminPermission {
  permissionId: string;
  resourceType: AdminResourceType;
  resourceId: string;
  resourceName: string | null;
  principalType: AdminPrincipalType;
  principalId: string;
  principalName: string | null;
  permissionType: AdminPermissionType;
  canDownload: boolean;
  createAt: string; // ISO-8601
}

/**
 * GET .../admin/permissions/resources/{type}/{id} 응답.
 * 리소스에 설정된 권한 목록 + (폴더면) 현재 상속·기본 접근 설정. 문서면 inherit/base 는 null.
 */
export interface AdminResourcePermissions {
  permissions: AdminPermission[];
  inheritFromParent: boolean | null;
  baseAccess: AdminPermissionType | null;
}

/** POST .../admin/permissions 요청 (직접 권한 부여). permissionType 생략 시 ALLOW, canDownload 생략 시 true. */
export interface AdminGrantPermissionBody {
  resourceType: AdminResourceType;
  resourceId: string;
  principalType: AdminPrincipalType;
  principalId: string;
  permissionType?: AdminPermissionType;
  canDownload?: boolean;
}

/** PUT .../admin/permissions/{permissionId} 요청 (기존 권한 수정). */
export interface AdminUpdatePermissionBody {
  permissionType?: AdminPermissionType;
  canDownload?: boolean;
}

/** PATCH .../admin/permissions/resources/folders/{folderId}/settings 요청 (폴더 상속·기본 접근). */
export interface FolderSettingsBody {
  /** true 면 부모 폴더 권한을 상속(기본값 true). */
  inheritFromParent?: boolean;
  /** 직접 권한이 없는 구성원에게 적용되는 기본 접근(ALLOW/DENY, 기본 ALLOW). */
  baseAccess?: AdminPermissionType;
}

/** GET/POST .../admin/invitations 항목 (서버 InvitationDto). */
export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: AdminWorkspaceRole;
  status: InvitationStatus;
  expiresAt: string | null; // ISO-8601
  createAt: string; // ISO-8601
  invitedByName: string | null;
}

/** POST .../admin/invitations 요청. role 생략 시 MEMBER. */
export interface InviteBody {
  email: string;
  role?: AdminWorkspaceRole;
}

/** GET .../admin/audit-logs 항목 (서버 AuditLogDto). */
export interface AuditLog {
  logId: string;
  actorUserId: string;
  actorName: string | null;
  action: AuditAction;
  /** 접근 기록에만 있음. 권한 변경 기록에서는 null. */
  resourceType: AdminResourceType | null;
  resourceId: string | null;
  /** 권한 변경의 대상(USER/GROUP). 권한 변경 기록에만 존재. */
  targetPrincipalType: AdminPrincipalType | null;
  targetPrincipalId: string | null;
  targetName: string | null;
  /** 변경 전후 요약(예: "MEMBER → ADMIN"). 권한 변경 기록에만 존재. */
  detail: string | null;
  /** true 면 권한 변경 기록, false 면 접근 기록. */
  permissionChange: boolean;
  result: AuditResult;
  /** 관리자 특권으로 접근했는지(권한을 받아서 본 것과 구분). */
  viaAdmin: boolean;
  createAt: string; // ISO-8601
}

/** 감사 로그 필터. 비운 조건은 서버가 무시한다. */
export interface AuditLogFilter {
  actorUserId?: string;
  action?: AuditAction;
  result?: AuditResult;
  /** ISO-8601 date-time. */
  from?: string;
  to?: string;
}
