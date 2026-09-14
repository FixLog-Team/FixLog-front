import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/domains/workspaces/api/workspaces.api';
import type { SecurityPolicyUpdateBody } from '@/domains/workspaces/types/workspace';

/** 워크스페이스 보안 정책(구성원이면 조회 가능). */
export function useSecurityPolicy(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['security-policy', workspaceId],
    queryFn: () => workspacesApi.getSecurityPolicy(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

/** 보안 정책 수정(관리자). 성공 시 정책 조회를 갱신한다. */
export function useUpdateSecurityPolicy(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SecurityPolicyUpdateBody) =>
      workspacesApi.updateSecurityPolicy(workspaceId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['security-policy', workspaceId] }),
  });
}
