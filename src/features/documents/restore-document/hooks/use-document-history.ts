import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 선택한 히스토리의 상세(본문 포함). 미리보기용이라 선택된 항목이 있을 때만 조회한다. */
export function useDocumentHistory(documentId: string | undefined, historyId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.historyDetail(documentId ?? '', historyId ?? ''),
    queryFn: () => documentsApi.getHistory(documentId as string, historyId as string),
    enabled: !!documentId && historyId !== null,
  });
}
