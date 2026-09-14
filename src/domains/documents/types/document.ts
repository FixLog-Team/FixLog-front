/**
 * 문서 도메인 타입. 서버 DTO(안드로이드 kr.co.fixlog.data.remote.dto)와 1:1 대응.
 * NOTE: 서버에는 workspace 개념이 없다(사용자 소유권 기반).
 */

/** GET /api/documents/{id}, 각종 문서 응답. 서버 DocumentDto 대응. */
export interface DocumentDto {
  documentId: string;
  folderId: string | null;
  /** 본문(BlockNote 블록 트리)의 JSON "문자열". 목록 조회 시 null 일 수 있음. */
  blocks: string | null;
  title: string;
  /** 본문에서 추출한 평문(검색/미리보기용). */
  plainText: string | null;
  contentHash: string | null;
  ordinal: number | null;
  createUser: string | null;
  createTime: string | null; // ISO-8601
  updateUser: string | null;
  updateTime: string | null; // ISO-8601
}

/** 문서/폴더에 대한 현재 사용자의 유효 권한. */
export interface ResourcePermissionDto {
  access: boolean;
  canDownload: boolean;
  canEdit: boolean;
  source: 'DIRECT' | 'INHERITED' | 'WORKSPACE_DEFAULT';
  sourceDetail: string | null;
}

/** POST /api/documents/{id}/duplicate 응답. */
export interface DocumentDuplicateDto {
  newDocumentId: string;
  folderId: string | null;
  title: string;
}

/** POST /api/documents 요청 바디. 루트 직속이면 folderId=null. */
export interface CreateDocumentBody {
  folderId: string | null;
  title: string;
}

/**
 * PUT /api/documents/{id} 요청 바디.
 * blocks 는 BlockNote 가 내보낸 블록 트리(배열/객체)를 그대로 담는다.
 * 서버는 JsonNode 로 받으므로 "문자열"이 아닌 실제 JSON 값이어야 한다.
 */
export interface SaveDocumentBody {
  title: string;
  blocks: unknown;
}

/** PATCH /api/documents/{id}/move 요청 바디. 루트로 이동 시 folderId=null. */
export interface MoveDocumentBody {
  folderId: string | null;
}

/** PATCH /api/documents/{id}/title 요청 바디. */
export interface RenameDocumentBody {
  title: string;
}

/** GET /api/documents 목록 조회 파라미터. */
export interface ListDocumentsParams {
  folderId?: string | null;
  page?: number;
  size?: number;
}

/** 히스토리 항목의 생성 계기(서버 DocumentHistorySource). */
export type DocumentHistorySource = 'MANUAL' | 'RESTORE';

/**
 * GET /api/documents/{id}/history 목록 항목(페이지의 items). 서버 DocumentHistoryDto 와 1:1.
 * 저장 시점마다 쌓이는 불변 스냅샷이며 직전과 내용이 같으면 생략된다. 본문(blocks)은 상세에서만 내려온다.
 */
export interface DocumentHistoryDto {
  historyId: string;
  title: string;
  /** MANUAL: 저장으로 이전 내용이 밀려남 / RESTORE: 복원으로 직전 내용이 밀려남. */
  source: DocumentHistorySource;
  createUser: string | null;
  createTime: string; // ISO-8601
}

/** GET /api/documents/{id}/history/{historyId} 응답. blocks 는 BlockNote 형식으로 변환되어 있다. */
export interface DocumentHistoryDetailDto {
  historyId: string;
  documentId: string;
  title: string;
  /** 해당 시점 본문(BlockNote 블록 트리)의 JSON 문자열. */
  blocks: string | null;
  contentHash: string | null;
  source: DocumentHistorySource;
  createUser: string | null;
  createTime: string; // ISO-8601
}
