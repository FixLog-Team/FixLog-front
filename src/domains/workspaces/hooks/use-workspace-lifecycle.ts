import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/domains/workspaces/api/workspaces.api';

/**
 * 워크스페이스 나가기(구성원·관리자). 성공 시 스위처 목록을 갱신한다.
 * 현재 선택 해제·화면 이동은 호출부(설정 페이지)가 처리한다.
 * 서버 규칙: 개인 워크스페이스 불가, 마지막 관리자 불가.
 */
export function useLeaveWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => workspacesApi.leave(workspaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

/**
 * 워크스페이스 삭제(소유자). 성공 시 스위처 목록을 갱신한다.
 * ⚠️ 서버(hs/saas·프로덕션)에 아직 DELETE /api/workspaces/{id} 가 없어 현재는 실패한다.
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => workspacesApi.remove(workspaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}
