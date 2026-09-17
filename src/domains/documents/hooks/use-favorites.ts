import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';
import { QUERY_KEYS } from '@/app/config/query-keys';

/** 즐겨찾기한 문서 목록. enabled 로 필요할 때만 조회. */
export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.favorites,
    queryFn: () => documentsApi.listFavorites(),
    enabled,
  });
}

/** 즐겨찾기 토글. favorite=true 면 추가, false 면 해제. 성공 시 관련 목록 갱신. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, favorite }: { documentId: string; favorite: boolean }) =>
      favorite
        ? documentsApi.addFavorite(documentId)
        : documentsApi.removeFavorite(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.favorites });
    },
  });
}
