import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/domains/workspaces/api/workspaces.api';
import type { WorkspaceRole } from '@/domains/workspaces/types/workspace';

const membersKey = (workspaceId: string) =>
  ['workspace-members', workspaceId] as const;

// FixLog Admin(useAdminUsers/useAdminUser 등)이 같은 멤버 상태를 별도 쿼리 키로
// 캐시하므로, 멤버 변경 시 함께 무효화하지 않으면 관리자 화면이 새로고침 전까지
// 이전 값을 보여준다.
const adminUsersKey = (workspaceId: string) => ['admin', workspaceId] as const;

/** 워크스페이스 구성원 목록. enabled 로 팝업 열림 시에만 조회. */
export function useWorkspaceMembers(workspaceId: string, enabled: boolean) {
  return useQuery({
    queryKey: membersKey(workspaceId),
    queryFn: () => workspacesApi.listMembers(workspaceId),
    enabled: enabled && !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => workspacesApi.invite(workspaceId, email),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) }),
  });
}

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { userId: string; role: WorkspaceRole }) =>
      workspacesApi.changeRole(workspaceId, v.userId, v.role),
    // 성공/실패 모두 서버 상태로 되돌리기 위해 목록 갱신.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) });
      queryClient.invalidateQueries({ queryKey: adminUsersKey(workspaceId) });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      workspacesApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) });
      queryClient.invalidateQueries({ queryKey: adminUsersKey(workspaceId) });
    },
  });
}
