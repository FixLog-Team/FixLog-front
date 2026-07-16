import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

interface MoveFolderVars {
  folderId: string;
  /** 대상 부모 폴더. 루트로 이동 시 null. */
  parentId: string | null;
}

/** 폴더 이동. */
export function useMoveFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, parentId }: MoveFolderVars) =>
      foldersApi.moveFolder(folderId, { parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
