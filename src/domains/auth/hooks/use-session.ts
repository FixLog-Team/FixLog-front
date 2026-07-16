import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import { tokenStorage } from '@/shared/lib/auth/token-storage';

/**
 * 현재 로그인 사용자 조회(GET /auth/token).
 * 토큰이 없으면 요청하지 않는다(enabled=false).
 */
export function useSession() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.session,
    queryFn: authApi.getSession,
    enabled: tokenStorage.isLoggedIn(),
    retry: false,
  });
}
