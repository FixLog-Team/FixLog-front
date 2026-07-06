import { useState } from 'react';
import {
  Sparkles,
  X,
  ListChecks,
  Link2,
  FileText,
  ArrowUp,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';

export interface AiSummaryContent {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  relatedDocuments: { id: string; title: string }[];
}

interface AiSummaryPanelProps {
  content: AiSummaryContent;
  onClose?: () => void;
}

/** 문서 상세 우측 "Document AI" 패널 */
export function AiSummaryPanel({ content, onClose }: AiSummaryPanelProps) {
  // State
  const [checked, setChecked] = useState<Set<number>>(new Set());

  // Functions
  const toggleItem = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  // Render
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

      {/* Sections */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-4">
        <Section label="Summary">
          <p className="text-sm leading-relaxed text-foreground">
            {content.summary}
          </p>
        </Section>

        <Section label="Key decisions" icon={<Sparkles className="size-3.5" />}>
          <ul className="space-y-2">
            {content.keyDecisions.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Action items" icon={<ListChecks className="size-3.5" />}>
          <div className="space-y-2">
            {content.actionItems.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className="flex w-full items-center gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border',
                    checked.has(i)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card'
                  )}
                >
                  {checked.has(i) && <CheckMark />}
                </span>
                <span
                  className={cn(
                    'text-foreground',
                    checked.has(i) && 'text-muted-foreground line-through'
                  )}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section
          label="Related documents"
          icon={<Link2 className="size-3.5" />}
        >
          <div className="space-y-1">
            {content.relatedDocuments.map((doc) => (
              <button
                key={doc.id}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{doc.title}</span>
              </button>
            ))}
          </div>
        </Section>
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

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="none">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
