import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import type { LoginResponse } from '@/domains/auth/types';

interface UseGoogleLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export function useGoogleLogin(_options?: UseGoogleLoginOptions) {
  const startGoogleLogin = () => {
    // Spring Security OAuth2 엔드포인트로 직접 이동
    // 302 리다이렉트를 브라우저가 자동으로 처리
    const authUrl = authApi.getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  return {
    startGoogleLogin,
    isLoading: false,
  };
}

/**
 * Google OAuth 콜백 처리 (리다이렉트 후 돌아왔을 때)
 */
export function useGoogleLoginCallback(options?: UseGoogleLoginOptions) {
  const mutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await authApi.login({ code });
      return response;
    },
    onSuccess: (data) => {
      // 토큰 저장
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Google login callback failed:', error);
      options?.onError?.(error);
    },
  });

  return {
    processCallback: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
