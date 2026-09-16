import { Link } from 'react-router-dom';
import { koDateTime } from '@/shared/lib/date/format';
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
import { Badge } from '@/shared/ui/badge';
import { ROUTES } from '@/shared/constants/routes';
import { ItemActionsMenu } from '@/widgets/item-actions';
import { useDocumentLabels } from '@/domains/labels';
import { useSession } from '@/domains/auth/hooks/use-session';
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
  return koDateTime(date);
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
  const { data: session } = useSession();
  const ownerEmail = session?.email ?? null;
  const isEmpty = folders.length === 0 && documents.length === 0;
  const notifyChanged = () => onChanged?.();

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <Input
          className="h-11 flex-1"
          icon={<Search />}
          placeholder="이 워크스페이스에서 검색..."
        />
        <Button variant="secondary" className="h-11">
          <SlidersHorizontal />
          필터
        </Button>
        <Button variant="secondary" className="h-11">
          <ArrowUpDown />
          정렬
        </Button>
      </div>

      {/* AI Search hint banner */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <span className="text-foreground">
          문서 위치를 모르시겠나요?{' '}
          <Link
            to={ROUTES.SEARCH}
            className="font-medium text-primary hover:underline"
          >
            AI 검색
          </Link>{' '}
          으로 의미 기반으로 찾아보세요.
        </span>
      </div>

      {/* Table */}
      <div className="mt-6">
        <div
          className={`${GRID} border-b border-border px-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground`}
        >
          <span>이름</span>
          <span>유형</span>
          <span>소유자</span>
          <span className="text-right">수정일</span>
          <span />
        </div>

        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            불러오는 중…
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
                <span className="text-muted-foreground">폴더</span>
                <OwnerCell name={folder.updateUser ?? folder.createUser} email={ownerEmail} />
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatUpdated(folder.updateTime)}
                </span>
                <span className="flex justify-end">
                  <ItemActionsMenu
                    target={{
                      kind: 'folder',
                      id: folder.folderId,
                      name: folder.folderName,
                      parentId: folder.parentId,
                      ownerId: folder.createUser,
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
                <DocumentNameCell title={doc.title} documentId={doc.documentId} />
                <span className="text-muted-foreground">문서</span>
                <OwnerCell name={doc.updateUser ?? doc.createUser} email={ownerEmail} />
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatUpdated(doc.updateTime)}
                </span>
                <span className="flex justify-end">
                  <ItemActionsMenu
                    target={{
                      kind: 'document',
                      id: doc.documentId,
                      name: doc.title,
                      ownerId: doc.createUser,
                    }}
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

/** 문서 이름 셀. 제목 아래에 라벨 pill 을 보여준다. 라벨이 없으면 라벨 영역을 렌더하지 않는다. */
function DocumentNameCell({
  title,
  documentId,
}: {
  title: string;
  documentId: string;
}) {
  const { data } = useDocumentLabels(documentId);
  const labels = data ?? [];
  return (
    <span className="flex min-w-0 items-start gap-3">
      <FileText className="mt-0.5 size-[18px] shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-medium text-foreground">{title}</span>
        {labels.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {labels.map((label) => (
              <Badge key={label.labelId} variant="tag">
                {label.labelName}
              </Badge>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}

/** 소유자 셀. 이메일 우선, 없으면 이름, 둘 다 없으면 '—'. */
function OwnerCell({ name, email }: { name: string | null; email: string | null }) {
  const display = email ?? name;
  if (!display) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-2 text-foreground">
      <Avatar name={name ?? display} size="sm" />
      <span className="truncate">{display}</span>
    </span>
  );
}
