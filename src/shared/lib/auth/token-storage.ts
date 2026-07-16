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
