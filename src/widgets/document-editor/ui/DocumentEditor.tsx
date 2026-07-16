import { forwardRef, useImperativeHandle } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import type { Block, PartialBlock } from '@blocknote/core';

export interface DocumentEditorHandle {
  /** 현재 에디터 본문 블록. 저장/AI요약 시 페이지가 읽어간다. */
  getBlocks: () => Block[];
}

interface DocumentEditorProps {
  /** 서버 blocks(JSON 문자열)를 파싱한 BlockNote 블록 배열. 빈 문서면 undefined. */
  initialBlocks?: PartialBlock[];
}

/**
 * BlockNote 기반 문서 본문 에디터.
 * 헤더/저장/AI요약 등 컨트롤은 페이지(DocumentEditorPage)가 소유하며,
 * 이 위젯은 본문 렌더링과 현재 블록 노출(getBlocks)만 담당한다.
 * (initialContent 는 마운트 시 1회만 반영 → 페이지가 로딩 완료 후 key={documentId} 로 마운트)
 */
export const DocumentEditor = forwardRef<
  DocumentEditorHandle,
  DocumentEditorProps
>(function DocumentEditor({ initialBlocks }, ref) {
  const editor = useCreateBlockNote({ initialContent: initialBlocks });

  useImperativeHandle(ref, () => ({ getBlocks: () => editor.document }), [
    editor,
  ]);

  return (
    <div className="h-full overflow-y-auto bg-card [&_.bn-editor]:mx-auto [&_.bn-editor]:max-w-4xl [&_.bn-editor]:px-24 [&_.bn-editor]:py-12">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
});
