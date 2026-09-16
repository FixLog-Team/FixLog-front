import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowUp, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';
import { documentDetailPath } from '@/shared/constants/routes';
import { useAiChat } from '@/features/ai/chat/hooks/use-ai-chat';
import type { AskReference } from '@/domains/ai';

interface AiSummaryPanelProps {
  open: boolean;
  isLoading: boolean;
  summary?: string;
  isError: boolean;
  onClose: () => void;
}

/**
 * 문서 상세 우측 "Document AI" 패널.
 * 상단: 최신 본문 저장 → 요약 요청 동안 로딩, 완료 시 요약 텍스트, 실패 시 안내.
 * 하단: AI 검색(SearchPage)과 동일한 대화방 API(useAiChat)로 이어서 질문할 수 있는 채팅.
 * 대화 문맥은 패널을 닫아도 유지되며, 문서가 바뀌면 페이지가 key 로 다시 마운트해 새 대화가 시작된다.
 * (구조화 항목(key decisions 등)은 백엔드 미지원으로 요약 텍스트만 노출한다)
 */
export function AiSummaryPanel({
  open,
  isLoading,
  summary,
  isError,
  onClose,
}: AiSummaryPanelProps) {
  // State
  const [question, setQuestion] = useState('');

  // Hooks
  const chat = useAiChat();
  const navigate = useNavigate();

  // Refs
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Variables
  const hasChat = chat.turns.length > 0;

  // Effects — 새 턴 추가/답변 도착 시 스크롤 하단 고정
  useEffect(() => {
    if (open) bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.turns, open]);

  // Functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chat.send(question)) setQuestion('');
  };

  // Render
  if (!open) return null;

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          문서 AI
        </span>
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {/* Summary */}
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          요약
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span>요약하는 중…</span>
          </div>
        ) : isError ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            AI 요약에 실패했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {summary && summary.trim().length > 0
              ? summary
              : '요약 결과가 비어 있습니다.'}
          </p>
        )}

        {/* Chat — 첫 질문 전에는 요약만 보이고, 전송 후 턴이 누적 표시됨 */}
        {hasChat && (
          <div className="mt-6 border-t border-border pt-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI에게 질문
            </div>
            <div className="space-y-5">
              {chat.turns.map((turn) => {
                const isWaiting = turn.answer === undefined && !turn.isError;
                return (
                  <div key={turn.id}>
                    {/* User question bubble */}
                    <div className="flex justify-end">
                      <span className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                        {turn.question}
                      </span>
                    </div>

                    {/* AI answer */}
                    <div className="mt-3 flex gap-2.5">
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent',
                          isWaiting && 'animate-pulse'
                        )}
                      >
                        <Sparkles className="size-3.5 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        {isWaiting ? (
                          <span
                            className="flex items-center gap-1.5 pt-1.5"
                            role="status"
                            aria-label="답변 생성 중"
                          >
                            <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-primary/60" />
                          </span>
                        ) : turn.isError ? (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            답변 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.
                          </p>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                            {turn.answer}
                          </p>
                        )}

                        {/* 근거 문서 — 패널이 좁아 카드 대신 링크 목록으로 압축 */}
                        {turn.references.length > 0 && (
                          <ReferenceList
                            items={turn.references}
                            onOpen={(documentId) => navigate(documentDetailPath(documentId))}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={bottomAnchorRef} />
          </div>
        )}
      </div>

      {/* Ask input */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
        >
          <Sparkles className="size-4 shrink-0 text-primary" />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={hasChat ? 'Ask a follow-up question…' : 'Ask anything about this document…'}
            aria-label="AI에게 질문"
          />
          <button
            type="submit"
            aria-label="질문"
            disabled={!question.trim() || chat.isPending}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <ArrowUp className="size-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}

/** 답변 근거 문서 목록(압축형). 클릭 시 해당 문서로 이동. */
function ReferenceList({
  items,
  onOpen,
}: {
  items: AskReference[];
  onOpen: (documentId: string) => void;
}) {
  return (
    <ul className="mt-2.5 space-y-1">
      {items.map((ref) => (
        <li key={ref.documentId}>
          <button
            type="button"
            onClick={() => onOpen(ref.documentId)}
            title={ref.excerpt}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
          >
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-xs text-foreground">{ref.title}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {Math.round(ref.score * 100)}%
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
