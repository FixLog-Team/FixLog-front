import { Sparkles, X, ArrowUp } from 'lucide-react';

interface AiSummaryPanelProps {
  open: boolean;
  isLoading: boolean;
  summary?: string;
  isError: boolean;
  onClose: () => void;
}

/**
 * 문서 상세 우측 "Document AI" 패널.
 * 최신 본문 저장 → 요약 요청 동안 로딩, 완료 시 요약 텍스트, 실패 시 안내를 보여준다.
 * (구조화 항목(key decisions 등)은 백엔드 미지원으로 요약 텍스트만 노출한다)
 */
export function AiSummaryPanel({
  open,
  isLoading,
  summary,
  isError,
  onClose,
}: AiSummaryPanelProps) {
  // Render
  if (!open) return null;

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          Document AI
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span>Summarizing…</span>
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
      </div>

      {/* Ask input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Ask anything about this document…"
          />
          <button
            aria-label="Ask"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
