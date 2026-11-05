import type { FolderTreeNode } from '@/domains/folders';

/**
 * 공유받은 항목으로 내려가는 경로상의 폴더 id 를 모은다.
 *
 * 문서만 공유하고 상위 폴더는 공유하지 않은 경우, 상위 폴더가 목록에서 가려지면
 * 그 안의 공유 문서에 닿을 길이 사라진다. 경로 폴더는 "길"로만 열어주고,
 * 그 안에서 실제로 보여줄 항목은 호출 측에서 공유 여부로 다시 거른다.
 *
 * @param targetFolderIds 공유받은 폴더 id + 공유받은 문서가 들어 있는 폴더 id
 */
export function collectSharedPathFolderIds(
  tree: FolderTreeNode[] | undefined,
  targetFolderIds: Set<string>,
): Set<string> {
  const result = new Set<string>();
  if (!tree || targetFolderIds.size === 0) return result;

  const walk = (node: FolderTreeNode, ancestors: string[]) => {
    const path = [...ancestors, node.folderId];
    if (targetFolderIds.has(node.folderId)) {
      for (const id of path) result.add(id);
    }
    for (const child of node.children) walk(child, path);
  };
  for (const node of tree) walk(node, []);

  return result;
}
