import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/domains/auth/api';
import { ROUTES } from '@/shared/constants/routes';

/**
 * 로그아웃. 클라이언트 토큰 삭제 + 쿼리 캐시 초기화 후 로그인 화면으로 이동.
 * (서버 로그아웃 API 없음 — 안드로이드 SettingsActivity 와 동일)
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    authApi.logout();
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  };
}
