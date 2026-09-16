import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  AdminUser,
  AdminEffectivePermission,
  AdminPermission,
  AdminResourcePermissions,
  AdminGrantPermissionBody,
  AdminUpdatePermissionBody,
  AdminResourceType,
  FolderSettingsBody,
  Invitation,
  InviteBody,
  AuditLog,
  AuditLogFilter,
  WorkspaceStats,
} from '@/domains/admin/types/admin';

/**
 * FixLog Admin API (관리자만, 서버 AdminConsole/Permission/Invitation Controller).
 *   GET    /api/workspaces/{id}/admin/stats                                  → stats
 *   GET    /api/workspaces/{id}/admin/shares                                 → shares (생성자 소유 권한 제외)
 *   GET    /api/workspaces/{id}/admin/permissions                           → permissions (모든 권한 행)
 *   GET    /api/workspaces/{id}/admin/permissions/resources/{type}/{id}     → 리소스별 권한 목록
 *   POST   /api/workspaces/{id}/admin/permissions                           → 권한 직접 부여
 *   PUT    /api/workspaces/{id}/admin/permissions/{permissionId}            → 권한 수정
 *   DELETE /api/workspaces/{id}/admin/permissions/{permissionId}            → 권한 회수
 *   PATCH  /api/workspaces/{id}/admin/permissions/resources/folders/{id}/settings → 폴더 상속·기본 접근
 *   GET    /api/workspaces/{id}/admin/audit-logs                            → auditLogs (필터)
 *   GET    /api/workspaces/{id}/admin/invitations                           → 초대 목록
 *   POST   /api/workspaces/{id}/admin/invitations                          → 초대 발송
 *   DELETE /api/workspaces/{id}/admin/invitations/{invitationId}           → 초대 취소
 */
const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/admin`;

export const adminApi = {
  async stats(workspaceId: string): Promise<WorkspaceStats> {
    const res = await http.get<ApiResponse<WorkspaceStats>>(`${base(workspaceId)}/stats`);
    return unwrap(res);
  },

  async shares(workspaceId: string): Promise<AdminPermission[]> {
    const res = await http.get<ApiResponse<AdminPermission[]>>(`${base(workspaceId)}/shares`);
    return unwrap(res);
  },

  async permissions(workspaceId: string): Promise<AdminPermission[]> {
    const res = await http.get<ApiResponse<AdminPermission[]>>(
      `${base(workspaceId)}/permissions`
    );
    return unwrap(res);
  },

  /** 구성원 상세 목록(userStatus·lastLoginAt 포함). */
  async listUsers(workspaceId: string): Promise<AdminUser[]> {
    const res = await http.get<ApiResponse<AdminUser[]>>(`${base(workspaceId)}/users`);
    return unwrap(res);
  },

  /** 특정 구성원 상세. */
  async getUser(workspaceId: string, userId: string): Promise<AdminUser> {
    const res = await http.get<ApiResponse<AdminUser>>(`${base(workspaceId)}/users/${userId}`);
    return unwrap(res);
  },

  /** 특정 구성원의 유효 접근 목록(상속·기본값 반영). 리소스별 access/source/canDownload. */
  async userAccess(workspaceId: string, userId: string): Promise<AdminEffectivePermission[]> {
    const res = await http.get<ApiResponse<AdminEffectivePermission[]>>(
      `${base(workspaceId)}/users/${userId}/access`
    );
    return unwrap(res);
  },

  async auditLogs(workspaceId: string, filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    // 빈 문자열은 보내지 않는다(서버 enum/uuid 파싱 400 방지).
    const params = Object.fromEntries(
      Object.entries(filter).filter(([, v]) => v !== undefined && v !== '')
    );
    const res = await http.get<ApiResponse<AuditLog[]>>(`${base(workspaceId)}/audit-logs`, {
      params,
    });
    return unwrap(res);
  },

  // ── 권한 직접 관리 (Admin) ─────────────────────────────────────────────

  /** 특정 리소스에 설정된 권한 목록 + (폴더면) 현재 상속·기본 접근 설정. */
  async resourcePermissions(
    workspaceId: string,
    resourceType: AdminResourceType,
    resourceId: string
  ): Promise<AdminResourcePermissions> {
    const res = await http.get<ApiResponse<AdminResourcePermissions>>(
      `${base(workspaceId)}/permissions/resources/${resourceType}/${resourceId}`
    );
    return unwrap(res);
  },

  /** 권한 직접 부여(공유 설정 없이도 가능). 같은 대상 재부여 시 서버가 덮어쓴다. */
  async grantPermission(
    workspaceId: string,
    body: AdminGrantPermissionBody
  ): Promise<AdminPermission> {
    const res = await http.post<ApiResponse<AdminPermission>>(
      `${base(workspaceId)}/permissions`,
      body
    );
    return unwrap(res);
  },

  /** 기존 권한의 타입/다운로드 여부 수정. */
  async updatePermission(
    workspaceId: string,
    permissionId: string,
    body: AdminUpdatePermissionBody
  ): Promise<AdminPermission> {
    const res = await http.put<ApiResponse<AdminPermission>>(
      `${base(workspaceId)}/permissions/${permissionId}`,
      body
    );
    return unwrap(res);
  },

  /** 권한 회수. */
  async deletePermission(workspaceId: string, permissionId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${base(workspaceId)}/permissions/${permissionId}`
    );
    ensureSuccess(res);
  },

  /** 폴더 상속(inheritFromParent)·기본 접근(baseAccess) 설정. */
  async updateFolderSettings(
    workspaceId: string,
    folderId: string,
    body: FolderSettingsBody
  ): Promise<void> {
    const res = await http.patch<ApiResponse<unknown>>(
      `${base(workspaceId)}/permissions/resources/folders/${folderId}/settings`,
      body
    );
    ensureSuccess(res);
  },

  // ── 초대 관리 (Admin) ──────────────────────────────────────────────────

  /** 초대 목록(PENDING/ACCEPTED/DECLINED/EXPIRED). */
  async listInvitations(workspaceId: string): Promise<Invitation[]> {
    const res = await http.get<ApiResponse<Invitation[]>>(
      `${base(workspaceId)}/invitations`
    );
    return unwrap(res);
  },

  /** 초대 발송. 미가입 이메일도 가능하며 서버가 이메일로 토큰을 보낸다. role 생략 시 MEMBER. */
  async invite(workspaceId: string, body: InviteBody): Promise<Invitation> {
    const res = await http.post<ApiResponse<Invitation>>(
      `${base(workspaceId)}/invitations`,
      body
    );
    return unwrap(res);
  },

  /** 초대 취소. */
  async cancelInvitation(workspaceId: string, invitationId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${base(workspaceId)}/invitations/${invitationId}`
    );
    ensureSuccess(res);
  },
};
