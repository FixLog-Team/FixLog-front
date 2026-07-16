import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Folder,
  FileText,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { ROUTES } from '@/shared/constants/routes';
import { ItemActionsMenu } from '@/widgets/item-actions';
import type { FolderItem } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';

interface DocumentListSectionProps {
  folders: FolderItem[];
  documents: DocumentDto[];
  isLoading?: boolean;
  onFolderClick?: (folder: FolderItem) => void;
  onDocumentClick?: (document: DocumentDto) => void;
  /** 이름변경/이동/삭제/복제 후 목록을 다시 불러오기 위한 콜백. */
  onChanged?: () => void;
}

// Name | Type | Owner | Last updated | Actions(⋮)
const GRID = 'grid grid-cols-[minmax(0,1fr)_120px_180px_150px_48px] items-center';

function formatUpdated(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Enter/Space 로 행을 여는 키보드 핸들러(행이 div[role=button] 라 필요). */
function rowKeyHandler(open: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };
}

export function DocumentListSection({
  folders,
  documents,
  isLoading = false,
  onFolderClick,
  onDocumentClick,
  onChanged,
}: DocumentListSectionProps) {
  const isEmpty = folders.length === 0 && documents.length === 0;
  const notifyChanged = () => onChanged?.();

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <Input
          className="h-11 flex-1"
          icon={<Search />}
          placeholder="Search this workspace..."
        />
        <Button variant="secondary" className="h-11">
          <SlidersHorizontal />
          Filter
        </Button>
        <Button variant="secondary" className="h-11">
          <ArrowUpDown />
          Sort
        </Button>
      </div>

      {/* AI Search hint banner */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <span className="text-foreground">
          Not sure where a document lives?{' '}
          <Link
            to={ROUTES.SEARCH}
            className="font-medium text-primary hover:underline"
          >
            Use AI Search
          </Link>{' '}
          to find it by meaning.
        </span>
      </div>

      {/* Table */}
      <div className="mt-6">
        <div
          className={`${GRID} border-b border-border px-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground`}
        >
          <span>Name</span>
          <span>Type</span>
          <span>Owner</span>
          <span className="text-right">Last updated</span>
          <span />
        </div>

        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : isEmpty ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            폴더가 비었습니다.
          </p>
        ) : (
          <>
            {folders.map((folder) => (
              <div
                key={folder.folderId}
                role="button"
                tabIndex={0}
                onClick={() => onFolderClick?.(folder)}
                onKeyDown={rowKeyHandler(() => onFolderClick?.(folder))}
                className={`${GRID} w-full cursor-pointer border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Folder className="size-[18px] shrink-0 text-primary" />
                  <span className="truncate font-medium text-foreground">
                    {folder.folderName}
                  </span>
                </span>
                <span className="text-muted-foreground">Folder</span>
                <OwnerCell name={folder.updateUser ?? folder.createUser} />
                <span className="text-right text-muted-foreground">
                  {formatUpdated(folder.updateTime)}
                </span>
                <span className="flex justify-end">
                  <ItemActionsMenu
                    target={{
                      kind: 'folder',
                      id: folder.folderId,
                      name: folder.folderName,
                      parentId: folder.parentId,
                    }}
                    onChanged={notifyChanged}
                  />
                </span>
              </div>
            ))}

            {documents.map((doc) => (
              <div
                key={doc.documentId}
                role="button"
                tabIndex={0}
                onClick={() => onDocumentClick?.(doc)}
                onKeyDown={rowKeyHandler(() => onDocumentClick?.(doc))}
                className={`${GRID} w-full cursor-pointer border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileText className="size-[18px] shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">
                    {doc.title}
                  </span>
                </span>
                <span className="text-muted-foreground">Document</span>
                <OwnerCell name={doc.updateUser ?? doc.createUser} />
                <span className="text-right text-muted-foreground">
                  {formatUpdated(doc.updateTime)}
                </span>
                <span className="flex justify-end">
                  <ItemActionsMenu
                    target={{ kind: 'document', id: doc.documentId, name: doc.title }}
                    onChanged={notifyChanged}
                  />
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/** 소유자 셀. 이름이 있으면 아바타+이름, 없으면 '—'. */
function OwnerCell({ name }: { name: string | null }) {
  if (!name) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-2 text-foreground">
      <Avatar name={name} size="sm" />
      <span className="truncate">{name}</span>
    </span>
  );
}
