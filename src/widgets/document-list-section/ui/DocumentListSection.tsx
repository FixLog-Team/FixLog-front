import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { koDateTime } from '@/shared/lib/date/format';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Folder,
  FileText,
  FolderInput,
  Download,
  Trash2,
  X,
  ListChecks,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/ui/alert-dialog';
import { toast } from '@/shared/ui/toast';
import { ROUTES } from '@/shared/constants/routes';
import { ItemActionsMenu, MoveDialog } from '@/widgets/item-actions';
import { useDocumentLabels } from '@/domains/labels';
import { useOwnerName } from '@/domains/workspaces';
import { useFavorites } from '@/domains/documents';
import { useTitleSearch } from '@/domains/search';
import {
  useBulkDelete,
  useBulkMove,
  useBulkDownload,
  BULK_DOWNLOAD_MAX_DOCUMENTS,
  type BulkOperationResult,
} from '@/domains/bulk';
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
  /** 이동 성공 후 목적지 폴더(루트면 null)로 이동시키기 위한 콜백. */
  onMoved?: (destinationId: string | null) => void;
}

// Name | Type | Owner | Last updated | Actions(⋮)
const GRID = 'grid grid-cols-[minmax(0,1fr)_120px_180px_150px_48px] items-center';
// 선택 모드: 맨 앞에 체크박스 컬럼(40px) 추가.
const GRID_SELECT =
  'grid grid-cols-[40px_minmax(0,1fr)_120px_180px_150px_48px] items-center';

function formatUpdated(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return koDateTime(date);
}

/** 일괄 작업 결과를 사용자 안내 문구로 만든다(부분 성공 요약). */
function bulkResultMessage(verb: string, r: BulkOperationResult): string {
  if (r.failedCount === 0) return `${r.succeededCount}개를 ${verb}했어요.`;
  return `${r.totalRequested}개 중 ${r.succeededCount}개 ${verb} · ${r.failedCount}개 실패`;
}

