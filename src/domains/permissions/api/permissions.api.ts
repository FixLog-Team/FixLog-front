import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  PermissionDto,
  ShareBody,
  ResourceKind,
  MyPermissionDto,
  SharedWithMeDto,
} from '@/domains/permissions/types/permission';

/**
 * 공유(권한) API (FRONTEND_API_GUIDE 9장). 문서·폴더가 같은 규칙.
 *   GET    /api/{documents|folders}/{id}/my-permission          → 내 유효 권한(출처 포함)
 *   GET    /api/{documents|folders}/{id}/permissions            → list (공유 설정 가능자만)
 *   POST   /api/{documents|folders}/{id}/permissions            → share (소유자·Admin, upsert)
 *   DELETE /api/{documents|folders}/{id}/permissions/{permId}   → revoke
 *   GET    /api/documents/shared-with-me                        → 내가 권한 받은 문서
 */
const resourcePath = (kind: ResourceKind) =>
  kind === 'document' ? '/api/documents' : '/api/folders';

export const permissionsApi = {
  /** 내가 이 리소스에 대해 갖는 유효 권한 + 출처(다운로드/편집 버튼 노출 판단용). */
  async myPermission(kind: ResourceKind, id: string): Promise<MyPermissionDto> {
    const res = await http.get<ApiResponse<MyPermissionDto>>(
      `${resourcePath(kind)}/${id}/my-permission`
    );
    return unwrap(res);
  },

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

  /**
   * 내가 만들지 않았지만 권한을 받은 폴더·문서.
   * 응답 result 는 { folders, documents } 형태다(구버전 평면 배열에서 변경됨).
   */
  async sharedWithMe(): Promise<SharedWithMeDto> {
    const res = await http.get<ApiResponse<SharedWithMeDto>>(
      '/api/documents/shared-with-me'
    );
    const result = unwrap(res);
    return { folders: result?.folders ?? [], documents: result?.documents ?? [] };
  },
};
