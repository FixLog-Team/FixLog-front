import type { AdminWorkspaceRole, InvitationStatus } from '@/domains/admin';

/**
 * GET /api/workspaces/invitations/{token} 응답 (서버 InvitationPreviewDto).
 * 로그인 전에도 초대 정보를 표시하기 위한 공개 미리보기 데이터.
 * 만료·처리 완료된 토큰도 에러 없이 현재 status 를 반환한다.
 */
export interface InvitationPreview {
  email: string;
  role: AdminWorkspaceRole;
  status: InvitationStatus;
  expiresAt: string | null; // ISO-8601
  workspaceName: string | null;
  inviterName: string | null;
}
