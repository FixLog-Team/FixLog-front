import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';
import type {
  FolderPathItem,
  FolderTreeNode,
} from '@/domains/folders/types/folder';

/**
 * 최근 수정 폴더(홈 하단 표시용).
 * 서버에 "폴더 + 문서수 + updateTime"을 한 번에 주는 API가 없어, 기존 두 엔드포인트를 병합한다.
 *  - 트리(/api/folders/tree): 전체 폴더 구조 + documentCount (updateTime 없음)
 *  - 루트/폴더 콘텐츠(FolderItem): updateTime (documentCount 없음)
 * → folderId 로 합쳐 updateTime DESC 정렬 후 상위 limit 개 반환.
 */
export interface RecentFolder {
  folderId: string;
  folderName: string;
  documentCount: number;
  updateTime: string | null;
  /** 클릭 시 breadcrumb 복원을 위한 루트→대상 경로. */
  path: FolderPathItem[];
}

function flatten(
  nodes: FolderTreeNode[],
  acc: FolderTreeNode[] = []
): FolderTreeNode[] {
  for (const node of nodes) {
    acc.push(node);
    flatten(node.children, acc);
  }
  return acc;
}

async function fetchRecentFolders(limit: number): Promise<RecentFolder[]> {
  const tree = await foldersApi.getFolderTree();
  const flat = flatten(tree);
  const nameById = new Map(flat.map((n) => [n.folderId, n.folderName]));
  const parentById = new Map(flat.map((n) => [n.folderId, n.parentId]));

  // updateTime 수집: 루트 폴더 + 자식이 있는 폴더의 콘텐츠(자식 FolderItem 에 updateTime 포함).
  const timeById = new Map<string, string | null>();
  const root = await foldersApi.getRootContents();
  root.folders.forEach((f) => timeById.set(f.folderId, f.updateTime));
  const parents = flat.filter((n) => n.children.length > 0);
  await Promise.all(
    parents.map(async (parent) => {
      const contents = await foldersApi.getFolderContents(parent.folderId);
      contents.folders.forEach((f) => timeById.set(f.folderId, f.updateTime));
    })
  );

  const buildPath = (folderId: string): FolderPathItem[] => {
    const path: FolderPathItem[] = [];
    let current: string | null | undefined = folderId;
    while (current) {
      const folderName = nameById.get(current);
      if (!folderName) break;
      path.unshift({ folderId: current, folderName });
      current = parentById.get(current) ?? null;
    }
    return path;
  };

  return flat
    .map((n) => ({
      folderId: n.folderId,
      folderName: n.folderName,
      documentCount: n.documentCount,
      updateTime: timeById.get(n.folderId) ?? null,
      path: buildPath(n.folderId),
    }))
    .sort((a, b) => {
      const ta = a.updateTime ? Date.parse(a.updateTime) : 0;
      const tb = b.updateTime ? Date.parse(b.updateTime) : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

export function useRecentFolders(limit = 6) {
  return useQuery({
    queryKey: [...QUERY_KEYS.folders.all, 'recent', limit],
    queryFn: () => fetchRecentFolders(limit),
  });
}
