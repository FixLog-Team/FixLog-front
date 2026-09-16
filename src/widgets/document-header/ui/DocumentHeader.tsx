import { Fragment } from 'react';
import {
  ChevronRight,
  FolderPlus,
  FilePlus,
  History,
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
  onHistory?: () => void;
  isHistoryOpen?: boolean;
  onDelete?: () => void;
  /** 삭제 버튼 노출 여부(소유자/관리자만). 기본 true. */
  canDelete?: boolean;
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
  onHistory,
  isHistoryOpen = false,
  onDelete,
  canDelete = true,
}: DocumentHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <Breadcrumb items={breadcrumb} />

      {mode === 'list' ? (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onCreateFolder}>
            <FolderPlus />
            새 폴더
          </Button>
          <Button size="sm" onClick={onCreateDocument}>
            <FilePlus />
            새 문서
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="즐겨찾기 추가"
            onClick={onToggleFavorite}
          >
            <Star className={cn(isFavorite && 'fill-current text-primary')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="버전 기록"
            title="버전 기록"
            className={cn(isHistoryOpen && 'bg-accent text-primary')}
            onClick={onHistory}
          >
            <History />
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            <Share2 />
            공유
          </Button>
          {isSaved && !isSaving && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <Check className="size-4" />
              저장됨
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중…' : '저장'}
          </Button>
          <Button size="sm" onClick={onSummarize}>
            <Sparkles />
            요약
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="문서 삭제"
              className="hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          )}
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
