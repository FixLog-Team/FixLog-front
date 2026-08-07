import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';

/** 질문 + 대화 문맥. conversationId 미전달 시 새 대화가 시작된다. */
export interface AskInput {
  question: string;
  conversationId?: string;
}

/**
 * 질문 기반 AI 답변 생성(RAG). question 을 보내 답변 + 참고 문서(references)를 받는다.
 * conversationId 를 함께 보내면 이전 대화 문맥을 유지한다.
 * (POST /ai/ask — topK 는 서버 기본값 5 사용)
 */
export function useAskAi() {
  return useMutation({
    mutationFn: (input: AskInput) => aiApi.ask(input),
  });
}
