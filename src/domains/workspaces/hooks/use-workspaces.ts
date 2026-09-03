import { useQuery } from '@tanstack/react-query';
import { workspacesApi } from '@/domains/workspaces/api/workspaces.api';

/** 내가 속한 워크스페이스 목록 조회(사이드바 스위처용). */
export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi.list(),
  });
}
