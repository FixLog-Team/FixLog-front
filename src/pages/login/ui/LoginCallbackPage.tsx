import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSaveTokens } from '@/features/auth/login/hooks/use-token-save';
import { ROUTES } from '@/shared/constants/routes';
import { decodeUserId } from '@/shared/lib/auth/token-storage';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { invitationsApi } from '@/domains/invitations';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';

export function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const saveTokens = useSaveTokens();
  // StrictMode(dev)의 effect 이중 실행 방지: 토큰 저장·초대 자동 수락을 한 번만 수행한다.
  // (두 번 실행되면 두 번째에서 보존 토큰이 이미 지워져 완료 Toast 가 유실됨)
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      alert('Google 인증이 취소되었습니다.');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!accessToken) {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate(ROUTES.LOGIN);
      return;
    }

    saveTokens(accessToken, refreshToken ?? undefined);

    // 비로그인 상태로 초대 링크에 진입했다가 로그인한 경우: 보존해 둔 토큰으로 수락을 이어간다(가이드 8-1).
    const pendingInviteToken = readAndClearPendingInvite();
    if (pendingInviteToken) {
      // 수락 결과 Toast 는 메인 페이지 진입 후 그 화면에서 띄운다(홈에서 flashToast 소비).
      invitationsApi
        .accept(pendingInviteToken)
        .then((invitation) => {
          if (invitation?.workspaceId) {
            workspaceStorage.set(invitation.workspaceId);
            const userId = decodeUserId(accessToken);
            if (userId) workspaceStorage.setLastForUser(userId, invitation.workspaceId);
          }
          return {
            variant: 'success' as const,
            message: '초대를 수락했습니다. 워크스페이스에 합류했어요.',
          };
        })
        .catch((e) => {
          restoreLastWorkspace(accessToken);
          // 초대 이메일과 로그인 이메일이 다른 경우(403): 초대받은 계정으로 로그인하라고 안내.
          const isEmailMismatch = axios.isAxiosError(e) && e.response?.status === 403;
          return {
            variant: 'default' as const,
            message: isEmailMismatch
              ? '초대받은 계정으로 로그인해 주세요. 지금 로그인한 계정은 초대 대상이 아니에요.'
              : getApiErrorMessage(
                  e,
                  '초대를 수락하지 못했습니다. 링크가 만료되지 않았는지 확인하세요.'
                ),
          };
        })
        .then((flashToast) => navigate(ROUTES.WORKSPACE, { state: { flashToast } }));
      return;
    }

    // 일반 로그인: 이 계정이 마지막으로 보던 워크스페이스로 복원(없으면 개인).
    restoreLastWorkspace(accessToken);
    navigate(ROUTES.WORKSPACE);
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

/** 보존해 둔 초대 토큰을 읽고 즉시 지운다(중복 수락 방지). localStorage 사용 불가 시 null. */
function readAndClearPendingInvite(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.PENDING_INVITE_TOKEN);
    if (token) localStorage.removeItem(STORAGE_KEYS.PENDING_INVITE_TOKEN);
    return token;
  } catch {
    return null;
  }
}

/** 이 계정이 마지막으로 보던 워크스페이스로 복원(없으면 개인 스코프). 다른 계정 선택이 새지 않게 한다. */
function restoreLastWorkspace(accessToken: string) {
  const userId = decodeUserId(accessToken);
  const last = userId ? workspaceStorage.getLastForUser(userId) : null;
  if (last) workspaceStorage.set(last);
  else workspaceStorage.clear();
}
