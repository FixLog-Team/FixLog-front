import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 문서 제목 변경. */
export function useRenameDocument(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => documentsApi.updateTitle(documentId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
