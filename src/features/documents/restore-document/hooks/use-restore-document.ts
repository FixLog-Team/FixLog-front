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
    onSuccess: (restored) => {
      // 무효화는 refetch 예약일 뿐이라 편집기를 다시 마운트하는 시점에는 아직 복원 전 본문이 남는다.
      // 서버가 돌려준 복원 결과를 캐시에 바로 넣어야 같은 렌더에서 되돌린 내용이 화면에 뜬다.
      queryClient.setQueryData(QUERY_KEYS.documents.detail(documentId), restored);
      // documents.all 은 상세·히스토리·목록을 모두 덮는 접두사다(상세는 같은 내용으로 다시 채워진다).
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.labels.document(documentId) });
    },
  });
}
