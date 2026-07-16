import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { foldersApi } from '@/domains/folders';
import type { FolderItem, FolderPathItem } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';
import { useCreateDocument } from '@/features/documents/create-document/hooks/use-create-document';
import { useCreateFolder } from '@/features/folders/create-folder/hooks/use-create-folder';
import { documentDetailPath } from '@/shared/constants/routes';

type BreadcrumbItem = FolderPathItem;

export function DocumentListPage() {
  // State
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const createFolder = useCreateFolder();

  const currentFolderId = breadcrumb.length > 0
    ? breadcrumb[breadcrumb.length - 1].folderId
    : null;

  const loadContents = useCallback(async (folderId: string | null) => {
    try {
      setIsNavigating(true);
      const result = folderId
        ? await foldersApi.getFolderContents(folderId)
        : await foldersApi.getRootContents();
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

  const handleDocumentClick = (document: DocumentDto) => {
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

  const handleCreateDocument = async () => {
    try {
      const created = await createDocument.mutateAsync({
        folderId: currentFolderId,
        title: 'Untitled',
      });
      navigate(documentDetailPath(created.documentId));
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = window.prompt('폴더 이름을 입력하세요', 'New Folder');
    if (!folderName) return;
    try {
      await createFolder.mutateAsync({ parentId: currentFolderId, folderName });
      loadContents(currentFolderId);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
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
