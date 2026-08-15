import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';
import type { AskReference } from '@/domains/ai';

/** 화면에 표시하는 대화 한 턴. answer 가 없고 에러도 아니면 응답 대기 중. */
export interface ChatTurn {
  id: number;
  question: string;
  answer?: string;
  references: AskReference[];
  isError?: boolean;
}

/**
 * AI 대화방 채팅 상태 관리 (POST /api/ai/conversations, .../messages).
 * 첫 메시지 전송 시 대화방을 생성하고, 이후 같은 대화방으로 전송해 문맥을 유지한다.
 * 대화방 생성 후 전송이 실패해도 대화방 ID 는 유지되어 재시도 시 같은 대화가 이어진다.
 *
 * conversationId 를 전달하면 해당 대화방의 기존 메시지를 불러온다.
 */
export function useAiChat(conversationId?: string) {
  // State
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refs — conversationId 는 렌더링에 쓰이지 않으므로 ref 로 관리
  const conversationIdRef = useRef<string | null>(conversationId ?? null);
  const nextTurnIdRef = useRef(0);
  const queryClient = useQueryClient();

  // Effects — 기존 대화방 메시지 로드
  useEffect(() => {
    if (!conversationId) return;
    conversationIdRef.current = conversationId;

    let cancelled = false;
    setIsLoading(true);

    aiApi.getChatMessages(conversationId, undefined, 100).then((slice) => {
      if (cancelled) return;
      const loaded: ChatTurn[] = [];
      const messages = slice.items;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.role === 'USER') {
          const next = messages[i + 1];
          const answer =
            next?.role === 'ASSISTANT'
              ? (next.content ?? '')
              : undefined;
          loaded.push({
            id: nextTurnIdRef.current++,
            question: msg.content ?? '',
            answer,
            references: next?.role === 'ASSISTANT' ? (next.references ?? []) : [],
            isError: next?.role === 'ASSISTANT' && next.status === 'FAILED',
          });
          if (next?.role === 'ASSISTANT') i++;
        }
      }
      setTurns(loaded);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [conversationId]);

  // Mutations
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationIdRef.current) {
        const title = content.length > 30 ? content.slice(0, 30) + '...' : content;
        const conversation = await aiApi.createConversation(title);
        conversationIdRef.current = conversation.conversationId;
      }
      return aiApi.sendChatMessage(conversationIdRef.current, content);
    },
  });

  // Functions
  const send = (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || sendMutation.isPending) return false;

    const turnId = nextTurnIdRef.current++;
    setTurns((prev) => [...prev, { id: turnId, question: content, references: [] }]);

    sendMutation.mutate(content, {
      onSuccess: (result) => {
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId
              ? {
                  ...turn,
                  answer: result.assistantMessage.content ?? '',
                  references: result.references ?? [],
                }
              : turn
          )
        );
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      },
      onError: () => {
        setTurns((prev) =>
          prev.map((turn) => (turn.id === turnId ? { ...turn, isError: true } : turn))
        );
      },
    });
    return true;
  };

  const reset = () => {
    setTurns([]);
    conversationIdRef.current = null;
    sendMutation.reset();
  };

  return {
    turns,
    send,
    reset,
    isPending: sendMutation.isPending,
    isLoading,
  };
}
