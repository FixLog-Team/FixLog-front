import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 문서 삭제. */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.remove(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
      // 휴지통 목록도 갱신(복원 후 재삭제 시 휴지통에 다시 보이도록).
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trash });
    },
  });
}
