import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { Invitation } from '@/domains/admin';
import type { InvitationPreview } from '@/domains/invitations/types/invitation';

/**
 * 초대 수신자(invitee) API — 가이드 8장 "초대 링크 흐름".
 * 관리자가 보낸 초대는 이메일 링크의 토큰으로 수락/거절한다(수락은 인증 필요, 이메일 일치 확인).
 *   GET  /api/workspaces/invitations/{token}          → preview (미인증, 로그인 전 표시용)
 *   POST /api/workspaces/invitations/{token}/accept   → accept (합류)
 *   POST /api/workspaces/invitations/{token}/decline  → decline (거절)
 * 서버에 "내가 받은 초대 목록" 조회 API 는 없어, 토큰(링크)으로만 응답한다.
 */
const PATH = '/api/workspaces/invitations';

export const invitationsApi = {
  /** 초대 미리보기(미인증). 워크스페이스·초대자·역할·상태를 표시한다. */
  async getPreview(token: string): Promise<InvitationPreview> {
    const res = await http.get<ApiResponse<InvitationPreview>>(
      `${PATH}/${encodeURIComponent(token)}`
    );
    return unwrap(res);
  },

  /** 초대 수락. 성공 시 워크스페이스에 합류한다. */
  async accept(token: string): Promise<Invitation> {
    const res = await http.post<ApiResponse<Invitation>>(
      `${PATH}/${encodeURIComponent(token)}/accept`
    );
    return unwrap(res);
  },

  /** 초대 거절. */
  async decline(token: string): Promise<Invitation> {
    const res = await http.post<ApiResponse<Invitation>>(
      `${PATH}/${encodeURIComponent(token)}/decline`
    );
    return unwrap(res);
  },
};
