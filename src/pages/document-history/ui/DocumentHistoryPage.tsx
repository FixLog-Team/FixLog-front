import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import {
  DocumentHistoryPanel,
  type DocumentVersion,
} from '@/widgets/document-history-panel';
import { documentDetailPath } from '@/shared/constants/routes';
import {
  DEMO_DOCUMENTS,
  findDemoDocument,
} from '@/domains/documents/lib/mock-data/demo-documents';

const DEMO_VERSIONS: DocumentVersion[] = [
  {
    id: 'v5',
    timestampLabel: 'Today, 2:14 PM',
    author: 'Sofia Rossi',
    summary: 'Added the production deployment checklist section.',
    isCurrent: true,
  },
  {
    id: 'v4',
    timestampLabel: 'Yesterday, 4:30 PM',
    author: 'Maria Chen',
    summary: 'Revised the QA window timing and cherry-pick rules.',
  },
  {
    id: 'v3',
    timestampLabel: 'Mar 9, 2026',
    author: 'Liam Park',
    summary: 'Reorganized the checklist into grouped sections.',
  },
  {
    id: 'v2',
    timestampLabel: 'Mar 6, 2026',
    author: 'Sofia Rossi',
    summary: 'Expanded the overview and added context callout.',
  },
  {
    id: 'v1',
    timestampLabel: 'Mar 4, 2026',
    author: 'Sofia Rossi',
    summary: 'Initial draft created.',
  },
];

export function DocumentHistoryPage() {
  // Hooks
  const { documentId } = useParams<{ documentId: string }>();

  // Variables
  const doc =
    (documentId && findDemoDocument(documentId)) || DEMO_DOCUMENTS[0];

  // Functions
  const handleRestore = (versionId: string) => {
    console.log('Restore version:', versionId);
  };

  // Render
  return (
    <AppShell header={<PageHeader title="Version history" />}>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to={documentDetailPath(doc.id)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to document
        </Link>

        <h1 className="text-2xl font-semibold text-foreground">{doc.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All saved versions, newest first. Restore any version to make it the
          current document.
        </p>

        <div className="mt-6">
          <DocumentHistoryPanel
            versions={DEMO_VERSIONS}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </AppShell>
  );
}
