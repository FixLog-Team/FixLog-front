import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSaveTokens } from '@/features/auth/login/hooks/use-token-save';
import { ROUTES } from '@/shared/constants/routes';

export function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const saveTokens = useSaveTokens();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      alert('Google 인증이 취소되었습니다.');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (accessToken) {
      saveTokens(accessToken, refreshToken ?? undefined);
      navigate(ROUTES.HOME);
    } else {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate(ROUTES.LOGIN);
    }
  }, [searchParams, navigate, saveTokens]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-4 text-2xl font-semibold">로그인 처리 중...</div>
        <div className="text-muted-foreground">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
}
