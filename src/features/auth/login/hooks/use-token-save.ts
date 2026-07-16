import { tokenStorage } from '@/shared/lib/auth/token-storage';

/**
 * 로그인 콜백에서 받은 토큰을 저장하는 훅.
 * (실제 저장 로직은 tokenStorage 에 위임 — 인터셉터 등과 단일 소스 공유)
 */
export function useSaveTokens() {
  return (accessToken: string, refreshToken?: string) => {
    tokenStorage.save(accessToken, refreshToken);
  };
}
