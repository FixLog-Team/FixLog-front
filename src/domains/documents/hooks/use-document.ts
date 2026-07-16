import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 문서 상세 조회(본문 blocks 포함). */
export function useDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.detail(documentId ?? ''),
    queryFn: () => documentsApi.getDocument(documentId as string),
    enabled: !!documentId,
  });
}
