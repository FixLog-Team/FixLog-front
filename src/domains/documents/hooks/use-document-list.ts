import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type { ListDocumentsParams } from '@/domains/documents/types/document';

/** 문서 목록(페이지네이션) 조회. */
export function useDocumentList(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.list(params.folderId ?? undefined),
    queryFn: () => documentsApi.list(params),
  });
}
