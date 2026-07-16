import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';

/**
 * 질문 기반 AI 답변 생성(RAG). question 을 보내 답변 + 참고 문서(references)를 받는다.
 * (POST /ai/ask — topK 는 서버 기본값 5 사용)
 */
export function useAskAi() {
  return useMutation({
    mutationFn: (question: string) => aiApi.ask({ question }),
  });
}
