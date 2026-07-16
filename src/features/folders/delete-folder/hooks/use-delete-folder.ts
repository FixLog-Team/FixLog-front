import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 폴더 삭제(하위 폴더/문서 함께 삭제). */
export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => foldersApi.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    },
  });
}
