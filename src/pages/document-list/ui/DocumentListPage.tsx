import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
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
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Hooks
  const navigate = useNavigate();

  const currentFolderId = breadcrumb.length > 0
    ? breadcrumb[breadcrumb.length - 1].folderId
    : null;

  const loadContents = useCallback(async (folderId: string | null) => {
    try {
      setIsNavigating(true);
      const result = folderId
        ? await fetchFolderContents(folderId, WORKSPACE_ID)
        : await fetchRootFolders(WORKSPACE_ID);
      setFolders(result.folders);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Failed to load contents:', error);
      setFolders([]);
      setDocuments([]);
    } finally {
      setIsNavigating(false);
      setIsInitialLoad(false);
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
    setSelectedDocumentId(document.documentId);
    navigate(documentDetailPath(document.documentId));
  };

  const handleBreadcrumbClick = (index: number) => {
    // index 0 = "My Documents" (root)
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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        currentFolderId={currentFolderId}
        selectedDocumentId={selectedDocumentId}
        workspaceId={WORKSPACE_ID}
        onFolderClick={handleFolderClick}
        onDocumentClick={handleDocumentClick}
        onCreateDocument={handleCreateDocument}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Progress Bar */}
        {isNavigating && (
          <div className="h-0.5 bg-gray-100 overflow-hidden">
            <div className="h-full bg-blue-500 animate-progress" />
          </div>
        )}

        {/* Header */}
        <DocumentHeader onSearch={handleSearch} />

        {/* Document List */}
        {isInitialLoad ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : (
          <div className={`flex-1 overflow-hidden transition-opacity duration-150 ${isNavigating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
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
          </div>
        )}
      </div>
    </div>
  );
}
