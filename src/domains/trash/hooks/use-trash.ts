import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trashApi } from '@/domains/trash/api/trash.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type { TrashResourceType } from '@/domains/trash/types/trash';

const TRASH_KEY = ['trash'] as const;

/** 휴지통 목록 조회(현재 워크스페이스). */
export function useTrash() {
  return useQuery({
    queryKey: TRASH_KEY,
    queryFn: () => trashApi.list(),
  });
}

/** 복원/영구삭제 후 휴지통·문서·폴더 목록을 함께 갱신한다. */
function useInvalidateAfterTrashMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: TRASH_KEY });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
  };
}

/** 복원(부모가 휴지통이면 루트로). */
export function useRestoreTrash() {
  const invalidate = useInvalidateAfterTrashMutation();
  return useMutation({
    mutationFn: (v: { resourceType: TrashResourceType; resourceId: string }) =>
      trashApi.restore(v.resourceType, v.resourceId),
    onSuccess: invalidate,
  });
}

/** 영구 삭제(되돌릴 수 없음). */
export function usePurgeTrash() {
  const invalidate = useInvalidateAfterTrashMutation();
  return useMutation({
    mutationFn: (v: { resourceType: TrashResourceType; resourceId: string }) =>
      trashApi.purge(v.resourceType, v.resourceId),
    onSuccess: invalidate,
  });
}
