import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { documentDetailPath } from '@/shared/constants/routes';
import { CURRENT_WORKSPACE } from '@/domains/user/lib/mock-data/current-user';
import { DEMO_FOLDERS } from '@/domains/folders/lib/mock-data/folders';
import type { DemoFolder } from '@/domains/folders/lib/mock-data/folders';
import { DEMO_DOCUMENTS } from '@/domains/documents/lib/mock-data/demo-documents';
import type { DemoDocument } from '@/domains/documents/lib/mock-data/demo-documents';

export function DocumentListPage() {
  // Hooks
  const navigate = useNavigate();

  // Functions
  const handleFolderClick = (_folder: DemoFolder) => {
    // TODO: 폴더 진입 (백엔드 연동 시)
  };

  const handleDocumentClick = (document: DemoDocument) => {
    navigate(documentDetailPath(document.id));
  };

  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  };

  const handleCreateDocument = () => {
    console.log('Create document clicked');
  };

  // Render
  return (
    <AppShell
      header={
        <DocumentHeader
          mode="list"
          breadcrumb={[{ label: CURRENT_WORKSPACE.name }, { label: 'Documents' }]}
          onCreateFolder={handleCreateFolder}
          onCreateDocument={handleCreateDocument}
        />
      }
    >
      <DocumentListSection
        folders={DEMO_FOLDERS}
        documents={DEMO_DOCUMENTS}
        onFolderClick={handleFolderClick}
        onDocumentClick={handleDocumentClick}
      />
    </AppShell>
  );
}
