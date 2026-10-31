import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkApi } from '@/domains/bulk/api/bulk.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type { BulkTargets, BulkMoveBody } from '@/domains/bulk/types/bulk';

/**
 * 일괄 삭제/이동 후 문서·폴더·휴지통 목록을 함께 갱신한다.
 * 검색 결과에서 일괄 작업을 하는 경우도 있으므로 제목 검색 캐시도 무효화한다
 * (안 하면 삭제·이동한 항목이 검색 결과에 그대로 남는다).
 */
function useInvalidateAfterBulk() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trash });
    queryClient.invalidateQueries({ queryKey: ['search'] });
  };
}

export function useBulkDelete() {
  const invalidate = useInvalidateAfterBulk();
  return useMutation({
    mutationFn: (targets: BulkTargets) => bulkApi.remove(targets),
    onSuccess: invalidate,
  });
}

export function useBulkMove() {
  const invalidate = useInvalidateAfterBulk();
  return useMutation({
    mutationFn: (body: BulkMoveBody) => bulkApi.move(body),
    onSuccess: invalidate,
  });
}

/** 일괄 다운로드(ZIP) 후 브라우저 저장(a[download] 트리거). */
export function useBulkDownload() {
  return useMutation({
    mutationFn: async (targets: BulkTargets) => {
      const blob = await bulkApi.download(targets);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fixlog-bulk.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}
