import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  BulkOperationResult,
  BulkTargets,
  BulkMoveBody,
} from '@/domains/bulk/types/bulk';

/**
 * 일괄 작업 API(문서+폴더 혼합). 서버 BulkController 와 1:1.
 *
 *   DELETE /api/bulk           body { documentIds, folderIds }                 → bulkDelete
 *   PATCH  /api/bulk/move      body { documentIds, folderIds, targetFolderId } → bulkMove
 *   GET    /api/bulk/download  ?documentIds=&folderIds=  (ZIP)                  → bulkDownload
 *
 * 인증·X-Workspace-Id 헤더는 http 인터셉터가 자동 부착한다.
 */
const PATH = '/api/bulk';

export const bulkApi = {
  /** 선택 항목 일괄 삭제(휴지통으로). 부분 성공 결과를 반환. */
  async remove(body: BulkTargets): Promise<BulkOperationResult> {
    const res = await http.delete<ApiResponse<BulkOperationResult>>(PATH, { data: body });
    return unwrap(res);
  },

  /** 선택 항목 일괄 이동. targetFolderId=null 이면 루트. */
  async move(body: BulkMoveBody): Promise<BulkOperationResult> {
    const res = await http.patch<ApiResponse<BulkOperationResult>>(`${PATH}/move`, body);
    return unwrap(res);
  },

  /**
   * 선택 항목 일괄 다운로드(ZIP). 폴더는 하위 포함해 압축된다.
   * 서버 @RequestParam List 는 반복 키(documentIds=a&documentIds=b)를 기대하므로
   * paramsSerializer 로 대괄호 없이 반복 직렬화한다.
   */
  async download(targets: BulkTargets): Promise<Blob> {
    const res = await http.get<Blob>(`${PATH}/download`, {
      params: { documentIds: targets.documentIds, folderIds: targets.folderIds },
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    });
    return res.data;
  },
};
