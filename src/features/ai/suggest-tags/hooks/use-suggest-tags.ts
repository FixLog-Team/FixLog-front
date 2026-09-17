import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai/api/ai.api';

/**
 * 문서 내용 기반 태그 제안. content(평문)를 보내 추천 태그 배열을 받는다.
 * 결과는 제안일 뿐이며, 사용자가 고른 것만 태그로 추가한다(POST /api/documents/{id}/labels).
 */
export function useSuggestTags() {
  return useMutation({
    mutationFn: (content: string) => aiApi.generateTags(content),
  });
}
