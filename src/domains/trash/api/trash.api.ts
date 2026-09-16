import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { TrashItem, TrashResourceType } from '@/domains/trash/types/trash';

/**
 * 휴지통 API (FRONTEND_API_GUIDE 11장).
 *   GET    /api/trash                              → list
 *   POST   /api/trash/{resourceType}/{id}/restore  → restore (부모가 휴지통이면 루트로 복원)
 *   DELETE /api/trash/{resourceType}/{id}          → purge (영구 삭제, 되돌릴 수 없음)
 */
const PATH = '/api/trash';

export const trashApi = {
  async list(): Promise<TrashItem[]> {
    const res = await http.get<ApiResponse<TrashItem[]>>(PATH);
    return unwrap(res);
  },

  async restore(resourceType: TrashResourceType, resourceId: string): Promise<void> {
    const res = await http.post<ApiResponse<unknown>>(
      `${PATH}/${resourceType}/${resourceId}/restore`
    );
    ensureSuccess(res);
  },

  async purge(resourceType: TrashResourceType, resourceId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${PATH}/${resourceType}/${resourceId}`
    );
    ensureSuccess(res);
  },
};
