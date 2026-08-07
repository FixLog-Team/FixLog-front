import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { AskBody, AskResult, ChatMessage } from '@/domains/ai/types/ai';

/**
 * AI 기능 API.
 *   POST /ai/documents/{documentId}/summarize        → summarizeDocument
 *   POST /ai/ask                                     → ask
 *   GET  /ai/conversations/{conversationId}/messages → getConversationMessages
 */
export const aiApi = {
  /**
   * 문서 ID 기반 요약. 서버가 DB 에서 문서 원문(plainText)을 조회해 요약한다.
   * 본인 소유 + 삭제되지 않은(usable=1) 문서만 대상이며 요청 body 는 없다.
   * (요약 전 최신 본문 저장을 선행해야 서버가 최신 plainText 를 요약한다)
   */
  async summarizeDocument(documentId: string): Promise<string> {
    const res = await http.post<ApiResponse<string>>(
      `/ai/documents/${documentId}/summarize`
    );
    return unwrap(res);
  },

  /**
   * 질문 기반 AI 답변 생성(RAG). 본인 소유 문서 중 질문과 유사한 문서를 검색해
   * 그 내용을 근거로 답변을 생성하고 참고 문서(references)를 함께 반환한다.
   * conversationId 를 함께 보내면 이전 대화 문맥을 유지한 답변을 받는다.
   */
  async ask(body: AskBody): Promise<AskResult> {
    const res = await http.post<ApiResponse<AskResult>>('/ai/ask', {
      question: body.question,
      topK: body.topK ?? 5,
      ...(body.conversationId && { conversationId: body.conversationId }),
    });
    return unwrap(res);
  },

  /**
   * 대화 전체 이력을 시간순으로 조회한다 (새로고침 후 스레드 복원용).
   * 본인 소유가 아니거나 존재하지 않는 대화는 서버가 NOT_FOUND 를 반환한다.
   * 이력에는 질문/답변 텍스트만 저장되므로 references 는 포함되지 않는다.
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await http.get<ApiResponse<ChatMessage[]>>(
      `/ai/conversations/${conversationId}/messages`
    );
    return unwrap(res);
  },
};
