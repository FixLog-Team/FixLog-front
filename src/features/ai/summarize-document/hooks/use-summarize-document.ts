import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai/api/ai.api';

/**
 * 문서 요약 요청. content(에디터에서 추출한 평문)를 서버에 보내 요약한다.
 * (POST /ai/summarize 는 content 를 원문 텍스트로 직접 요약한다)
 */
export function useSummarizeDocument() {
  return useMutation({
    mutationFn: (content: string) => aiApi.summarize(content),
  });
}
