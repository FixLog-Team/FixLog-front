import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/domains/folders/api/folders.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/**
 * 루트 폴더/문서 조회(사이드바 최상위).
 * react-query 기반이라 폴더/문서 생성 mutation 의 folders.all invalidate 로 자동 갱신된다.
 */
export function useRootFolders(enabled: boolean) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.folders.all, 'root'],
    queryFn: () => foldersApi.getRootContents(),
    enabled,
  });

  return {
    folders: query.data?.folders ?? [],
    documents: query.data?.documents ?? [],
    isLoaded: query.isSuccess,
    refresh: query.refetch,
  };
}
