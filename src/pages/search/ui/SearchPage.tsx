import { useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { SearchResults } from '@/widgets/search-results';
import { useAskAi } from '@/features/ai/ask/hooks/use-ask-ai';

const SUGGESTIONS = [
  'Find documents related to pagination bugs',
  'Show me the latest release checklist',
  'Summarize onboarding documents for new team members',
  'Find payment error handling guides',
];

export function SearchPage() {
  // State
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  // Hooks
  const ask = useAskAi();

  // Variables
  const hasSearched = submittedQuery !== null;
  const answer = ask.data?.answer;
  const references = ask.data?.references ?? [];

  // Functions
  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || ask.isPending) return;
    setSubmittedQuery(trimmed);
    ask.mutate(trimmed);
    setQuery('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(query);
  };

  // Render
  return (
    <AppShell scroll={false} header={<PageHeader title="AI Search" />}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Conversation — 검색 전에는 빈 상태 안내, 질문 전송 후 API 응답으로 채워짐 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!hasSearched && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent">
                <Sparkles className="size-6 text-primary" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                무엇이든 물어보세요
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                질문을 입력하면 관련된 내 문서를 찾아 근거와 함께 답해드려요.
              </p>
            </div>
          )}

          {hasSearched && (
            <div className="mx-auto max-w-3xl px-6 py-8">
              {/* User query bubble */}
              <div className="flex justify-end">
                <span className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {submittedQuery}
                </span>
              </div>

              {/* AI response */}
              <div className="mt-6 flex gap-3">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent ${
                    ask.isPending ? 'animate-pulse' : ''
                  }`}
                >
                  <Sparkles className="size-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  {ask.isPending ? (
                    <span
                      className="flex items-center gap-1.5 pt-1.5"
                      role="status"
                      aria-label="답변 생성 중"
                    >
                      <span className="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                      <span className="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                      <span className="size-2 animate-bounce rounded-full bg-primary/60" />
                    </span>
                  ) : ask.isError ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      답변 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {answer}
                    </p>
                  )}
                </div>
              </div>

              {/* Reference cards */}
              {references.length > 0 && (
                <div className="mt-4 pl-10">
                  <SearchResults items={references} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 px-6 pb-6">
          <div className="mx-auto max-w-3xl">
            {/* 질문 예시 — 입력창 위, 첫 전송 전에만 노출 */}
            {!hasSearched && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
            >
              <Sparkles className="size-4 shrink-0 text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask FixLog to find a document..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                disabled={!query.trim() || ask.isPending}
              >
                <ArrowUp className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
