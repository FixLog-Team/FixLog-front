import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';

/**
 * AI 기능 API. 안드로이드 AiApi 와 1:1 대응.
 *   POST /ai/summarize → summarize
 *
 * content 에는 **요약할 원문 텍스트**를 담는다(documentId 아님). 서버는 이 텍스트를 그대로 요약한다.
 * 따라서 클라이언트가 에디터 본문을 평문으로 추출해 전달한다(서버 plainText 추출에 의존하지 않음).
 */
export const aiApi = {
  /** 원문 텍스트 요약. content = 요약할 텍스트. 요약 문자열을 반환. */
  async summarize(content: string): Promise<string> {
    const res = await http.post<ApiResponse<string>>('/ai/summarize', {
      content,
    });
    return unwrap(res);
  },
};
