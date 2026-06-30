import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { ROUTES } from '@/shared/constants/routes';

/**
 * Spring Security OAuth2가 모든 인증을 처리하는 경우
 * 프론트엔드는 토큰을 받아서 저장하기만 하면 됨
 */
export function LoginCallbackSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      alert('Google 인증이 실패했습니다.');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (token) {
      // 백엔드에서 토큰을 쿼리 파라미터로 전달하는 경우
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      navigate(ROUTES.DOCUMENTS);
    } else {
      // 또는 쿠키로 전달받는 경우 - 별도 처리 불필요
      navigate(ROUTES.DOCUMENTS);
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-4 text-2xl font-semibold">로그인 처리 중...</div>
        <div className="text-muted-foreground">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
}
