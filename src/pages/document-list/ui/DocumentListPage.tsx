import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import type { FolderPathItem } from '@/domains/folders';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { fetchRootFolders, fetchFolderContents } from '@/domains/folders';
import type { FolderItem, DocumentItem } from '@/domains/folders';
import { documentDetailPath } from '@/shared/constants/routes';

type BreadcrumbItem = FolderPathItem;

// TODO: 실제 workspaceId는 인증/사용자 정보에서 가져와야 함
const WORKSPACE_ID = 'WS_TEST';

export function DocumentListPage() {
  // State
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

  // Hooks
  const navigate = useNavigate();

  // Variables
  const currentFolderId =
    breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].folderId : null;

  // Functions
  const loadContents = useCallback(async (folderId: string | null) => {
    try {
      const result = folderId
        ? await fetchFolderContents(folderId, WORKSPACE_ID)
        : await fetchRootFolders(WORKSPACE_ID);
      setFolders(result.folders);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Failed to load contents:', error);
      setFolders([]);
      setDocuments([]);
    }
  }, []);

  const handleFolderClick = (folder: FolderItem, path?: FolderPathItem[]) => {
    if (currentFolderId === folder.folderId) return;
    if (path) {
      setBreadcrumb(path);
    } else {
      setBreadcrumb((prev) => [
        ...prev,
        { folderId: folder.folderId, folderName: folder.folderName },
      ]);
    }
    loadContents(folder.folderId);
  };

  const handleDocumentClick = (document: DocumentItem) => {
    navigate(documentDetailPath(document.documentId));
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setBreadcrumb([]);
      loadContents(null);
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index);
      setBreadcrumb(newBreadcrumb);
      loadContents(newBreadcrumb[newBreadcrumb.length - 1].folderId);
    }
  };

  const handleCreateDocument = () => {
    console.log('Create document clicked');
  };

  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  // Effects
  useEffect(() => {
    loadContents(null);
  }, [loadContents]);

  // Render
  return (
    <AppShell header={<DocumentHeader onSearch={handleSearch} />}>
      <DocumentListSection
        folders={folders}
        documents={documents}
        breadcrumb={breadcrumb}
        onFolderClick={handleFolderClick}
        onDocumentClick={handleDocumentClick}
        onBreadcrumbClick={handleBreadcrumbClick}
        onCreateFolder={handleCreateFolder}
        onCreateDocument={handleCreateDocument}
      />
    </AppShell>
  );
}
