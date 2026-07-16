/** 서버 context-path. 백엔드 모든 엔드포인트가 이 하위에 있다(/fixlog/api/..., /fixlog/auth/...). */
export const CONTEXT_PATH = '/fixlog';

export const ENV = {
  /**
   * axios baseURL. dev 에서는 '/fixlog'(Vite 프록시 경유), 운영에서는 전체 URL.
   * 안드로이드 ApiClient.BASE_URL(http://.../fixlog)과 동일 역할.
   */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? CONTEXT_PATH,

  /**
   * 백엔드 origin. OAuth 진입은 XHR 이 아닌 브라우저 top-level 이동이라
   * 프록시가 아닌 백엔드 절대 URL 로 나가야 한다(구글이 backend origin 으로 콜백).
   */
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080',

  MODE: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
