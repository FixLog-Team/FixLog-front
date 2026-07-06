import { useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import {
  SearchResults,
  type SearchResultItem,
} from '@/widgets/search-results';
import { DEMO_DOCUMENTS } from '@/domains/documents/lib/mock-data/demo-documents';

const SUGGESTIONS = [
  'Find documents related to pagination bugs',
  'Show me the latest release checklist',
  'Summarize onboarding documents for new team members',
  'Find payment error handling guides',
];

const INITIAL_QUERY = 'Find documents related to payment error handling.';

export function SearchPage() {
  // State
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(INITIAL_QUERY);
  const [results, setResults] = useState<SearchResultItem[]>(() =>
    runSearch(INITIAL_QUERY)
  );

  // Functions
  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    setResults(runSearch(trimmed));
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
        {/* Conversation */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            {/* User query bubble */}
            <div className="flex justify-end">
              <span className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {submittedQuery}
              </span>
            </div>

            {/* AI response */}
            <div className="mt-6 flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent">
                <Sparkles className="size-4 text-primary" />
              </span>
              <p className="pt-1 text-sm leading-relaxed text-foreground">
                {results.length > 0
                  ? `I found ${results.length} relevant ${
                      results.length === 1 ? 'document' : 'documents'
                    } across your workspace.`
                  : `I couldn't find a matching document. Try rephrasing your request.`}
              </p>
            </div>

            {/* Result cards */}
            <div className="mt-4 pl-10">
              <SearchResults items={results} />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 px-6 pb-6">
          <div className="mx-auto max-w-3xl">
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
                disabled={!query.trim()}
              >
                <ArrowUp className="size-4" />
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function runSearch(query: string): SearchResultItem[] {
  const terms = query
    .toLowerCase()
    .replace(/[.?!,]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = DEMO_DOCUMENTS.map((doc) => {
    const haystack = `${doc.title} ${doc.description} ${doc.tags.join(' ')} ${doc.folderPath}`.toLowerCase();
    const hits = terms.filter((t) => haystack.includes(t)).length;
    return { doc, hits };
  })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4);

  return scored.map((x, i) => ({
    doc: x.doc,
    match: x.doc.matchPercent ?? Math.max(72, 92 - i * 6),
  }));
}
