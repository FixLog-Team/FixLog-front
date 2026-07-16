import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai/api/ai.api';

/**
 * 문서 요약 요청. documentId 로 서버가 DB 원문(plainText)을 조회해 요약한다.
 * (POST /ai/documents/{documentId}/summarize — 최신 본문 저장을 선행할 것)
 */
export function useSummarizeDocument() {
  return useMutation({
    mutationFn: (documentId: string) => aiApi.summarizeDocument(documentId),
  });
}
