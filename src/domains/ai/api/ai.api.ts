import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import type {
  AIChatResult,
  AIConversation,
  AIConversationPage,
  AIMessageSlice,
  AskBody,
  AskResult,
} from '@/domains/ai/types/ai';

/** null 헤더는 생략되며, 재시도에서도 개인 워크스페이스 스코프를 유지한다. */
export function chatConfig(workspaceId = workspaceStorage.get(), signal?: AbortSignal) {
  return { headers: { 'X-Workspace-Id': workspaceId }, signal };
}

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
   * 태그 자동 생성(제안). content(원문 텍스트, 최대 50,000자)를 body 로 보내고
   * 추천 태그 문자열 배열을 받는다. 서버는 제안을 저장하지 않으므로(수락 전 상태 없음),
   * 사용자가 고른 것만 태그 API 로 문서에 붙인다. (FRONTEND_API_GUIDE 6장·12장)
   */
  async generateTags(content: string): Promise<string[]> {
    const res = await http.post<ApiResponse<string[]>>('/ai/tags', {
      content: content.slice(0, 50000),
    });
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
  async createConversation(title?: string, config = chatConfig()): Promise<AIConversation> {
    const res = await http.post<ApiResponse<AIConversation>>(
      '/api/ai/conversations',
      { title: title ?? null }, config
    );
    return unwrap(res);
  },

  /** 로그인 사용자의 대화방 목록 조회 (updateTime 최신순, 페이지네이션). */
  async getConversations(page = 0, size = 20, config = chatConfig()): Promise<AIConversationPage> {
    const res = await http.get<ApiResponse<AIConversationPage>>(
      '/api/ai/conversations',
      { ...config, params: { page, size } }
    );
    return unwrap(res);
  },

  /** 대화방 상세 조회. 미소유/삭제된 대화방은 404. */
  async getConversation(conversationId: string, config = chatConfig()): Promise<AIConversation> {
    const res = await http.get<ApiResponse<AIConversation>>(
      `/api/ai/conversations/${conversationId}`, config
    );
    return unwrap(res);
  },

  /** 대화방 소프트 삭제. */
  async deleteConversation(conversationId: string, config = chatConfig()): Promise<void> {
    await http.delete(`/api/ai/conversations/${conversationId}`, config);
  },

  /**
   * 사용자 메시지 저장 + AI 답변 생성 (동기, Gemini 응답까지 대기).
   * 사용자의 과거 문서를 벡터 검색해 근거(references)와 함께 답변한다.
   * 관련 문서가 없으면 일반 대화로 답하고 references 는 빈 배열이다.
   */
  async sendChatMessage(conversationId: string, content: string, config = chatConfig()): Promise<AIChatResult> {
    const res = await http.post<ApiResponse<AIChatResult>>(
      `/api/ai/conversations/${conversationId}/messages`,
      { content }, config
    );
    return unwrap(res);
  },

  /** 대화방 메시지 기록 조회 (messageSequence 커서, 오래된 순 반환). */
  async getChatMessages(
    conversationId: string,
    beforeSequence?: number,
    size = 20,
    config = chatConfig()
  ): Promise<AIMessageSlice> {
    const res = await http.get<ApiResponse<AIMessageSlice>>(
      `/api/ai/conversations/${conversationId}/messages`,
      { ...config, params: { beforeSequence, size } }
    );
    return unwrap(res);
  },
};
