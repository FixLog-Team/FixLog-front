import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import type { PartialBlock } from '@blocknote/core';
import { useSaveDocument } from '@/features/documents/save-document/hooks/use-save-document';
import { useSummarizeDocument } from '@/features/ai/summarize-document/hooks/use-summarize-document';
import { AiSummaryPanel } from '@/widgets/ai-summary-panel';
import { blocksToPlainText } from '@/shared/lib/editor/blocks-to-plain-text';
import { ROUTES } from '@/shared/constants/routes';

interface DocumentEditorProps {
  documentId: string;
  initialTitle: string;
  /** 서버 blocks(JSON 문자열)를 파싱한 BlockNote 블록 배열. 빈 문서면 undefined. */
  initialBlocks?: PartialBlock[];
}

/**
 * BlockNote 기반 문서 에디터 + 저장.
 * 저장은 제목 + 본문(editor.document)을 PUT /api/documents/{id} 로 전송한다.
 * (안드로이드 EditorActivity.persistCurrent 의 웹 대응)
 */
export function DocumentEditor({ documentId, initialTitle, initialBlocks }: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const navigate = useNavigate();

  // initialContent 는 마운트 시 1회만 반영된다(페이지가 로딩 완료 후 이 위젯을 마운트).
  const editor = useCreateBlockNote({ initialContent: initialBlocks });
  const save = useSaveDocument(documentId);
  const summarize = useSummarizeDocument();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleSave = () => {
    save.mutate(
      { title: title.trim() || 'Untitled', blocks: editor.document },
      {
        onError: (error) => {
          console.error('Failed to save document:', error);
          alert('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
  };

  /**
   * AI 요약: 에디터 본문을 평문으로 추출해 POST /ai/summarize 로 직접 요약한다.
   * (서버 plainText 추출에 의존하지 않으므로 BlockNote 본문도 그대로 요약된다)
   * 최신 본문은 저장(영속화)도 함께 수행한다.
   */
  const handleSummarize = async () => {
    setSummaryOpen(true);
    summarize.reset();
    try {
      await save.mutateAsync({ title: title.trim() || 'Untitled', blocks: editor.document });
      await summarize.mutateAsync(blocksToPlainText(editor.document));
    } catch (error) {
      console.error('AI summarize failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 상단 바: 뒤로 / 제목 / 저장 */}
      <header className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="flex-shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to documents"
        >
          <ArrowLeft size={20} />
        </button>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="flex-1 min-w-0 text-lg font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
        />

        {save.isSuccess && !save.isPending && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check size={16} /> 저장됨
          </span>
        )}
        <button
          onClick={handleSummarize}
          disabled={save.isPending || summarize.isPending}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Sparkles size={16} className="text-blue-600" />
          <span>AI 요약</span>
        </button>
        <button
          onClick={handleSave}
          disabled={save.isPending}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {save.isPending ? '저장 중…' : '저장'}
        </button>
      </header>

      {/* 본문 에디터 */}
      <div className="flex-1 overflow-y-auto bg-white [&_.bn-editor]:max-w-4xl [&_.bn-editor]:mx-auto [&_.bn-editor]:px-24 [&_.bn-editor]:py-16">
        <BlockNoteView editor={editor} theme="light" />
      </div>

      {/* AI 요약 결과 모달 */}
      <AiSummaryPanel
        open={summaryOpen}
        isLoading={save.isPending || summarize.isPending}
        summary={summarize.data}
        isError={summarize.isError}
        onClose={() => setSummaryOpen(false)}
      />
    </div>
  );
}
