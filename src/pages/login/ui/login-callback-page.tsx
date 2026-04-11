import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLoginCallback } from '@/features/auth/login/hooks/use-google-login';
import { ROUTES } from '@/shared/constants/routes';

export function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { processCallback, isLoading } = useGoogleLoginCallback({
    onSuccess: () => {
      navigate(ROUTES.DOCUMENTS);
    },
    onError: () => {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate(ROUTES.LOGIN);
    },
  });

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      alert('Google 인증이 취소되었습니다.');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (code) {
      processCallback(code);
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [searchParams, processCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-4 text-2xl font-semibold">로그인 처리 중...</div>
        {isLoading && (
          <div className="text-muted-foreground">잠시만 기다려주세요.</div>
        )}
      </div>
    </div>
  );
}
