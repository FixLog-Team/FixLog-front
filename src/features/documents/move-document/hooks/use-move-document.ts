import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

interface MoveDocumentVars {
  documentId: string;
  /** 대상 폴더. 루트로 이동 시 null. */
  folderId: string | null;
}

/** 문서를 다른 폴더로 이동. */
export function useMoveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, folderId }: MoveDocumentVars) =>
      documentsApi.move(documentId, { folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
