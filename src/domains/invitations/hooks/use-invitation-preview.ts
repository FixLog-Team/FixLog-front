import { useQuery } from '@tanstack/react-query';
import { invitationsApi } from '@/domains/invitations/api/invitations.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/**
 * 초대 미리보기 조회(미인증). /invite/:token 진입 시 워크스페이스·초대자 정보를 보여준다.
 * 토큰 자체가 유효하지 않은 경우에만 에러이며, 만료·처리 완료는 status 로 구분한다.
 */
export function useInvitationPreview(token: string) {
  return useQuery({
    queryKey: QUERY_KEYS.invitations.preview(token),
    queryFn: () => invitationsApi.getPreview(token),
    enabled: !!token,
    retry: false,
  });
}
