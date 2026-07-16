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
 * GET /login → 302 → /oauth2/authorization/google → 구글 로그인. (FRONTEND_API_GUIDE 의 진입점과 동일)
 * 로그인 성공 시 서버가 success-redirect-url(=http://localhost:5173/login/callback?accessToken=..&refreshToken=..)로 돌려보낸다.
 */
export const GOOGLE_OAUTH_URL = `${ENV.BACKEND_URL}${CONTEXT_PATH}/login`;
