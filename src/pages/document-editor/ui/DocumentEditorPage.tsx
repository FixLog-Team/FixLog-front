import { useParams, useNavigate } from 'react-router-dom';
import type { PartialBlock } from '@blocknote/core';
import { DocumentEditor } from '@/widgets/document-editor';
import { useDocument } from '@/domains/documents';
import { ROUTES } from '@/shared/constants/routes';

/** 서버 blocks(JSON 문자열) → BlockNote 블록 배열. 빈/오류면 undefined(빈 문서). */
function parseBlocks(blocks: string | null): PartialBlock[] | undefined {
  if (!blocks) return undefined;
  try {
    const parsed = JSON.parse(blocks);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as PartialBlock[];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function DocumentEditorPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDocument(documentId);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (isError || !data || !documentId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">문서를 불러오지 못했습니다.</p>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* key={documentId}: 문서가 바뀌면 에디터를 새 initialContent 로 재마운트 */}
      <DocumentEditor
        key={documentId}
        documentId={documentId}
        initialTitle={data.title}
        initialBlocks={parseBlocks(data.blocks)}
      />
    </div>
  );
}
