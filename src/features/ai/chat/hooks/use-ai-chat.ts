import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
 */
export function useAiChat() {
  // State
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  // Refs — conversationId 는 렌더링에 쓰이지 않으므로 ref 로 관리
  const conversationIdRef = useRef<string | null>(null);
  const nextTurnIdRef = useRef(0);

  // Mutations
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationIdRef.current) {
        const conversation = await aiApi.createConversation();
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
  };
}
