import { http } from '@/shared/lib/http/client';
import type {
  LoginRequest,
  LoginResponse,
  SessionResponse,
} from '@/domains/auth/types';
import { AUTH_API_ENDPOINTS } from '@/domains/auth/constants/api-endpoints';

export const authApi = {
  /**
   * Google OAuth 인증 URL 가져오기
   * Spring Security OAuth2는 302 리다이렉트를 반환하므로
   * axios 대신 직접 페이지 이동을 사용해야 함
   */
  getGoogleAuthUrl: (): string => {
    return AUTH_API_ENDPOINTS.GOOGLE_AUTH;
  },

  /**
   * Google OAuth 로그인 처리
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await http.post<LoginResponse>(AUTH_API_ENDPOINTS.LOGIN, request);
    return data;
  },

  /**
   * 현재 세션 정보 조회
   */
  getSession: async (): Promise<SessionResponse> => {
    const { data } = await http.get<SessionResponse>(AUTH_API_ENDPOINTS.SESSION);
    return data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    await http.post(AUTH_API_ENDPOINTS.LOGOUT);
  },

  /**
   * Access Token 재발급
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const { data } = await http.post<{ accessToken: string }>(
      AUTH_API_ENDPOINTS.REFRESH_TOKEN
    );
    return data;
  },
};
