import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { foldersApi } from '@/domains/folders';
import type { FolderItem, FolderPathItem } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';
import { useCreateDocument } from '@/features/documents/create-document/hooks/use-create-document';
import { useCreateFolder } from '@/features/folders/create-folder/hooks/use-create-folder';
import { documentDetailPath } from '@/shared/constants/routes';

export function DocumentListPage() {
  // Hooks
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const createFolder = useCreateFolder();

  // State
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<FolderPathItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Variables
  const currentFolderId =
    breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].folderId : null;

  // Functions
  const loadContents = useCallback(async (folderId: string | null) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  const handleFolderClick = (folder: FolderItem) => {
    if (currentFolderId === folder.folderId) return;
    setBreadcrumb((prev) => [
      ...prev,
      { folderId: folder.folderId, folderName: folder.folderName },
    ]);
    loadContents(folder.folderId);
  };

  const handleDocumentClick = (document: DocumentDto) => {
    navigate(documentDetailPath(document.documentId));
  };

  const handleBreadcrumbClick = (index: number) => {
    // index 0 = "My Documents" (root)
    if (index === 0) {
      setBreadcrumb([]);
      loadContents(null);
      return;
    }
    const next = breadcrumb.slice(0, index);
    setBreadcrumb(next);
    loadContents(next[next.length - 1].folderId);
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

  // Effects
  useEffect(() => {
    loadContents(null);
  }, [loadContents]);

  // Variables (render)
  const crumbs = [
    { label: 'My Documents', onClick: () => handleBreadcrumbClick(0) },
    ...breadcrumb.map((item, index) => ({
      label: item.folderName,
      onClick: () => handleBreadcrumbClick(index + 1),
    })),
  ];

  // Render
  return (
    <AppShell
      header={
        <DocumentHeader
          mode="list"
          breadcrumb={crumbs}
          onCreateFolder={handleCreateFolder}
          onCreateDocument={handleCreateDocument}
        />
      }
    >
      <DocumentListSection
        folders={folders}
        documents={documents}
        isLoading={isLoading}
        onFolderClick={handleFolderClick}
        onDocumentClick={handleDocumentClick}
      />
    </AppShell>
  );
}
