import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { DocumentDto } from '@/domains/documents/types/document';
import type {
  PermissionDto,
  ShareBody,
  ResourceKind,
} from '@/domains/permissions/types/permission';

/**
 * 공유(권한) API (FRONTEND_API_GUIDE 9장). 문서·폴더가 같은 규칙.
 *   GET    /api/{documents|folders}/{id}/permissions            → list (공유 설정 가능자만)
 *   POST   /api/{documents|folders}/{id}/permissions            → share (OWNER만, upsert)
 *   DELETE /api/{documents|folders}/{id}/permissions/{permId}   → revoke
 *   GET    /api/documents/shared-with-me                        → 내가 권한 받은 문서
 */
const resourcePath = (kind: ResourceKind) =>
  kind === 'document' ? '/api/documents' : '/api/folders';

export const permissionsApi = {
  async list(kind: ResourceKind, id: string): Promise<PermissionDto[]> {
    const res = await http.get<ApiResponse<PermissionDto[]>>(
      `${resourcePath(kind)}/${id}/permissions`
    );
    return unwrap(res);
  },

  /** 공유(권한 부여). 같은 대상 재전송 시 서버가 덮어쓴다. */
  async share(kind: ResourceKind, id: string, body: ShareBody): Promise<void> {
    const res = await http.post<ApiResponse<unknown>>(
      `${resourcePath(kind)}/${id}/permissions`,
      body
    );
    ensureSuccess(res);
  },

  /** 공유 회수. */
  async revoke(
    kind: ResourceKind,
    id: string,
    permissionId: string
  ): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${resourcePath(kind)}/${id}/permissions/${permissionId}`
    );
    ensureSuccess(res);
  },

  /** 내가 만들지 않았지만 권한을 받은 문서. */
  async sharedWithMe(): Promise<DocumentDto[]> {
    const res = await http.get<ApiResponse<DocumentDto[]>>(
      '/api/documents/shared-with-me'
    );
    return unwrap(res);
  },
};
