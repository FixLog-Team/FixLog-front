import { useMemo } from 'react';
import { Folder, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { useFolderTree } from '@/domains/folders';
import type { FolderTreeNode } from '@/domains/folders';
import { cn } from '@/shared/lib/utils/index';
import type { ActionTarget } from '@/widgets/item-actions/ui/types';

interface MoveDialogProps {
  target: ActionTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 대상 위치 선택. 루트로 이동 시 null. */
  onSelect: (destinationId: string | null) => void;
  /** 제목/설명 override(선택). 휴지통 복원 등 "이동"이 아닌 맥락에서 문구를 바꾼다. */
  title?: string;
  description?: string;
  /**
   * 이동 대상에서 제외할 폴더 id 들(각각 하위 폴더까지 제외).
   * 일괄 이동처럼 폴더가 함께 선택된 경우, 선택한 폴더를 자기 자신·자기 하위로
   * 옮기는 선택지를 아예 보여주지 않기 위해 쓴다.
   */
  excludeFolderIds?: string[];
}

interface FlatFolder {
  id: string;
  label: string;
  depth: number;
}

/** 폴더 target 의 서브트리(자기 자신 포함) 모든 folderId 수집 — 순환 이동 방지용. */
function collectSubtreeIds(nodes: FolderTreeNode[], targetId: string): Set<string> {
  const subtreeIds = (node: FolderTreeNode): string[] => [
    node.folderId,
    ...node.children.flatMap(subtreeIds),
  ];
  const find = (list: FolderTreeNode[]): FolderTreeNode | null => {
    for (const n of list) {
      if (n.folderId === targetId) return n;
      const found = find(n.children);
      if (found) return found;
    }
    return null;
  };
  const node = find(nodes);
  return new Set(node ? subtreeIds(node) : [targetId]);
}

/** 여러 폴더의 서브트리(자기 자신 포함)를 한 번에 모은다 — 일괄 이동에서 선택 폴더 제외용. */
function collectSubtreeIdsOfAll(
  nodes: FolderTreeNode[],
  targetIds: string[]
): Set<string> {
  const excluded = new Set<string>();
  for (const id of targetIds) {
    for (const subtreeId of collectSubtreeIds(nodes, id)) excluded.add(subtreeId);
  }
  return excluded;
}

/** 트리를 들여쓰기 라벨과 함께 평탄화. excluded 에 속한 노드는 자신·하위 모두 건너뛴다. */
function flatten(
  nodes: FolderTreeNode[],
  depth: number,
  excluded: Set<string>,
  out: FlatFolder[]
): void {
  for (const node of nodes) {
    if (excluded.has(node.folderId)) continue;
    out.push({ id: node.folderId, label: node.folderName, depth });
    flatten(node.children, depth + 1, excluded, out);
  }
}

/**
 * 이동 대상 폴더 선택 다이얼로그. 전체 폴더 트리를 평탄화해 목록으로 보여준다.
 * 안드로이드 MainActivity.showMovePicker 와 동일한 규칙(루트 항목 + 폴더는 자기·하위 제외).
 */
export function MoveDialog({
  target,
  open,
  onOpenChange,
  onSelect,
  title,
  description,
  excludeFolderIds,
}: MoveDialogProps) {
  const { data: tree, isLoading } = useFolderTree();
  // 배열 identity 로 useMemo 가 매 렌더 재계산되지 않도록 키로 고정한다.
  const excludeKey = (excludeFolderIds ?? []).join(',');

  const folders = useMemo(() => {
    if (!tree) return [];
    // 이동 대상 폴더 자신(+하위)과, 함께 선택된 폴더들(+하위)을 목록에서 뺀다.
    const excludeIds = [
      ...(target.kind === 'folder' ? [target.id] : []),
      ...(excludeKey ? excludeKey.split(',') : []),
    ];
    const excluded = collectSubtreeIdsOfAll(tree, excludeIds);
    const out: FlatFolder[] = [];
    flatten(tree, 0, excluded, out);
    return out;
  }, [tree, target, excludeKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title ?? '이동할 위치 선택'}</DialogTitle>
          <DialogDescription>
            {description ?? `'${target.name}'을(를) 옮길 폴더를 선택하세요.`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
          {/* 루트 */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Home className="size-4 shrink-0 text-muted-foreground" />
            루트(최상위)
          </button>

          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">불러오는 중…</p>
          ) : folders.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              이동할 수 있는 폴더가 없습니다.
            </p>
          ) : (
            folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelect(f.id)}
                className={cn(
                  'flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors last:border-b-0 hover:bg-muted'
                )}
                style={{ paddingLeft: `${12 + f.depth * 16}px` }}
              >
                <Folder className="size-4 shrink-0 text-primary" />
                <span className="truncate">{f.label}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
