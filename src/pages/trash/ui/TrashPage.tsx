import { useState } from 'react';
import { koDateTime } from '@/shared/lib/date/format';
import { Folder, FileText, RotateCcw, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
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
import { useTrash, useRestoreTrash, usePurgeTrash } from '@/domains/trash';
import type { TrashItem } from '@/domains/trash';
import { MoveDialog } from '@/widgets/item-actions';

function formatDeleted(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return koDateTime(date);
}

/** 트리 노드: 휴지통 항목 + 하위(함께 삭제된) 항목들. */
interface TrashNode extends TrashItem {
  children: TrashNode[];
}

/** 트리 렌더용 행: 노드 + 들여쓰기 깊이 + 하위 존재 여부. */
interface TrashRow {
  node: TrashNode;
  depth: number;
  hasChildren: boolean;
}

/**
 * 평탄한 휴지통 목록을 trashedParentId 로 트리(폴더 안에 하위 항목 중첩)로 만든다.
 * - 부모(trashedParentId)도 휴지통에 있으면 그 아래로 중첩, 아니면 최상위.
 * - 삭제 최신순(서버 정렬)을 각 레벨에서 유지한다.
 */
function buildTrashTree(items: TrashItem[]): TrashNode[] {
  const byId = new Map<string, TrashNode>();
  const nodes = items.map((i): TrashNode => ({ ...i, children: [] }));
  for (const n of nodes) byId.set(n.resourceId, n);
  const roots: TrashNode[] = [];
  for (const n of nodes) {
    const parent = n.trashedParentId ? byId.get(n.trashedParentId) : undefined;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }
  return roots;
}

/** 접힘 상태(collapsed)를 반영해 보이는 행만 깊이와 함께 펼친다. */
function flattenVisibleRows(nodes: TrashNode[], collapsed: Set<string>): TrashRow[] {
  const rows: TrashRow[] = [];
  const walk = (list: TrashNode[], depth: number) => {
    for (const node of list) {
      const hasChildren = node.children.length > 0;
      rows.push({ node, depth, hasChildren });
      if (hasChildren && !collapsed.has(node.resourceId)) {
        walk(node.children, depth + 1);
      }
    }
  };
  walk(nodes, 0);
  return rows;
}

export function TrashPage() {
  // Hooks
  const { data, isLoading } = useTrash();
  const restore = useRestoreTrash();
  const purge = usePurgeTrash();

  // State
  const [purgeTarget, setPurgeTarget] = useState<TrashItem | null>(null);
  // 복원 위치를 골라야 하는 문서(상위 폴더도 휴지통이라 단독 복원 위치가 사라진 경우).
  const [restoreTarget, setRestoreTarget] = useState<TrashItem | null>(null);
  // 접힌 폴더 id 집합(기본값 비어있음 = 모두 펼침). 토글로 접었다 폈다 한다.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Variables
  const items = data ?? [];
  const tree = buildTrashTree(items);
  const rows = flattenVisibleRows(tree, collapsed);

  const toggleCollapse = (resourceId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) next.delete(resourceId);
      else next.add(resourceId);
      return next;
    });
  };

  // Functions
  const handleRestore = (item: TrashItem) => {
    // 문서인데 상위 폴더가 사라진(휴지통) 경우: 복원 위치를 선택받는다(이동 팝업 재사용).
    // trashedParentId 가 실제 값일 때만(구버전 서버의 필드 부재 시엔 기존대로 바로 복원).
    if (item.resourceType === 'DOCUMENT' && item.trashedParentId) {
      setRestoreTarget(item);
      return;
    }
    restore.mutate({
      resourceType: item.resourceType,
      resourceId: item.resourceId,
    });
  };

  // 복원 위치 선택 완료: 선택 폴더(루트면 null)로 복원.
  const handleRestoreToFolder = (destinationId: string | null) => {
    if (!restoreTarget) return;
    restore.mutate(
      {
        resourceType: restoreTarget.resourceType,
        resourceId: restoreTarget.resourceId,
        targetFolderId: destinationId,
      },
      { onSettled: () => setRestoreTarget(null) }
    );
  };

  const handlePurge = () => {
    if (!purgeTarget) return;
    purge.mutate(
      {
        resourceType: purgeTarget.resourceType,
        resourceId: purgeTarget.resourceId,
      },
      { onSettled: () => setPurgeTarget(null) }
    );
  };

  // Render
  return (
    <AppShell header={<PageHeader title="휴지통" />}>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <p className="mb-4 text-sm text-muted-foreground">
          삭제한 문서·폴더는 여기에 보관됩니다. 복원하거나 영구 삭제할 수 있습니다.
          (지운 본인과 워크스페이스 관리자만 볼 수 있어요.)
        </p>

        {isLoading ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            불러오는 중…
          </p>
        ) : items.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            휴지통이 비어 있습니다.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(({ node: item, depth, hasChildren }) => (
              <div
                key={`${item.resourceType}-${item.resourceId}`}
                className="flex items-center gap-3 py-3"
                style={{ paddingLeft: depth * 24 }}
              >
                {/* 왼쪽 드롭다운 토글 — 하위가 있는(비어있지 않은) 폴더만 표시, 그 외엔 정렬용 빈칸 */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleCollapse(item.resourceId)}
                    aria-label={collapsed.has(item.resourceId) ? '펼치기' : '접기'}
                    aria-expanded={!collapsed.has(item.resourceId)}
                    className="shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {collapsed.has(item.resourceId) ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                ) : (
                  <span aria-hidden className="size-4 shrink-0" />
                )}
                {item.resourceType === 'FOLDER' ? (
                  <Folder className="size-[18px] shrink-0 text-primary" />
                ) : (
                  <FileText className="size-[18px] shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.resourceType === 'FOLDER' ? '폴더' : '문서'} · 삭제됨{' '}
                    {formatDeleted(item.deletedAt)}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestore(item)}
                  disabled={restore.isPending}
                >
                  <RotateCcw />
                  복원
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPurgeTarget(item)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  영구 삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 문서 복원 위치 선택(상위 폴더가 휴지통일 때) — 이동 팝업 재사용 */}
      {restoreTarget && (
        <MoveDialog
          target={{
            kind: 'document',
            id: restoreTarget.resourceId,
            name: restoreTarget.name,
          }}
          open={restoreTarget !== null}
          onOpenChange={(o) => !o && setRestoreTarget(null)}
          onSelect={handleRestoreToFolder}
          title="복원할 위치 선택"
          description={`'${restoreTarget.name}'을(를) 복원할 폴더를 선택하세요. (상위 폴더가 삭제되어 위치를 지정해야 해요.)`}
        />
      )}

      {/* 영구 삭제 확인 */}
      <AlertDialog
        open={purgeTarget !== null}
        onOpenChange={(o) => !o && setPurgeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영구 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{purgeTarget?.name}&apos;
              {purgeTarget?.resourceType === 'FOLDER'
                ? ' 폴더와 그 안의 항목을'
                : ' 문서를'}{' '}
              영구 삭제합니다. 삭제된 항목은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={purge.isPending}
              onClick={(e) => {
                e.preventDefault();
                handlePurge();
              }}
            >
              영구 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
