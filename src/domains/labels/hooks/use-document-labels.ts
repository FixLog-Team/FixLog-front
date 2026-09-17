import { useQuery } from '@tanstack/react-query';
import { labelsApi } from '@/domains/labels/api/labels.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/**
 * 문서에 붙은 라벨 조회(문서 목록의 라벨 표시용).
 * 라벨 API 미지원 서버에서는 재시도 없이 에러를 흘려 빈 목록으로 처리한다(그래도 화면은 정상).
 */
export function useDocumentLabels(documentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.labels.document(documentId),
    queryFn: () => labelsApi.getForDocument(documentId),
    enabled: !!documentId,
    retry: false,
    staleTime: 60_000,
  });
}
