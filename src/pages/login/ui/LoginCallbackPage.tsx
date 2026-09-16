import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSaveTokens } from '@/features/auth/login/hooks/use-token-save';
import { ROUTES } from '@/shared/constants/routes';
import { decodeUserId } from '@/shared/lib/auth/token-storage';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';

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
      // 이 계정이 마지막으로 보던 워크스페이스로 복원(없으면 개인). 다른 계정 선택이 새지 않게 한다.
      const userId = decodeUserId(accessToken);
      const last = userId ? workspaceStorage.getLastForUser(userId) : null;
      if (last) workspaceStorage.set(last);
      else workspaceStorage.clear();
      navigate(ROUTES.WORKSPACE);
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