/** 선택 행 체크박스. 행 열기(onClick)와 겹치지 않도록 클릭 전파를 막는다. */
function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <span className="flex justify-center" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="size-4 cursor-pointer accent-primary"
      />
    </span>
  );
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
  onMoved,
}: DocumentListSectionProps) {
  const resolveOwner = useOwnerName();
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [query, setQuery] = useState('');
  const favoritesQuery = useFavorites(onlyFavorites);
  const notifyChanged = () => onChanged?.();

  const keyword = query.trim();
  const searching = keyword.length > 0;

  // 제목 검색은 서버가 처리한다(GET /search/title — 폴더명 + 문서 제목 통합, 본문 미포함).
  // 권한 필터도 서버에서 적용되어 "내가 볼 수 있는 것"만 내려온다.
  // 타건마다 호출하지 않도록 키워드를 디바운스(300ms)해서 넘긴다.
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);
  const titleSearch = useTitleSearch({ q: debouncedKeyword });
  const debouncePending = searching && keyword !== debouncedKeyword;

  // 즐겨찾기 필터가 켜지면 폴더는 숨기고 즐겨찾기 문서만 보여준다(폴더 무관 전체).
  // 검색 중에는 워크스페이스 전체 검색 결과를 우선한다(즐겨찾기/현재 폴더 범위 무시).
  const displayFolders = searching
    ? (titleSearch.data?.folders ?? [])
    : onlyFavorites
      ? []
      : folders;
  const displayDocuments = searching
    ? (titleSearch.data?.documents ?? [])
    : onlyFavorites
      ? (favoritesQuery.data ?? [])
      : documents;
  const listLoading = searching
    ? debouncePending || titleSearch.isLoading || titleSearch.isFetching
    : onlyFavorites
      ? favoritesQuery.isLoading
      : isLoading;
  const isEmpty = displayFolders.length === 0 && displayDocuments.length === 0;

  // --- 다중 선택(일괄 삭제/이동/다운로드) ---
  // "다중 선택" 버튼을 눌러야 선택 모드로 진입하고, 그때만 체크박스/액션 바가 보인다.
  // 선택은 "현재 표시 중인 목록"을 대상으로 하므로 탐색·검색·즐겨찾기 어디서나 가능하다
  // (안드로이드 DocumentsActivity 와 동일: currentItems 기준 선택).
  const [selectMode, setSelectMode] = useState(false);
  const selecting = selectMode;
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDelete();
  const bulkMove = useBulkMove();
  const bulkDownload = useBulkDownload();

  const clearSelection = () => {
    setSelectedFolders(new Set());
    setSelectedDocuments(new Set());
  };

  // 표시 목록이 바뀌면(폴더 이동·새 목록 로드·즐겨찾기 전환·검색어 변경) 선택을 초기화한다.
  // 안 보이는 항목이 선택된 채 남아 일괄 작업에 섞이는 것을 막는다.
  useEffect(() => {
    clearSelection();
  }, [folders, documents, onlyFavorites, debouncedKeyword]);

  const toggleFolder = (id: string) =>
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleDocument = (id: string) =>
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedCount = selectedFolders.size + selectedDocuments.size;
  const visibleCount = displayFolders.length + displayDocuments.length;
  const allSelected = visibleCount > 0 && selectedCount === visibleCount;
  const toggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      setSelectedFolders(new Set(displayFolders.map((f) => f.folderId)));
      setSelectedDocuments(new Set(displayDocuments.map((d) => d.documentId)));
    }
  };

  const bulkTargets = () => ({
    documentIds: [...selectedDocuments],
    folderIds: [...selectedFolders],
  });
  // 다운로드는 문서만 대상이라 한도도 문서 기준으로 본다.
  const downloadTooMany = selectedDocuments.size > BULK_DOWNLOAD_MAX_DOCUMENTS;

  const handleBulkDelete = () => {
    bulkDelete.mutate(bulkTargets(), {
      onSuccess: (result) => {
        toast.success(bulkResultMessage('삭제', result));
        clearSelection();
        onChanged?.();
      },
      onError: () => toast.error('일괄 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.'),
      onSettled: () => setDeleteOpen(false),
    });
  };

  const handleBulkMove = (destinationId: string | null) => {
    bulkMove.mutate(
      { ...bulkTargets(), targetFolderId: destinationId },
      {
        onSuccess: (result) => {
          toast.success(bulkResultMessage('이동', result));
          clearSelection();
          onChanged?.();
        },
        onError: () => toast.error('일괄 이동에 실패했어요. 잠시 후 다시 시도해 주세요.'),
        onSettled: () => setMoveOpen(false),
      }
    );
  };

  const handleBulkDownload = () => {
    // 폴더는 다운로드 대상이 아니다. 섞여 있으면 안내하고 중단한다.
    if (selectedFolders.size > 0) {
      toast.error('폴더는 다운로드할 수 없어요. 폴더 선택을 해제한 뒤 다시 시도해 주세요.');
      return;
    }
    if (selectedDocuments.size === 0) {
      toast.error('다운로드할 문서를 선택해 주세요.');
      return;
    }
    if (downloadTooMany) {
      toast.error(
        `한 번에 문서 ${BULK_DOWNLOAD_MAX_DOCUMENTS}개까지 다운로드할 수 있어요.`
      );
      return;
    }
    bulkDownload.mutate(
      { documentIds: [...selectedDocuments], folderIds: [] },
      {
        onError: () => toast.error('다운로드에 실패했어요. 잠시 후 다시 시도해 주세요.'),
      }
    );
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    clearSelection();
  };

  /**
   * 폴더 열기. 검색 결과에서 눌렀다면 검색을 종료해(입력 비우기) 이동한 폴더의
   * 내용이 바로 보이게 한다(검색어가 남아 있으면 계속 검색 결과만 노출됨).
   */
  const handleFolderOpen = (folder: FolderItem) => {
    if (searching) {
      setQuery('');
      setDebouncedKeyword('');
    }
    onFolderClick?.(folder);
  };

  const grid = selecting ? GRID_SELECT : GRID;

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <Input
          className="h-11 flex-1"
          icon={<Search />}
          placeholder="제목으로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={onlyFavorites ? 'default' : 'secondary'}
              className="h-11 w-40"
            >
              <SlidersHorizontal />
              필터
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuCheckboxItem
              checked={onlyFavorites}
              onCheckedChange={(v) => setOnlyFavorites(!!v)}
            >
              즐겨찾기
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* 다중 선택 토글 — 탐색·검색 결과 모두에서 사용 가능. 켜면 체크박스/액션 바가 나온다. */}
        <Button
          variant={selectMode ? 'default' : 'secondary'}
          className="h-11"
          onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
        >
          <ListChecks />
          {selectMode ? '선택 취소' : '다중 선택'}
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

      {/* 일괄 작업 바 — 선택 모드에서 1개 이상 선택했을 때 노출 */}
      {selecting && selectedCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selectedCount}개 선택됨
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMoveOpen(true)}
              disabled={bulkMove.isPending}
            >
              <FolderInput />
              이동
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkDownload}
              disabled={bulkDownload.isPending || downloadTooMany}
              title={
                downloadTooMany
                  ? `문서 ${BULK_DOWNLOAD_MAX_DOCUMENTS}개 이하만 가능`
                  : undefined
              }
            >
              <Download />
              {bulkDownload.isPending ? '다운로드 중…' : '다운로드'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={bulkDelete.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              삭제
            </Button>
            <Button variant="ghost" size="sm" onClick={exitSelectMode}>
              <X />
              해제
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6">
        <div
          className={`${grid} border-b border-border px-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground`}
        >
          {selecting && (
            <span className="flex justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="전체 선택"
                className="size-4 cursor-pointer accent-primary"
              />
            </span>
          )}
          <span>이름</span>
          <span>유형</span>
          <span>소유자</span>
          <span className="text-right">수정일</span>
          <span />
        </div>

        {listLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            불러오는 중…
          </p>
        ) : isEmpty ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {keyword
              ? '검색 결과가 없습니다.'
              : onlyFavorites
                ? '즐겨찾기한 문서가 없습니다.'
                : '폴더가 비었습니다.'}
          </p>
        ) : (
          <>
            {displayFolders.map((folder) => (
              <div
                key={folder.folderId}
                role="button"
                tabIndex={0}
                onClick={() => handleFolderOpen(folder)}
                onKeyDown={rowKeyHandler(() => handleFolderOpen(folder))}
                className={`${grid} w-full cursor-pointer border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
              >
                {selecting && (
                  <RowCheckbox
                    checked={selectedFolders.has(folder.folderId)}
                    onChange={() => toggleFolder(folder.folderId)}
                    label={`${folder.folderName} 선택`}
                  />
                )}
                <span className="flex min-w-0 items-center gap-3">
                  <Folder className="size-[18px] shrink-0 text-primary" />
                  <span className="truncate font-medium text-foreground">
                    {folder.folderName}
                  </span>
                </span>
                <span className="text-muted-foreground">폴더</span>
                <OwnerCell name={resolveOwner(folder.createUser)} />
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatUpdated(folder.updateTime)}
                </span>
                <span className="flex justify-end">
                  {!searching && (
                    <ItemActionsMenu
                      target={{
                        kind: 'folder',
                        id: folder.folderId,
                        name: folder.folderName,
                        parentId: folder.parentId,
                        ownerId: folder.createUser,
                      }}
                      onChanged={notifyChanged}
                      onMoved={onMoved}
                    />
                  )}
                </span>
              </div>
            ))}

            {displayDocuments.map((doc) => (
              <div
                key={doc.documentId}
                role="button"
                tabIndex={0}
                onClick={() => onDocumentClick?.(doc)}
                onKeyDown={rowKeyHandler(() => onDocumentClick?.(doc))}
                className={`${grid} w-full cursor-pointer border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-card`}
              >
                {selecting && (
                  <RowCheckbox
                    checked={selectedDocuments.has(doc.documentId)}
                    onChange={() => toggleDocument(doc.documentId)}
                    label={`${doc.title} 선택`}
                  />
                )}
                <DocumentNameCell title={doc.title} documentId={doc.documentId} />
                <span className="text-muted-foreground">문서</span>
                <OwnerCell name={resolveOwner(doc.createUser)} />
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatUpdated(doc.updateTime)}
                </span>
                <span className="flex justify-end">
                  {!searching && (
                    <ItemActionsMenu
                      target={{
                        kind: 'document',
                        id: doc.documentId,
                        name: doc.title,
                        ownerId: doc.createUser,
                      }}
                      onChanged={notifyChanged}
                      onMoved={onMoved}
                    />
                  )}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 일괄 이동 — 이동 팝업(MoveDialog) 재사용.
          선택된 폴더(와 그 하위)는 목적지 목록에서 제외해 자기 안으로 옮기지 못하게 한다. */}
      {moveOpen && (
        <MoveDialog
          target={{ kind: 'document', id: '__bulk__', name: `선택한 ${selectedCount}개` }}
          open={moveOpen}
          onOpenChange={setMoveOpen}
          onSelect={handleBulkMove}
          title="이동할 위치 선택"
          description={`선택한 ${selectedCount}개 항목을 옮길 폴더를 선택하세요.`}
          excludeFolderIds={[...selectedFolders]}
        />
      )}

      {/* 일괄 삭제 확인 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>선택한 항목을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedCount}개 항목을 휴지통으로 보냅니다. 폴더는 그 안의
              하위 항목도 함께 삭제됩니다. 휴지통에서 복원할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDelete.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** 문서 이름 셀. 제목 아래에 태그 pill 을 보여준다. 태그가 없으면 태그 영역을 렌더하지 않는다. */
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

/** 소유자 셀. 리졸버로 변환된 소유자 이름을 표시한다(미확인 시 '—'). */
function OwnerCell({ name }: { name: string }) {
  if (!name || name === '—') return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-2 text-foreground">
      <Avatar name={name} size="sm" />
      <span className="truncate">{name}</span>
    </span>
  );
}
