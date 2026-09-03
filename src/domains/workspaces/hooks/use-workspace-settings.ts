import { useQuery } from '@tanstack/react-query';
import { workspacesApi } from '@/domains/workspaces/api/workspaces.api';

/** 워크스페이스 AI 사용량 요약. 권한 없으면(403 등) 재시도 없이 에러 노출. */
export function useAiUsage(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['ai-usage', workspaceId],
    queryFn: () => workspacesApi.getAiUsage(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}

/** 워크스페이스 보안 정책(구성원이면 조회 가능). */
export function useSecurityPolicy(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['security-policy', workspaceId],
    queryFn: () => workspacesApi.getSecurityPolicy(workspaceId as string),
    enabled: !!workspaceId,
    retry: false,
  });
}
