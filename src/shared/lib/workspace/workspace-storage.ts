import { STORAGE_KEYS } from '@/shared/constants/storage-keys';

/**
 * 현재 워크스페이스 선택 영속화. localStorage 기반(비-React 컨텍스트인 http 인터셉터에서도 읽어야 함).
 * 값이 없으면 서버는 개인 워크스페이스로 본다(X-Workspace-Id 헤더 생략).
 */
export const workspaceStorage = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
  },
  set(workspaceId: string): void {
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, workspaceId);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.WORKSPACE_ID);
  },
};
