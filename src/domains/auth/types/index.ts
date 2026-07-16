/**
 * 현재 로그인 사용자. 서버 GET /auth/token 의 result 와 1:1 대응.
 * (AuthController.session → { userId, userName, email })
 */
export interface SessionUser {
  userId: string;
  userName: string;
  email: string;
}

/** POST /auth/token/refresh 의 result. 서버는 accessToken 만 내려준다(refresh 미포함). */
export interface RefreshResult {
  accessToken: string;
}
