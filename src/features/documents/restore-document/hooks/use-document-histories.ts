import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 문서 히스토리 목록(최신순). 패널이 열렸을 때만 조회한다. */
export function useDocumentHistories(documentId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.history(documentId ?? ''),
    queryFn: () => documentsApi.listHistory(documentId as string),
    enabled: !!documentId && enabled,
  });
}
