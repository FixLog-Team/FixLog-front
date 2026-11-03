import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';

/**
 * 현재 사용자의 이 문서에 대한 유효 권한(GET /api/documents/{id}/my-permission).
 *
 * 편집 가능 여부(canEdit)를 문서를 열 때 미리 알 수 있어, 저장 시점의 403 을 기다리지 않고
 * 임시 저장·저장 동작을 사전에 막는 데 쓴다.
 */
export function useDocumentPermission(documentId: string | undefined) {
  return useQuery({
    queryKey: ['my-permission', 'document', documentId] as const,
    queryFn: () => documentsApi.getMyPermission(documentId as string),
    enabled: !!documentId,
    staleTime: 60_000,
  });
}
