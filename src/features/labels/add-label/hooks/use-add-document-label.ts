import { useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/domains/labels';

/**
 * 문서에 태그 추가(없는 이름이면 서버가 생성). 성공 시 해당 문서의 태그 조회를 무효화해
 * 목록·상세의 태그 표시가 갱신되도록 한다.
 */
export function useAddDocumentLabel(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelName: string) =>
      labelsApi.addToDocument(documentId, { labelName }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['labels', 'document', documentId],
      });
    },
  });
}
