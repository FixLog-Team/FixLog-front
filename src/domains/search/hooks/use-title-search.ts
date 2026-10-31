import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/domains/search/api/search.api';
import type { TitleSearchParams } from '@/domains/search/types/search';

/**
 * 제목 검색(폴더명 + 문서 제목). 키워드가 있을 때만 호출한다.
 * 호출 측에서 디바운스한 키워드를 넘기는 것을 전제로 한다.
 */
export function useTitleSearch({ q, folderId }: TitleSearchParams) {
  const keyword = q?.trim() ?? '';
  return useQuery({
    queryKey: ['search', 'title', keyword, folderId ?? null],
    queryFn: () => searchApi.searchTitle({ q: keyword, folderId }),
    enabled: keyword.length > 0,
    staleTime: 30_000,
  });
}
