import axios from 'axios';
import { ENV } from '@/app/config/env';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';

export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TODO: 401 에러 처리 및 refresh token 로직은 feature/auth 레이어에서 구현 예정
// interceptor는 HTTP 요청/응답 처리만 담당하고,
// 인증 처리(localStorage, redirect)는 상위 레이어에서 처리
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 에러를 그대로 전파하여 상위에서 처리하도록 함
    return Promise.reject(error);
  }
);
