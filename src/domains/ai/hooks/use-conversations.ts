import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';

/** 최신 대화방 목록을 조회하는 훅. */
export function useConversations(size = 5) {
  return useQuery({
    queryKey: ['ai', 'conversations', size],
    queryFn: () => aiApi.getConversations(0, size),
  });
}
