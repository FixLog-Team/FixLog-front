import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  ArrowUp,
  FilePlus,
  FolderPlus,
  Upload,
  FileText,
  Folder,
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
import { documentsApi } from '@/domains/documents/api/documents.api';
import type { DocumentDto } from '@/domains/documents/types/document';
import { useCreateDocument } from '@/features/documents/create-document/hooks/use-create-document';
import { useCreateFolder } from '@/features/folders/create-folder/hooks/use-create-folder';
import { useRecentFolders } from '@/domains/folders/hooks/use-recent-folders';
import type { RecentFolder } from '@/domains/folders/hooks/use-recent-folders';
import { useDocumentLabels } from '@/domains/labels';

const SUGGESTIONS = [
  'Find documents related to pagination bugs',
  'Show me the latest release checklist',
  'Summarize onboarding documents for new team members',
  'Find payment error handling guides',
];

const QUICK_ACTIONS = [
  { key: 'new-document', label: 'New Document', icon: FilePlus },
  { key: 'new-folder', label: 'New Folder', icon: FolderPlus },
  { key: 'import', label: 'Import Documents', icon: Upload },
] as const;

// 최근 문서 표시 개수(가장 최근 수정 순).
const RECENT_LIMIT = 4;
// 최근 수정 폴더 표시 개수.
const RECENT_FOLDER_LIMIT = 6;

const PINNED = [DEMO_DOCUMENTS[2], DEMO_DOCUMENTS[0], DEMO_DOCUMENTS[4]];

export function WorkspaceHomePage() {
  // State
  const [query, setQuery] = useState('');

  // Hooks
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const createFolder = useCreateFolder();
  // 최근 수정 문서: folderId 미지정 목록은 updateTime DESC 이므로 상위 N개가 최신순.
  const recentQuery = useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: () => documentsApi.list({ page: 0, size: RECENT_LIMIT }),
  });
  const recentFoldersQuery = useRecentFolders(RECENT_FOLDER_LIMIT);

  // Variables
  const firstName = CURRENT_USER.name.split(' ')[0];
  const recentDocuments = recentQuery.data?.items ?? [];
  const recentFolders = recentFoldersQuery.data ?? [];

  // Functions
  const goSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
  };

  const handleCreateDocument = async () => {
    try {
      const created = await createDocument.mutateAsync({
        folderId: null,
        title: 'Untitled',
      });
      navigate(documentDetailPath(created.documentId));
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  // 사이드바 FOLDERS + 버튼과 동일: 팝업 → 생성 성공 시에만 Documents 로 이동(사이드바 자동 갱신).
  const handleCreateFolder = async () => {
    const folderName = window.prompt('폴더 이름을 입력하세요', 'New Folder');
    if (!folderName) return;
    try {
      await createFolder.mutateAsync({ parentId: null, folderName });
      navigate(ROUTES.DOCUMENTS);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleQuickAction = (key: (typeof QUICK_ACTIONS)[number]['key']) => {
    if (key === 'new-document') handleCreateDocument();
    else if (key === 'new-folder') handleCreateFolder();
    // 'import' 는 아직 미구현
  };

  // Render
  return (
    <AppShell
      header={
        <PageHeader
          title="Home"
          action={
            <Button size="sm" onClick={handleCreateDocument}>
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
              key={action.key}
              role="button"
              tabIndex={0}
              onClick={() => handleQuickAction(action.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuickAction(action.key);
                }
              }}
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
              <button
                onClick={() => navigate(ROUTES.DOCUMENTS)}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-1">
              {recentQuery.isLoading ? (
                <p className="px-2.5 py-2 text-sm text-muted-foreground">
                  불러오는 중…
                </p>
              ) : recentDocuments.length === 0 ? (
                <p className="px-2.5 py-2 text-sm text-muted-foreground">
                  아직 문서가 없습니다.
                </p>
              ) : (
                recentDocuments.map((doc) => (
                  <RecentDocRow
                    key={doc.documentId}
                    doc={doc}
                    onClick={() => navigate(documentDetailPath(doc.documentId))}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-1.5">
              <Star className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
            </div>
            <div className="space-y-1">
              {PINNED.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  onClick={() => navigate(documentDetailPath(doc.id))}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Recently updated folders */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Recently updated folders
          </h2>
          {recentFoldersQuery.isLoading ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              불러오는 중…
            </p>
          ) : recentFolders.length === 0 ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              아직 폴더가 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentFolders.map((folder) => (
                <FolderCard
                  key={folder.folderId}
                  folder={folder}
                  onClick={() =>
                    navigate(ROUTES.DOCUMENTS, {
                      state: { folderPath: folder.path },
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

/** 최근 수정 폴더 카드. 클릭 시 해당 폴더로 이동한다. */
function FolderCard({
  folder,
  onClick,
}: {
  folder: RecentFolder;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Folder className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {folder.folderName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {folder.documentCount} docs · {formatRelative(folder.updateTime)}
        </span>
      </span>
    </Card>
  );
}

/** 최근 문서 행(실제 DocumentDto). 라벨 첫 개를 pill 로 표시. */
function RecentDocRow({
  doc,
  onClick,
}: {
  doc: DocumentDto;
  onClick: () => void;
}) {
  const { data } = useDocumentLabels(doc.documentId);
  const firstLabel = data?.[0];
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
      </span>
      {firstLabel && <Badge variant="tag">{firstLabel.labelName}</Badge>}
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatUpdated(doc.updateTime)}
      </span>
    </button>
  );
}

/** Pinned 등 목업(DemoDocument) 행. */
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

function formatUpdated(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** 상대 시간 표기(디자인: "2 days ago" 등). 오래되면 절대 날짜로 대체. */
function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
