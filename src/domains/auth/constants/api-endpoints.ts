export const AUTH_API_ENDPOINTS = {
  GOOGLE_AUTH: '/api/oauth2/authorization/google',
  LOGIN: '/auth/login',
  SESSION: '/auth/session',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/token/refresh',
} as const;
