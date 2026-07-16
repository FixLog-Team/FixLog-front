import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { AskBody, AskResult } from '@/domains/ai/types/ai';

/**
 * AI 기능 API.
 *   POST /ai/documents/{documentId}/summarize → summarizeDocument
 *   POST /ai/ask                              → ask
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
};
