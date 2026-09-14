import { STORAGE_KEYS } from '@/shared/constants/storage-keys';

/**
 * 로그인 토큰(Access / Refresh) 영속화 유틸. localStorage 기반.
 * 안드로이드 kr.co.fixlog.util.TokenManager 와 동일 역할.
 *
 * NOTE: interceptor 등 비-React 컨텍스트에서도 써야 하므로 훅이 아닌 순수 함수로 둔다.
 *       (React 컴포넌트에서 토큰을 저장할 때는 features/auth 의 use-token-save 훅을 사용)
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /** refreshToken 은 함께 내려온 경우에만 갱신(없으면 기존 값 유지 — 서버 refresh 응답엔 access 만 옴). */
  save(accessToken: string, refreshToken?: string | null): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

/**
 * JWT 의 subject(=userId)를 동기적으로 디코드한다. 서명 검증은 하지 않으며(서버가 검증),
 * 계정 전환/로그인 직후 사용자별 마지막 워크스페이스를 복원하는 용도로만 쓴다.
 */
export function decodeUserId(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
    const sub = (JSON.parse(json) as { sub?: string }).sub;
    return sub ?? null;
  } catch {
    return null;
  }
}
