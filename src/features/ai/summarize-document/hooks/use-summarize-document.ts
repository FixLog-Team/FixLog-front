import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai/api/ai.api';

/**
 * 문서 요약 요청. 화면의 현재 본문(plainText)을 직접 보내 요약한다.
 * (POST /ai/summarize — 서버 DB plainText 대신 클라이언트 추출 본문을 요약해 문서와 일치시킴)
 */
export function useSummarizeDocument() {
  return useMutation({
    mutationFn: (content: string) => aiApi.summarize(content),
  });
}
