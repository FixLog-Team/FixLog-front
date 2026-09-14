import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@/domains/invitations/api/invitations.api';

/** 초대 수락. 성공 시 워크스페이스 목록을 갱신해 새로 합류한 워크스페이스가 나타나게 한다. */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitationsApi.accept(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

/** 초대 거절. */
export function useDeclineInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationsApi.decline(token),
  });
}
