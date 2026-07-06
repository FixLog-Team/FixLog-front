import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowUp,
  FilePlus,
  FolderPlus,
  Upload,
  FileText,
  Star,
} from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ROUTES, documentDetailPath } from '@/shared/constants/routes';
import { CURRENT_USER } from '@/domains/user/lib/mock-data/current-user';
import { DEMO_DOCUMENTS } from '@/domains/documents/lib/mock-data/demo-documents';
import type { DemoDocument } from '@/domains/documents/lib/mock-data/demo-documents';

const SUGGESTIONS = [
  'Find documents related to pagination bugs',
  'Show me the latest release checklist',
  'Summarize onboarding documents for new team members',
  'Find payment error handling guides',
];

const QUICK_ACTIONS = [
  { label: 'New Document', icon: FilePlus },
  { label: 'New Folder', icon: FolderPlus },
  { label: 'Import Documents', icon: Upload },
];

const RECENT = DEMO_DOCUMENTS.slice(0, 4);
const PINNED = [DEMO_DOCUMENTS[2], DEMO_DOCUMENTS[0], DEMO_DOCUMENTS[4]];

export function WorkspaceHomePage() {
  // State
  const [query, setQuery] = useState('');

  // Hooks
  const navigate = useNavigate();

  // Variables
  const firstName = CURRENT_USER.name.split(' ')[0];

  // Functions
  const goSearch = (text: string) => {
    if (!text.trim()) return;
    navigate(ROUTES.SEARCH);
  };

  // Render
  return (
    <AppShell
      header={
        <PageHeader
          title="Home"
          action={
            <Button size="sm">
              <FilePlus />
              New Document
            </Button>
          }
        />
      }
    >
      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Greeting + search */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {greeting()}, {firstName}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            What are you looking for?
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            goSearch(query);
          }}
          className="mx-auto mt-8 flex max-w-2xl items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
        >
          <Sparkles className="size-5 shrink-0 text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask FixLog to find the document you need..."
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ArrowUp className="size-4" />
          </button>
        </form>

        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => goSearch(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Card
              key={action.label}
              className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                <action.icon className="size-4" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </Card>
          ))}
        </div>

        {/* Recent + Pinned */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Recent documents
              </h2>
              <button className="text-[13px] font-medium text-primary hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-1">
              {RECENT.map((doc) => (
                <DocRow key={doc.id} doc={doc} onClick={() => navigate(documentDetailPath(doc.id))} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-1.5">
              <Star className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
            </div>
            <div className="space-y-1">
              {PINNED.map((doc) => (
                <DocRow key={doc.id} doc={doc} onClick={() => navigate(documentDetailPath(doc.id))} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function DocRow({ doc, onClick }: { doc: DemoDocument; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-card"
    >
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {doc.title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {doc.folderPath}
        </span>
      </span>
      {doc.tags[0] && <Badge variant="tag">{doc.tags[0]}</Badge>}
      <span className="shrink-0 text-xs text-muted-foreground">
        {doc.updatedLabel}
      </span>
    </button>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
