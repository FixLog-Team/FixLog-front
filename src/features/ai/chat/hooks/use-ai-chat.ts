import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/domains/ai';
import type { AskReference } from '@/domains/ai';
import { isAxiosError } from 'axios';
import { chatConfig } from '@/domains/ai/api/ai.api';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';

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
  const workspaceId = workspaceStorage.get();
  // State
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs — conversationId 는 렌더링에 쓰이지 않으므로 ref 로 관리
  const conversationIdRef = useRef<string | null>(conversationId ?? null);
  const nextTurnIdRef = useRef(0);
  const queryClient = useQueryClient();
  const requestRef = useRef(new AbortController());

  // Effects — 기존 대화방 메시지 로드
  useEffect(() => {
    requestRef.current.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setTurns([]);
    setError(null);
    setIsLoading(false);
    conversationIdRef.current = conversationId ?? null;
    if (!conversationId) return () => requestRef.current.abort();

    let cancelled = false;
    setIsLoading(true);

    aiApi.getChatMessages(conversationId, undefined, 100, chatConfig(workspaceId, controller.signal)).then((slice) => {
      if (cancelled || controller.signal.aborted || workspaceStorage.get() !== workspaceId) return;
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
    }).catch((cause: unknown) => {
      if (cancelled || controller.signal.aborted || workspaceStorage.get() !== workspaceId) return;
      setIsLoading(false);
      if (isAxiosError(cause) && cause.response?.status === 404) {
        conversationIdRef.current = null;
        setError('현재 워크스페이스에서 접근할 수 없는 대화입니다. 새 대화를 시작해 주세요.');
      } else {
        setError('대화 기록을 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    });

    return () => { cancelled = true; requestRef.current.abort(); };
  }, [conversationId, workspaceId]);

  // Mutations
  const sendMutation = useMutation({
    mutationFn: async ({ content, controller }: { content: string; controller: AbortController }) => {
      const config = chatConfig(workspaceId, controller.signal);
      const isCurrent = () => !controller.signal.aborted && workspaceStorage.get() === workspaceId;
      if (!isCurrent()) throw new Error('Chat scope changed');
      if (!conversationIdRef.current) {
        const title = content.length > 30 ? content.slice(0, 30) + '...' : content;
        const conversation = await aiApi.createConversation(title, config);
        if (!isCurrent()) throw new Error('Chat scope changed');
        conversationIdRef.current = conversation.conversationId;
        void queryClient.invalidateQueries({ queryKey: ['ai', 'conversations', workspaceId] });
      }
      return aiApi.sendChatMessage(conversationIdRef.current, content, config);
    },
  });

  // Functions
  const send = (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || sendMutation.isPending || isLoading || error) return false;
    const controller = requestRef.current;
    const isCurrent = () => !controller.signal.aborted && workspaceStorage.get() === workspaceId;
    if (!isCurrent()) return false;

    const turnId = nextTurnIdRef.current++;
    setTurns((prev) => [...prev, { id: turnId, question: content, references: [] }]);

    sendMutation.mutate({ content, controller }, {
      onSuccess: (result) => {
        if (!isCurrent()) return;
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
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations', workspaceId] });
      },
      onError: (cause) => {
        if (!isCurrent()) return;
        if (isAxiosError(cause) && cause.response?.status === 404) {
          conversationIdRef.current = null;
          setTurns([]);
          setError('현재 워크스페이스에서 접근할 수 없는 대화입니다. 새 대화를 시작해 주세요.');
          void queryClient.invalidateQueries({ queryKey: ['ai', 'conversations', workspaceId] });
          return;
        }
        setTurns((prev) =>
          prev.map((turn) => (turn.id === turnId ? { ...turn, isError: true } : turn))
        );
      },
    });
    return true;
  };

  const reset = () => {
    requestRef.current.abort();
    requestRef.current = new AbortController();
    setTurns([]);
    setError(null);
    setIsLoading(false);
    conversationIdRef.current = null;
    sendMutation.reset();
  };

  return {
    turns,
    send,
    reset,
    isPending: sendMutation.isPending,
    isLoading,
    error,
  };
}
