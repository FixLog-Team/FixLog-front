import { ENV, CONTEXT_PATH } from '@/app/config/env';

/**
 * 인증 관련 엔드포인트. 안드로이드 AuthApi/GoogleLoginActivity 의 서버 계약과 일치.
 *
 * 주의:
 *  - SESSION 은 CLAUDE.md 의 /auth/session 이 아니라 실제 서버 경로 /auth/token 이다.
 *  - 서버에 /auth/logout 은 없다(로그아웃 = 클라이언트 토큰 삭제).
 */
export const AUTH_API_ENDPOINTS = {
  /** 현재 세션(사용자) 조회. GET → { userId, userName, email } */
  SESSION: '/auth/token',
  /** Access Token 재발급. POST { refreshToken } → { accessToken } */
  REFRESH_TOKEN: '/auth/token/refresh',
} as const;

/**
 * 구글 OAuth 진입 URL(웹). 브라우저 top-level 이동 전용이라 프록시가 아닌 백엔드 절대 URL 이어야 한다.
 * GET /login → 302 → /oauth2/authorization/google → 구글 로그인.
 * redirect_uri 로 현재 origin 의 /login/callback 을 전달하여
 * 로컬/배포 환경 모두 올바른 곳으로 콜백되도록 한다.
 */
const CALLBACK_URL = encodeURIComponent(`${window.location.origin}/login/callback`);
export const GOOGLE_OAUTH_URL = `${ENV.BACKEND_URL}${CONTEXT_PATH}/login?redirect_uri=${CALLBACK_URL}`;
