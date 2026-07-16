import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '@/domains/documents/api/documents.api';

interface DownloadVars {
  documentId: string;
  /** 저장 파일명(확장자 제외). 미지정 시 documentId 사용. */
  title?: string;
}

/** 문서 PDF 다운로드 후 브라우저 저장(a[download] 트리거). */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({ documentId, title }: DownloadVars) => {
      const blob = await documentsApi.downloadPdf(documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title ?? documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}
