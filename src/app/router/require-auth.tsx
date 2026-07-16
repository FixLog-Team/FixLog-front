import { Navigate, Outlet } from 'react-router-dom';
import { tokenStorage } from '@/shared/lib/auth/token-storage';
import { ROUTES } from '@/shared/constants/routes';

/**
 * 인증 가드. accessToken 이 없으면 로그인 화면으로 리다이렉트한다.
 * (토큰이 만료됐지만 존재하는 경우는 통과 → API 401 시 http 인터셉터가 refresh/로그아웃 처리)
 */
export function RequireAuth() {
  if (!tokenStorage.isLoggedIn()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Outlet />;
}
