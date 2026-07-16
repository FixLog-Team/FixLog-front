import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 문서 복제. 새로 생성된 문서 정보를 반환. */
export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.duplicate(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
