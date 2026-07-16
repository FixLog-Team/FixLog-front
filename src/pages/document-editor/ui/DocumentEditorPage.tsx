import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PartialBlock } from '@blocknote/core';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import {
  DocumentEditor,
  type DocumentEditorHandle,
} from '@/widgets/document-editor';
import { AiSummaryPanel } from '@/widgets/ai-summary-panel';
import { Avatar } from '@/shared/ui/avatar';
import { useDocument } from '@/domains/documents';
import { useSaveDocument } from '@/features/documents/save-document/hooks/use-save-document';
import { useSummarizeDocument } from '@/features/ai/summarize-document/hooks/use-summarize-document';
import { blocksToPlainText } from '@/shared/lib/editor/blocks-to-plain-text';

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

function formatUpdated(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DocumentEditorPage() {
  // Hooks
  const { documentId } = useParams<{ documentId: string }>();
  const editorRef = useRef<DocumentEditorHandle>(null);
  const { data, isLoading, isError } = useDocument(documentId);
  const save = useSaveDocument(documentId ?? '');
  const summarize = useSummarizeDocument();

  // State
  const [isFavorite, setIsFavorite] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Functions
  const handleSave = () => {
    const blocks = editorRef.current?.getBlocks();
    if (!blocks || !data) return;
    save.mutate(
      { title: data.title, blocks },
      {
        onError: (error) => {
          console.error('Failed to save document:', error);
          alert('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
  };

  const handleSummarize = async () => {
    const blocks = editorRef.current?.getBlocks();
    if (!blocks || !data) return;
    setSummaryOpen(true);
    summarize.reset();
    try {
      await save.mutateAsync({ title: data.title, blocks });
      await summarize.mutateAsync(blocksToPlainText(blocks));
    } catch (error) {
      console.error('AI summarize failed:', error);
    }
  };

  // Render
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading document…</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !data || !documentId) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">문서를 불러오지 못했습니다.</p>
        </div>
      </AppShell>
    );
  }

  const owner = data.updateUser ?? data.createUser ?? 'Unknown';
  const breadcrumb = [{ label: 'My Documents' }, { label: data.title }];

  return (
    <AppShell
      scroll={false}
      header={
        <DocumentHeader
          mode="detail"
          breadcrumb={breadcrumb}
          isFavorite={isFavorite}
          isSaving={save.isPending}
          isSaved={save.isSuccess}
          onToggleFavorite={() => setIsFavorite((v) => !v)}
          onSave={handleSave}
          onSummarize={handleSummarize}
        />
      }
    >
      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Title + meta */}
        <div className="mx-auto w-full max-w-4xl px-24 pt-12">
          <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.022em] text-foreground">
            {data.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Avatar name={owner} size="sm" />
              <span className="text-foreground">{owner}</span>
            </span>
            {data.updateTime && <span>Updated {formatUpdated(data.updateTime)}</span>}
          </div>
        </div>

        {/* Writing area — BlockNote */}
        <div className="min-h-0 flex-1">
          <DocumentEditor
            key={documentId}
            ref={editorRef}
            initialBlocks={parseBlocks(data.blocks)}
          />
        </div>
      </div>

      {/* AI summary panel */}
      <AiSummaryPanel
        open={summaryOpen}
        isLoading={save.isPending || summarize.isPending}
        summary={summarize.data}
        isError={summarize.isError}
        onClose={() => setSummaryOpen(false)}
      />
    </AppShell>
  );
}
