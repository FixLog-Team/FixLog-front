import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast';
import { ROUTES } from '@/shared/constants/routes';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { decodeUserId, tokenStorage } from '@/shared/lib/auth/token-storage';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import { useAcceptInvitation, useDeclineInvitation } from '@/domains/invitations';

/**
 * 이메일 초대 링크(/invite/:token) 진입 페이지.
 * 수락/거절을 고르고, 완료되면 메인 홈으로 이동하며 상단 Toast 로 결과를 알린다.
 * (서버에 토큰으로 초대 상세를 미리 조회하는 API 는 없어, 워크스페이스 이름 등은 표시하지 않는다.)
 */
export function InviteResponsePage() {
  // Hooks
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variables
  const isPending = accept.isPending || decline.isPending;

  // Functions
  const handleAccept = async () => {
    setErrorMessage(null);
    try {
      const invitation = await accept.mutateAsync(token);
      // 방금 합류한 워크스페이스를 현재 워크스페이스로 선택해 홈에서 바로 보이게 한다.
      if (invitation?.workspaceId) {
        workspaceStorage.set(invitation.workspaceId);
        const userId = decodeUserId(tokenStorage.getAccessToken());
        if (userId) workspaceStorage.setLastForUser(userId, invitation.workspaceId);
      }
      toast.success('초대를 수락했습니다. 워크스페이스에 합류했어요.');
      navigate(ROUTES.WORKSPACE, { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          '초대를 수락하지 못했습니다. 링크가 만료됐거나 초대받은 계정으로 로그인했는지 확인하세요.'
        )
      );
    }
  };

  const handleDecline = async () => {
    setErrorMessage(null);
    try {
      await decline.mutateAsync(token);
      toast.show('초대를 거절했습니다.');
      navigate(ROUTES.WORKSPACE, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '초대를 거절하지 못했습니다. 링크를 확인하세요.'));
    }
  };

  // Render
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent">
          <Mail className="size-6 text-primary" />
        </span>
        <h1 className="text-lg font-semibold text-foreground">워크스페이스 초대</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          워크스페이스에 초대되었습니다. 수락하면 구성원으로 합류하고, 거절하면 초대가 취소됩니다.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="secondary" disabled={isPending} onClick={handleDecline}>
            <X />
            {decline.isPending ? '거절 중…' : '거절'}
          </Button>
          <Button disabled={isPending} onClick={handleAccept}>
            <Check />
            {accept.isPending ? '수락 중…' : '수락'}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.WORKSPACE, { replace: true })}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
}
