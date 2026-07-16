import { authApi } from '@/domains/auth/api';

/**
 * 구글 OAuth 로그인 시작. 백엔드 OAuth 진입 URL 로 브라우저를 이동시킨다.
 * 이후 흐름: 구글 로그인 → 서버 콜백 → /login/callback?accessToken=...&refreshToken=...
 * (토큰 저장은 LoginCallbackPage 에서 처리)
 */
export function useGoogleLogin() {
  const startGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return {
    startGoogleLogin,
    isLoading: false,
  };
}
