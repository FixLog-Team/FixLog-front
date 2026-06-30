import { http } from '@/shared/lib/http/client';
import type { FolderContentsResponse } from '@/domains/folders/types/folder';

/**
 * 루트 폴더 목록 조회
 * GET /api/folders?workspaceId={workspaceId}
 */
export async function fetchRootFolders(workspaceId: string) {
  const response = await http.get<FolderContentsResponse>('/folders', {
    params: { workspaceId },
  });
  return response.data.result;
}

/**
 * 특정 폴더의 하위 콘텐츠 조회
 * GET /api/folders/{folderId}/contents?workspaceId={workspaceId}
 */
export async function fetchFolderContents(folderId: string, workspaceId: string) {
  const response = await http.get<FolderContentsResponse>(
    `/folders/${folderId}/contents`,
    { params: { workspaceId } },
  );
  return response.data.result;
}
