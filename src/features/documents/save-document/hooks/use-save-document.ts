import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type { SaveDocumentBody } from '@/domains/documents/types/document';

/** 문서 제목 + 본문(blocks) 저장. */
export function useSaveDocument(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveDocumentBody) => documentsApi.saveContent(documentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    },
  });
}
