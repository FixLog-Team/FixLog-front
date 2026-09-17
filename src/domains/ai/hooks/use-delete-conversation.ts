import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';

/** AI 대화방 삭제. 성공 시 대화방 목록을 갱신한다. */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => aiApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
  });
}
