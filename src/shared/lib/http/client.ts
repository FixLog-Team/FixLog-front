import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '@/app/config/env';
import { ROUTES } from '@/shared/constants/routes';
import { tokenStorage } from '@/shared/lib/auth/token-storage';
import type { ApiResponse } from '@/shared/types';

/**
 * axios 싱글톤. 안드로이드 ApiClient(OkHttp) 와 동일 역할.
 *
 * - 요청 인터셉터: Authorization: Bearer {accessToken} 자동 부착 (AuthInterceptor 대응)
 * - 응답 인터셉터: 401 시 refreshToken 으로 재발급 후 원 요청 자동 재시도 (TokenAuthenticator 대응)
 *   재발급까지 실패하면 토큰을 지우고 로그인 화면으로 보낸다.
 */
export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 요청: 토큰 부착 ---
http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 이미 한 번 재시도한 요청인지 표시(무한 루프 방지 — TokenAuthenticator.priorResponse 대응).
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * 동시에 여러 요청이 401을 받아도 refresh 는 한 번만 수행한다(single-flight).
 * 진행 중인 refresh 가 있으면 그 Promise 를 공유한다.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * POST /auth/token/refresh 를 인터셉터 없는 별도 axios 로 호출(재귀 방지 — 안드로이드 refreshClient 대응).
 * 성공 시 새 accessToken 을 저장하고 반환, 실패 시 throw.
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post<ApiResponse<{ accessToken?: string; token?: string }>>(
    `${ENV.API_BASE_URL}/auth/token/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (data.code !== 'SUCCESS') {
    throw new Error(`refresh failed: ${data.code}`);
  }
  // accessToken 우선, 구버전 호환으로 token 도 fallback (AuthApi.refresh 파싱과 동일).
  const newAccessToken = data.result?.accessToken || data.result?.token;
  if (!newAccessToken) {
    throw new Error('refresh succeeded but no accessToken');
  }
  // 서버 refresh 응답에는 refreshToken 이 없으므로 access 만 갱신.
  tokenStorage.save(newAccessToken);
  return newAccessToken;
}

/** 재발급 불가/실패 → 토큰 삭제 후 로그인 화면으로(하드 내비게이션). */
function handleAuthFailure(): void {
  tokenStorage.clear();
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // 401 이 아니거나, 원 요청 정보가 없거나, 이미 한 번 재시도했으면 그대로 실패 전파.
    if (status !== 401 || !original || original._retry) {
      if (status === 401) handleAuthFailure();
      return Promise.reject(error);
    }

    // refresh 엔드포인트 자체가 401 이면 재발급 불가 → 로그아웃.
    if (original.url?.includes('/auth/token/refresh')) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      // 진행 중인 refresh 가 있으면 공유, 없으면 새로 시작.
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      original.headers.Authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (refreshError) {
      refreshPromise = null;
      handleAuthFailure();
      return Promise.reject(refreshError);
    }
  }
);

/**
 * ApiResponse<T> 응답에서 result 를 꺼낸다. code!=="SUCCESS" 또는 result 부재 시 throw.
 * (안드로이드 execute() 의 성공 판정/result 추출과 동일)
 */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { code, message, result } = response.data;
  if (code !== 'SUCCESS') {
    throw new Error(`API error: code=${code}, message=${message ?? ''}`);
  }
  if (result === undefined || result === null) {
    throw new Error('API success but result was null');
  }
  return result;
}

/**
 * result 가 없는 Response(삭제 등)의 성공 여부만 확인. 실패 시 throw.
 * (안드로이드 executeUnit() 대응)
 */
export function ensureSuccess(response: AxiosResponse<ApiResponse<unknown>>): void {
  const { code, message } = response.data;
  if (code && code !== 'SUCCESS') {
    throw new Error(`API error: code=${code}, message=${message ?? ''}`);
  }
}
