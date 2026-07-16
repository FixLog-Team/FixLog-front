/**
 * 서버 공통 응답 래퍼. 백엔드 com.fixlog.common.response.Response / DataResponse 와 대응.
 * (안드로이드 kr.co.fixlog.data.remote.dto.ApiResponse 와 동일 역할)
 *
 * - code   : "SUCCESS" 면 성공. 그 외("UNAUTHORIZED" 등)는 실패.
 * - message: 실패 사유(성공 시 빈 문자열일 수 있음).
 * - result : 성공 페이로드. 데이터 없는 Response 면 없음(undefined).
 */
export interface ApiResponse<T> {
  code: string;
  message?: string;
  result?: T;
}

/** 페이지네이션 응답(서버 *PageDto 공통 형태). */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
