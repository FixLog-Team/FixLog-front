import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents';
import { QUERY_KEYS } from '@/app/config/query-keys';

/**
 * 문서를 특정 히스토리로 복원한다.
 * 복원 자체가 새 히스토리 항목을 만들므로 문서 상세와 히스토리 목록을 함께 갱신한다.
 */
export function useRestoreDocument(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (historyId: string) => documentsApi.restoreHistory(documentId, historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.history(documentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    },
  });
}
