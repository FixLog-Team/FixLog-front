import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/**
 * 연관 문서 목록.
 *
 * 본문 아래에 딸려 나오는 부가 정보라 문서 조회와 따로 부른다. 느리거나 실패해도
 * 문서 자체를 여는 데는 영향이 없다.
 *
 * 결과가 빈 배열인 것은 오류가 아니다 — 서버가 유사도 임계값에 못 미치는 문서를
 * 걸러내므로, 연관이 없으면 그냥 비어 있다.
 */
export function useRelatedDocuments(documentId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.related(documentId ?? ''),
    queryFn: () => documentsApi.listRelated(documentId as string, limit),
    enabled: !!documentId,
    // 문서를 열 때마다 다시 묻지 않는다. 본문이 바뀌지 않는 한 결과도 그대로다.
    staleTime: 5 * 60 * 1000,
  });
}
