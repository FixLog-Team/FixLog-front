import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type { CreateDocumentBody } from '@/domains/documents/types/document';

/** 새 문서 생성. */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDocumentBody) => documentsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
