import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  AIChatResult,
  AIConversation,
  AIConversationPage,
  AIMessageSlice,
  AskBody,
  AskResult,
} from '@/domains/ai/types/ai';

/**
 * AI 기능 API.
 *   POST   /ai/documents/{documentId}/summarize          → summarizeDocument
 *   POST   /ai/ask                                       → ask (단발 질의응답)
 *   POST   /api/ai/conversations                         → createConversation
 *   GET    /api/ai/conversations                         → getConversations
 *   GET    /api/ai/conversations/{conversationId}        → getConversation
 *   DELETE /api/ai/conversations/{conversationId}        → deleteConversation
 *   POST   /api/ai/conversations/{id}/messages           → sendChatMessage
 *   GET    /api/ai/conversations/{id}/messages           → getChatMessages
 * (대화방 API 상세: 서버 docs/api/AI_CHAT_FRONTEND_GUIDE.md)
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
   */
  async ask(body: AskBody): Promise<AskResult> {
    const res = await http.post<ApiResponse<AskResult>>('/ai/ask', {
      question: body.question,
      topK: body.topK ?? 5,
    });
    return unwrap(res);
  },

  /** AI 대화방 생성. 제목이 없으면 서버가 기본 제목을 부여한다. */
  async createConversation(title?: string): Promise<AIConversation> {
    const res = await http.post<ApiResponse<AIConversation>>(
      '/api/ai/conversations',
      { title: title ?? null }
    );
    return unwrap(res);
  },

  /** 로그인 사용자의 대화방 목록 조회 (updateTime 최신순, 페이지네이션). */
  async getConversations(page = 0, size = 20): Promise<AIConversationPage> {
    const res = await http.get<ApiResponse<AIConversationPage>>(
      '/api/ai/conversations',
      { params: { page, size } }
    );
    return unwrap(res);
  },

  /** 대화방 상세 조회. 미소유/삭제된 대화방은 404. */
  async getConversation(conversationId: string): Promise<AIConversation> {
    const res = await http.get<ApiResponse<AIConversation>>(
      `/api/ai/conversations/${conversationId}`
    );
    return unwrap(res);
  },

  /** 대화방 소프트 삭제. */
  async deleteConversation(conversationId: string): Promise<void> {
    await http.delete(`/api/ai/conversations/${conversationId}`);
  },

  /**
   * 사용자 메시지 저장 + AI 답변 생성 (동기, Gemini 응답까지 대기).
   * 사용자의 과거 문서를 벡터 검색해 근거(references)와 함께 답변한다.
   * 관련 문서가 없으면 일반 대화로 답하고 references 는 빈 배열이다.
   */
  async sendChatMessage(conversationId: string, content: string): Promise<AIChatResult> {
    const res = await http.post<ApiResponse<AIChatResult>>(
      `/api/ai/conversations/${conversationId}/messages`,
      { content }
    );
    return unwrap(res);
  },

  /** 대화방 메시지 기록 조회 (messageSequence 커서, 오래된 순 반환). */
  async getChatMessages(
    conversationId: string,
    beforeSequence?: number,
    size = 20
  ): Promise<AIMessageSlice> {
    const res = await http.get<ApiResponse<AIMessageSlice>>(
      `/api/ai/conversations/${conversationId}/messages`,
      { params: { beforeSequence, size } }
    );
    return unwrap(res);
  },
};
