/**
 * AI 도메인 타입. 서버 AI 응답 DTO 와 대응.
 */

/** POST /ai/ask 요청 바디. topK 미지정 시 서버 기본값(5). */
export interface AskBody {
  /** 질문 (최대 2,000자). */
  question: string;
  /** 참고할 문서 개수 (1~20, 기본 5). */
  topK?: number;
}

/**
 * 근거가 나온 곳.
 * 'text' 는 문서 본문, 'image' 는 첨부 이미지를 분석한 결과,
 * 'mixed' 는 같은 문서에서 본문+이미지가 모두 검색된 경우.
 */
export type ReferenceSource = 'text' | 'image' | 'mixed';

/** 검색에 걸린 이미지 한 건의 참조 정보. */
export interface ImageRef {
  imageId: string;
  imageName?: string | null;
}

/** RAG 답변 근거 문서. POST /search 응답과 동일 구조(top-K 요약 정보). */
export interface AskReference {
  documentId: string;
  title: string;
  folderId: string | null;
  /** 질문과 관련된 발췌 문장. source 가 'image' 면 이미지에서 읽어낸 내용이다. */
  excerpt: string;
  /** 유사도 점수(0~1). */
  score: number;
  /** 이미지 검색 도입 전에 색인된 결과에는 없을 수 있어 선택 필드로 둔다(없으면 본문). */
  source?: ReferenceSource;
  /** 하위 호환용. 첫 번째 이미지의 ID. */
  imageId?: string | null;
  /** 이미지 원본 파일명. */
  imageName?: string | null;
  /** 이 문서에서 검색된 이미지 목록. 본문만 검색됐으면 빈 배열 또는 undefined. */
  images?: ImageRef[];
}

/** POST /ai/ask 응답 result. */
export interface AskResult {
  answer: string;
  references: AskReference[];
}

/**
 * AI 대화방 타입. 서버 /api/ai/conversations DTO 와 대응.
 * (docs/api/AI_CHAT_FRONTEND_GUIDE.md 참고)
 */

export interface AIConversation {
  workspaceId: string;
  conversationId: string;
  title: string;
  createTime: string;
  updateTime: string;
}

export interface AIConversationPage {
  items: AIConversation[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export type AIMessageRole = 'USER' | 'ASSISTANT';

/** PENDING: AI 답변 생성 중, FAILED: 생성 실패 (재시도 안내 대상). */
export type AIMessageStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AIMessage {
  messageId: string;
  conversationId: string;
  messageSequence: number;
  role: AIMessageRole;
  /** FAILED/PENDING 메시지는 null 일 수 있다. */
  content: string | null;
  status: AIMessageStatus;
  createTime: string;
  completeTime: string | null;
  /** AI 답변 근거 참고 문서. 이력 조회 시에도 반환된다. */
  references: AskReference[];
}

/** POST /api/ai/conversations/{id}/messages 응답 result. */
export interface AIChatResult {
  userMessage: AIMessage;
  assistantMessage: AIMessage;
  /**
   * 답변 근거로 검색된 참고 문서. 관련 문서가 없으면 빈 배열 (일반 대화 답변).
   * 메시지 이력에는 저장되지 않으므로, 이력 조회로 복원된 과거 메시지에는 없다.
   */
  references: AskReference[];
}

/** GET /api/ai/conversations/{id}/messages 응답 result (커서 페이지네이션). */
export interface AIMessageSlice {
  items: AIMessage[];
  nextBeforeSequence: number | null;
  hasNext: boolean;
}
