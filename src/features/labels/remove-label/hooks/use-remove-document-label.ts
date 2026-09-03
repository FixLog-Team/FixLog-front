import { useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/domains/labels';

/**
 * 문서에서 라벨 제거. 성공 시 해당 문서의 라벨 조회를 무효화해 표시를 갱신한다.
 */
export function useRemoveDocumentLabel(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      labelsApi.removeFromDocument(documentId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['labels', 'document', documentId],
      });
    },
  });
}
