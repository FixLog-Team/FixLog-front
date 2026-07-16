import { http, unwrap } from '@/shared/lib/http/client';
import { tokenStorage } from '@/shared/lib/auth/token-storage';
import type { ApiResponse } from '@/shared/types';
import type { SessionUser, RefreshResult } from '@/domains/auth/types';
import {
  AUTH_API_ENDPOINTS,
  GOOGLE_OAUTH_URL,
} from '@/domains/auth/constants/api-endpoints';

export const authApi = {
  /**
   * 구글 OAuth 진입 URL. window.location.href 로 이동해 302 리다이렉트 체인을 브라우저가 처리한다.
   * (안드로이드가 Custom Tab 으로 /login/app 을 여는 것과 동일한 역할 — 웹은 /oauth2/authorization/google)
   */
  getGoogleAuthUrl(): string {
    return GOOGLE_OAUTH_URL;
  },

  /** 현재 세션(사용자) 조회. 미인증이면 401 → 인터셉터가 처리. */
  async getSession(): Promise<SessionUser> {
    const res = await http.get<ApiResponse<SessionUser>>(AUTH_API_ENDPOINTS.SESSION);
    return unwrap(res);
  },

  /** Access Token 재발급(수동 호출용 — 자동 재발급은 http 인터셉터가 담당). */
  async refresh(): Promise<RefreshResult> {
    const refreshToken = tokenStorage.getRefreshToken();
    const res = await http.post<ApiResponse<RefreshResult>>(
      AUTH_API_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken }
    );
    const result = unwrap(res);
    tokenStorage.save(result.accessToken);
    return result;
  },

  /**
   * 로그아웃. 서버 로그아웃 엔드포인트가 없으므로 클라이언트 토큰만 삭제한다
   * (발급된 토큰은 만료 전까지 서버에서 유효 — 안드로이드 SettingsActivity 와 동일).
   */
  logout(): void {
    tokenStorage.clear();
  },
};
