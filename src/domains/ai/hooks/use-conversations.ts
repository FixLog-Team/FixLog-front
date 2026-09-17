import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';
import { chatConfig } from '@/domains/ai/api/ai.api';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';

/** 최신 대화방 목록을 조회하는 훅. */
export function useConversations(size = 5) {
  const workspaceId = workspaceStorage.get();
  return useQuery({
    queryKey: ['ai', 'conversations', workspaceId, 0, size],
    queryFn: ({ signal }) => aiApi.getConversations(0, size, chatConfig(workspaceId, signal)),
  });
}
