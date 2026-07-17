import { Fragment } from 'react';
import {
  ChevronRight,
  FolderPlus,
  FilePlus,
  Star,
  Share2,
  Sparkles,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils/index';

export interface Crumb {
  label: string;
  /** 지정 시 클릭 가능한 경로 항목으로 렌더된다(폴더 네비게이션). */
  onClick?: () => void;
}

interface DocumentHeaderProps {
  mode?: 'list' | 'detail';
  breadcrumb?: Crumb[];
  // list mode
  onCreateFolder?: () => void;
  onCreateDocument?: () => void;
  // detail mode
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  onSummarize?: () => void;
  onDelete?: () => void;
}

export function DocumentHeader({
  mode = 'list',
  breadcrumb = [],
  onCreateFolder,
  onCreateDocument,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  onSave,
  isSaving = false,
  isSaved = false,
  onSummarize,
  onDelete,
}: DocumentHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <Breadcrumb items={breadcrumb} />

      {mode === 'list' ? (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onCreateFolder}>
            <FolderPlus />
            New Folder
          </Button>
          <Button size="sm" onClick={onCreateDocument}>
            <FilePlus />
            New Document
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add to favorites"
            onClick={onToggleFavorite}
          >
            <Star className={cn(isFavorite && 'fill-current text-primary')} />
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            <Share2 />
            Share
          </Button>
          {isSaved && !isSaving && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <Check className="size-4" />
              Saved
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" onClick={onSummarize}>
            <Sparkles />
            Summarize
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete document"
            className="hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </header>
  );
}

function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return <span />;

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'truncate',
                  isLast
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
