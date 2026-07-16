import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

interface RenameFolderVars {
  folderId: string;
  folderName: string;
  /** 서버 FolderRequest 계약상 함께 보내는 현재 parentId(루트면 null). */
  parentId: string | null;
}

/** 폴더 이름 변경. */
export function useRenameFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, folderName, parentId }: RenameFolderVars) =>
      foldersApi.updateFolder(folderId, { folderName, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
    },
  });
}
