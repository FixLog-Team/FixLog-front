import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentEditor } from '@/widgets/document-editor';
import { AiSummaryPanel, type AiSummaryContent } from '@/widgets/ai-summary-panel';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { CURRENT_WORKSPACE } from '@/domains/user/lib/mock-data/current-user';
import {
  DEMO_DOCUMENTS,
  findDemoDocument,
  STATUS_LABEL,
} from '@/domains/documents/lib/mock-data/demo-documents';

export function DocumentEditorPage() {
  // Hooks
  const { documentId } = useParams<{ documentId: string }>();

  // State
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Variables
  const doc =
    (documentId && findDemoDocument(documentId)) || DEMO_DOCUMENTS[0];
  const breadcrumb = [
    { label: CURRENT_WORKSPACE.name },
    ...doc.folderPath.split(' / ').map((label) => ({ label })),
    { label: doc.title },
  ];
  const aiContent = buildAiContent(doc);

  // Render
  return (
    <AppShell
      scroll={false}
      header={
        <DocumentHeader
          mode="detail"
          breadcrumb={breadcrumb}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((v) => !v)}
          onSummarize={() => setIsPanelOpen((v) => !v)}
        />
      }
    >
      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Title + meta */}
        <div className="mx-auto w-full max-w-4xl px-24 pt-12">
          <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.022em] text-foreground">
            {doc.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Avatar name={doc.owner} size="sm" />
              <span className="text-foreground">{doc.owner}</span>
            </span>
            <span>Updated {doc.updatedLabel}</span>
            <span>{doc.folderPath}</span>
            <Badge variant={doc.status}>{STATUS_LABEL[doc.status]}</Badge>
          </div>
        </div>

        {/* Writing area — BlockNote (현재 구현 유지) */}
        <div className="min-h-0 flex-1">
          <DocumentEditor />
        </div>
      </div>

      {/* AI summary panel */}
      {isPanelOpen && (
        <AiSummaryPanel
          content={aiContent}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </AppShell>
  );
}

function buildAiContent(doc: {
  id: string;
  description: string;
}): AiSummaryContent {
  return {
    summary: doc.description,
    keyDecisions: [
      'Primary approach and rationale are captured up front.',
      'Edge cases and their handling are called out explicitly.',
      'Follow-up owners are assigned for each open item.',
    ],
    actionItems: [
      'Confirm the proposed approach',
      'Share with the owning team',
      'Schedule a follow-up review',
    ],
    relatedDocuments: DEMO_DOCUMENTS.filter((d) => d.id !== doc.id)
      .slice(0, 2)
      .map((d) => ({ id: d.id, title: d.title })),
  };
}
