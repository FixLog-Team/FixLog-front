import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 전체 폴더 트리 조회(이동 대상 선택 등). */
export function useFolderTree() {
  return useQuery({
    queryKey: [...QUERY_KEYS.folders.all, 'tree'],
    queryFn: foldersApi.getFolderTree,
  });
}
