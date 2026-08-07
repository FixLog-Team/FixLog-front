/**
 * AI 도메인 타입. 서버 AI 응답 DTO 와 대응.
 */

/** POST /ai/ask 요청 바디. topK 미지정 시 서버 기본값(5). */
export interface AskBody {
  /** 질문 (최대 2,000자). */
  question: string;
  /** 참고할 문서 개수 (1~20, 기본 5). */
  topK?: number;
  /** 후속 질문 시 전달하는 대화 ID. 미전달 시 서버가 새 대화를 시작한다. */
  conversationId?: string;
}

/** RAG 답변 근거 문서. POST /search 응답과 동일 구조(top-K 요약 정보). */
export interface AskReference {
  documentId: string;
  title: string;
  folderId: string | null;
  /** 질문과 관련된 발췌 문장. */
  excerpt: string;
  /** 유사도 점수(0~1). */
  score: number;
}

/** POST /ai/ask 응답 result. */
export interface AskResult {
  answer: string;
  references: AskReference[];
  /** 서버가 발급/유지하는 대화 ID. 후속 질문에 그대로 전달하면 문맥이 유지된다. */
  conversationId: string;
}

/** GET /ai/conversations/{conversationId}/messages 응답 항목. */
export interface ChatMessage {
  messageId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  /** ISO-8601 (서버 Instant). */
  createTime: string;
}
