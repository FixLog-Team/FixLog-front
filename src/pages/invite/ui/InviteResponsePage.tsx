import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { koDateTime } from '@/shared/lib/date/format';
import { toast } from '@/shared/ui/toast';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { decodeUserId, tokenStorage } from '@/shared/lib/auth/token-storage';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useInvitationPreview,
} from '@/domains/invitations';
import type { AdminWorkspaceRole, InvitationStatus } from '@/domains/admin';

const ROLE_LABEL: Record<AdminWorkspaceRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '구성원',
};

/** PENDING 이 아닌 초대는 더 이상 응답할 수 없다. 상태별 안내 문구. */
const CLOSED_STATUS_MESSAGE: Partial<Record<InvitationStatus, string>> = {
  ACCEPTED: '이미 수락한 초대입니다.',
  DECLINED: '이미 거절한 초대입니다.',
  EXPIRED: '만료된 초대입니다. 관리자에게 다시 초대를 요청하세요.',
};

/**
 * 이메일 초대 링크(/invite/:token) 진입 페이지.
 * 미인증 미리보기 API 로 워크스페이스·초대자·역할을 보여주고, 수락/거절을 고른다.
 * 완료되면 메인 홈으로 이동하며 상단 Toast 로 결과를 알린다.
 */
export function InviteResponsePage() {
  // Hooks
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variables
  const isPending = accept.isPending || decline.isPending;
  const closedMessage = preview.data
    ? CLOSED_STATUS_MESSAGE[preview.data.status]
    : undefined;
  const canRespond = preview.data?.status === 'PENDING';

  // Functions
  const handleAccept = async () => {
    setErrorMessage(null);
    // 로그인 여부와 무관하게 토큰을 먼저 보존한다.
    // 비로그인/세션 만료로 로그인 화면으로 튕겨도, 로그인 콜백에서 이 토큰으로 자동 수락을 이어간다(가이드 8-1).
    savePendingInvite(token);

    // 비로그인: 로그인 페이지로 보내고 그 화면에서 "로그인 해달라" 안내 Toast 를 띄운다.
    // 로그인 성공 시 보존된 토큰으로 로그인 콜백에서 자동 수락된다.
    if (!tokenStorage.isLoggedIn()) {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          flashToast: {
            variant: 'default',
            message: '초대를 수락하려면 로그인이 필요합니다. 초대받은 계정으로 로그인하면 자동으로 수락돼요.',
          },
        },
      });
      return;
    }

    try {
      const invitation = await accept.mutateAsync(token);
      clearPendingInvite();
      // 방금 합류한 워크스페이스를 현재 워크스페이스로 선택해 홈에서 바로 보이게 한다.
      if (invitation?.workspaceId) {
        workspaceStorage.set(invitation.workspaceId);
        const userId = decodeUserId(tokenStorage.getAccessToken());
        if (userId) workspaceStorage.setLastForUser(userId, invitation.workspaceId);
      }
      // 로그인 상태 + 수락 성공: 홈으로 이동해 결과 Toast 를 띄운다(홈에서 flashToast 소비).
      navigate(ROUTES.WORKSPACE, {
        replace: true,
        state: { flashToast: { variant: 'success', message: '초대를 수락했습니다. 워크스페이스에 합류했어요.' } },
      });
    } catch (error) {
      // 서버가 명확히 거절한 경우: 이동 없이 이 화면에서 Toast 만 띄운다.
      if (axios.isAxiosError(error) && error.response) {
        clearPendingInvite();
        const isEmailMismatch = error.response.status === 403;
        toast.show(
          isEmailMismatch
            ? '초대받은 계정으로 로그인해 주세요. 지금 로그인한 계정은 초대 대상이 아니에요.'
            : getApiErrorMessage(
                error,
                '초대를 수락하지 못했습니다. 링크가 만료됐거나 이미 처리된 초대입니다.'
              )
        );
        return;
      }
      // 세션 만료(401)로 재발급 실패 → http 인터셉터가 로그인으로 리다이렉트한다.
      // 보존해 둔 토큰으로 재로그인 후 콜백에서 자동 수락되므로 여기서는 토큰을 유지한다.
    }
  };

  const handleDecline = async () => {
    setErrorMessage(null);
    try {
      await decline.mutateAsync(token);
      // 거절은 로그인 불필요. 로그인 상태면 홈, 아니면 최초 진입 페이지(랜딩)에서 결과 Toast.
      const dest = tokenStorage.isLoggedIn() ? ROUTES.WORKSPACE : ROUTES.LANDING;
      navigate(dest, {
        replace: true,
        state: { flashToast: { variant: 'default', message: '초대를 거절했습니다.' } },
      });
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

        {preview.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">초대 정보를 불러오는 중…</p>
        ) : preview.isError || !preview.data ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            초대 링크가 올바르지 않습니다. 링크를 다시 확인하거나 관리자에게 문의하세요.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                {preview.data.inviterName ?? '관리자'}
              </span>
              님이 <span className="font-medium text-foreground">
                {preview.data.workspaceName ?? '워크스페이스'}
              </span>
              에 <span className="font-medium text-foreground">
                {ROLE_LABEL[preview.data.role]}
              </span>
              (으)로 초대했습니다.
            </p>

            <dl className="mt-4 space-y-1.5 rounded-lg bg-muted/60 px-4 py-3 text-left text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>초대받은 이메일</dt>
                <dd className="truncate font-medium text-foreground">{preview.data.email}</dd>
              </div>
              {preview.data.expiresAt && (
                <div className="flex justify-between gap-3">
                  <dt>만료 시각</dt>
                  <dd className="font-medium text-foreground">
                    {koDateTime(new Date(preview.data.expiresAt))}
                  </dd>
                </div>
              )}
            </dl>

            {closedMessage && (
              <p className="mt-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {closedMessage}
              </p>
            )}
          </>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        {canRespond && (
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
        )}
      </div>
    </div>
  );
}

/** 로그인/세션 만료로 로그인 화면으로 이동해도 로그인 콜백에서 자동 수락할 수 있도록 토큰을 보존한다. */
function savePendingInvite(token: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_INVITE_TOKEN, token);
  } catch {
    // localStorage 사용 불가여도 로그인 흐름은 진행한다.
  }
}

/** 보존한 초대 토큰을 지운다(수락 성공/명확한 거절 후, 재로그인 시 중복 수락 방지). */
function clearPendingInvite() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_INVITE_TOKEN);
  } catch {
    // 무시
  }
}
