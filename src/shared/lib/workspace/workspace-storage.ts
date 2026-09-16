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

  /** 사용자별 마지막 접속 워크스페이스 조회. 계정 전환·재로그인 시 복원에 쓴다. */
  getLastForUser(userId: string): string | null {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_WORKSPACE_BY_USER);
      if (!raw) return null;
      const map = JSON.parse(raw) as Record<string, string>;
      return map[userId] ?? null;
    } catch {
      return null;
    }
  },

  /** 사용자별 마지막 접속 워크스페이스 기록. */
  setLastForUser(userId: string, workspaceId: string): void {
    if (!userId || !workspaceId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_WORKSPACE_BY_USER);
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      if (map[userId] === workspaceId) return;
      map[userId] = workspaceId;
      localStorage.setItem(STORAGE_KEYS.LAST_WORKSPACE_BY_USER, JSON.stringify(map));
    } catch {
      /* 저장 실패는 무시(복원은 부가 기능) */
    }
  },
};
