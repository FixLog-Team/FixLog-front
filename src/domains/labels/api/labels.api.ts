import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { LabelDto, AddLabelBody } from '@/domains/labels/types/label';

/**
 * 태그 API. FRONTEND_API_GUIDE "12. 태그 API" 계약.
 *
 *   GET    /api/labels                                → list (워크스페이스 태그 목록)
 *   GET    /api/documents/{documentId}/labels         → getForDocument (문서에 붙은 태그)
 *   POST   /api/documents/{documentId}/labels         → addToDocument ({ labelName }, 없으면 생성)
 *   DELETE /api/documents/{documentId}/labels/{labelId} → removeFromDocument
 *
 * NOTE: 태그는 문서 DTO 에 embed 되지 않고 위 엔드포인트로 별도 조회한다.
 */
const PATH = '/api';

export const labelsApi = {
  /** 워크스페이스 태그 목록. */
  async list(): Promise<LabelDto[]> {
    const res = await http.get<ApiResponse<LabelDto[]>>(`${PATH}/labels`);
    return unwrap(res);
  },

  /** 특정 문서에 붙은 태그. */
  async getForDocument(documentId: string): Promise<LabelDto[]> {
    const res = await http.get<ApiResponse<LabelDto[]>>(
      `${PATH}/documents/${documentId}/labels`
    );
    return unwrap(res);
  },

  /** 문서에 태그 추가(없는 이름이면 서버가 생성). 편집 권한 필요. */
  async addToDocument(documentId: string, body: AddLabelBody): Promise<void> {
    const res = await http.post<ApiResponse<unknown>>(
      `${PATH}/documents/${documentId}/labels`,
      body
    );
    ensureSuccess(res);
  },

  /** 문서에서 태그 제거. 편집 권한 필요. */
  async removeFromDocument(documentId: string, labelId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${PATH}/documents/${documentId}/labels/${labelId}`
    );
    ensureSuccess(res);
  },
};
