import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import type {
  AdminGrantPermissionBody,
  AdminResourceType,
  AdminUpdatePermissionBody,
  AuditLogFilter,
  FolderSettingsBody,
  InviteBody,
} from '@/domains/admin/types/admin';

const adminKey = (workspaceId: string, ...rest: unknown[]) =>
  ['admin', workspaceId, ...rest] as const;

/** FixLog Admin 조회 훅. 403(관리자 아님)은 재시도 없이 바로 에러로 노출한다. */
export function useAdminStats(workspaceId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'stats'),
    queryFn: () => adminApi.stats(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAdminShares(workspaceId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'shares'),
    queryFn: () => adminApi.shares(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAdminPermissions(workspaceId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'permissions'),
    queryFn: () => adminApi.permissions(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAdminUsers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'users'),
    queryFn: () => adminApi.listUsers(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAdminUser(workspaceId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'users', userId ?? ''),
    queryFn: () => adminApi.getUser(workspaceId as string, userId as string),
    enabled: !!workspaceId && !!userId,
    retry: false,
  });
}

export function useAdminUserAccess(workspaceId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'users', userId ?? '', 'access'),
    queryFn: () => adminApi.userAccess(workspaceId as string, userId as string),
    enabled: !!workspaceId && !!userId,
    retry: false,
  });
}

export function useAdminAuditLogs(workspaceId: string | undefined, filter: AuditLogFilter) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'audit-logs', filter),
    queryFn: () => adminApi.auditLogs(workspaceId as string, filter),
    enabled: !!workspaceId,
    retry: false,
  });
}

// ── 권한 직접 관리 ─────────────────────────────────────────────────────────

/** 특정 리소스(문서/폴더)의 권한 목록 + 현재 상속·기본 접근 설정. */
export function useAdminResourcePermissions(
  workspaceId: string | undefined,
  resourceType: AdminResourceType,
  resourceId: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'resource-permissions', resourceType, resourceId),
    queryFn: () => adminApi.resourcePermissions(workspaceId as string, resourceType, resourceId),
    enabled: enabled && !!workspaceId && !!resourceId,
    retry: false,
  });
}

/** 권한 부여·수정·회수·폴더 설정 후 관련 목록(리소스별·워크스페이스 권한/공유)을 함께 갱신한다. */
function useInvalidatePermissions(workspaceId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: adminKey(workspaceId, 'permissions') });
    queryClient.invalidateQueries({ queryKey: adminKey(workspaceId, 'shares') });
    queryClient.invalidateQueries({ queryKey: adminKey(workspaceId, 'resource-permissions') });
  };
}

export function useAdminGrantPermission(workspaceId: string) {
  const invalidate = useInvalidatePermissions(workspaceId);
  return useMutation({
    mutationFn: (body: AdminGrantPermissionBody) => adminApi.grantPermission(workspaceId, body),
    onSuccess: invalidate,
  });
}

export function useAdminUpdatePermission(workspaceId: string) {
  const invalidate = useInvalidatePermissions(workspaceId);
  return useMutation({
    mutationFn: ({ permissionId, body }: { permissionId: string; body: AdminUpdatePermissionBody }) =>
      adminApi.updatePermission(workspaceId, permissionId, body),
    onSuccess: invalidate,
  });
}

export function useAdminDeletePermission(workspaceId: string) {
  const invalidate = useInvalidatePermissions(workspaceId);
  return useMutation({
    mutationFn: (permissionId: string) => adminApi.deletePermission(workspaceId, permissionId),
    onSuccess: invalidate,
  });
}

export function useAdminUpdateFolderSettings(workspaceId: string) {
  const invalidate = useInvalidatePermissions(workspaceId);
  return useMutation({
    mutationFn: ({ folderId, body }: { folderId: string; body: FolderSettingsBody }) =>
      adminApi.updateFolderSettings(workspaceId, folderId, body),
    onSuccess: invalidate,
  });
}

// ── 초대 관리 ───────────────────────────────────────────────────────────────

export function useAdminInvitations(workspaceId: string | undefined) {
  return useQuery({
    queryKey: adminKey(workspaceId ?? '', 'invitations'),
    queryFn: () => adminApi.listInvitations(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAdminInvite(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteBody) => adminApi.invite(workspaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKey(workspaceId, 'invitations') });
    },
  });
}

export function useAdminCancelInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => adminApi.cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKey(workspaceId, 'invitations') });
    },
  });
}
