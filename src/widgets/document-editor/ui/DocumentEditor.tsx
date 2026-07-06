import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

interface DocumentEditorProps {
  // 향후 추가 예정: documentId?: string, initialContent?: Block[], onChange?: (blocks: Block[]) => void
}

export function DocumentEditor(_props: DocumentEditorProps) {
  const editor = useCreateBlockNote();
  return (
    <div className="h-full overflow-y-auto bg-white [&_.bn-editor]:max-w-4xl [&_.bn-editor]:mx-auto [&_.bn-editor]:px-24 [&_.bn-editor]:py-16">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
