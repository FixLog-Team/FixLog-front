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
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { ROUTES } from '@/shared/constants/routes';
import type { DemoFolder } from '@/domains/folders/lib/mock-data/folders';
import {
  type DemoDocument,
  STATUS_LABEL,
} from '@/domains/documents/lib/mock-data/demo-documents';

interface DocumentListSectionProps {
  folders: DemoFolder[];
  documents: DemoDocument[];
  onFolderClick?: (folder: DemoFolder) => void;
  onDocumentClick?: (document: DemoDocument) => void;
}

// Name | Type | Owner | Last updated | Status
const GRID =
  'grid grid-cols-[minmax(0,1fr)_120px_180px_150px_120px] items-center';

export function DocumentListSection({
  folders,
  documents,
  onFolderClick,
  onDocumentClick,
}: DocumentListSectionProps) {
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
          <span>Last updated</span>
          <span className="text-right">Status</span>
        </div>

        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => onFolderClick?.(folder)}
            className={`${GRID} w-full border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Folder className="size-[18px] shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">
                {folder.name}
              </span>
            </span>
            <span className="text-muted-foreground">Folder</span>
            <span className="text-muted-foreground">—</span>
            <span className="text-muted-foreground">{folder.updatedLabel}</span>
            <span className="text-right text-muted-foreground">
              {folder.itemCount} items
            </span>
          </button>
        ))}

        {documents.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => onDocumentClick?.(doc)}
            className={`${GRID} w-full border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText className="size-[18px] shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {doc.title}
                </span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </span>
              </span>
            </span>
            <span className="text-muted-foreground">Document</span>
            <span className="flex items-center gap-2 text-foreground">
              <Avatar name={doc.owner} size="sm" />
              <span className="truncate">{doc.owner}</span>
            </span>
            <span className="text-muted-foreground">{doc.updatedLabel}</span>
            <span className="flex justify-end">
              <Badge variant={doc.status}>{STATUS_LABEL[doc.status]}</Badge>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
