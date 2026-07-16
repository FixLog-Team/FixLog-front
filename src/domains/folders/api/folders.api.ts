import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  FolderItem,
  FolderContents,
  FolderTreeNode,
  CreateFolderBody,
  UpdateFolderBody,
  MoveFolderBody,
} from '@/domains/folders/types/folder';

/**
 * 서버 폴더(folder) API. 안드로이드 FolderApi 와 1:1 대응.
 *
 *   POST   /api/folders                     → createFolder
 *   GET    /api/folders                     → getRootContents
 *   GET    /api/folders/tree                → getFolderTree
 *   GET    /api/folders/{id}                → getFolder
 *   GET    /api/folders/{id}/contents       → getFolderContents
 *   PUT    /api/folders/{id}                → updateFolder (이름 변경)
 *   PATCH  /api/folders/{id}/move           → moveFolder
 *   DELETE /api/folders/{id}                → deleteFolder
 *
 * NOTE: 서버는 인증된 사용자 기준으로 소유 폴더를 판단한다. workspaceId 파라미터는 없다.
 */
const PATH = '/api/folders';

export const foldersApi = {
  /** 폴더 생성. 루트 직속이면 parentId=null. */
  async createFolder(body: CreateFolderBody): Promise<FolderItem> {
    const res = await http.post<ApiResponse<FolderItem>>(PATH, body);
    return unwrap(res);
  },

  /** 루트(My Documents) 직속 하위 폴더 + 문서 조회. */
  async getRootContents(): Promise<FolderContents> {
    const res = await http.get<ApiResponse<FolderContents>>(PATH);
    return unwrap(res);
  },

  /** 특정 폴더의 하위 폴더 + 문서 조회. */
  async getFolderContents(folderId: string): Promise<FolderContents> {
    const res = await http.get<ApiResponse<FolderContents>>(`${PATH}/${folderId}/contents`);
    return unwrap(res);
  },

  /** 폴더 단건 조회. */
  async getFolder(folderId: string): Promise<FolderItem> {
    const res = await http.get<ApiResponse<FolderItem>>(`${PATH}/${folderId}`);
    return unwrap(res);
  },

  /** 전체 폴더 트리(사이드바/이동 대상 선택용). */
  async getFolderTree(): Promise<FolderTreeNode[]> {
    const res = await http.get<ApiResponse<FolderTreeNode[]>>(`${PATH}/tree`);
    return unwrap(res);
  },

  /** 폴더 이름 변경(PUT). 서버 계약상 parentId 도 함께 보낸다. */
  async updateFolder(folderId: string, body: UpdateFolderBody): Promise<FolderItem> {
    const res = await http.put<ApiResponse<FolderItem>>(`${PATH}/${folderId}`, body);
    return unwrap(res);
  },

  /** 폴더 이동(PATCH). 루트로 이동 시 parentId=null. */
  async moveFolder(folderId: string, body: MoveFolderBody): Promise<FolderItem> {
    const res = await http.patch<ApiResponse<FolderItem>>(`${PATH}/${folderId}/move`, body);
    return unwrap(res);
  },

  /** 폴더 삭제(하위 폴더/문서 함께 삭제). */
  async deleteFolder(folderId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(`${PATH}/${folderId}`);
    ensureSuccess(res);
  },
};
