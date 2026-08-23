import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
    // 현재 폴더 경로를 함께 넘겨 에디터 breadcrumb 가 진입 경로를 유지하도록 한다.
    navigate(documentDetailPath(document.documentId), {
      state: { folderPath: breadcrumb },
    });
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

  const promptAndCreateFolder = async (parentId: string | null) => {
    const folderName = window.prompt('폴더 이름을 입력하세요', 'New Folder');
    if (!folderName) return;
    try {
      await createFolder.mutateAsync({ parentId, folderName });
      loadContents(parentId);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  // 헤더의 New Folder 버튼: 현재 폴더에 생성(이벤트 인자를 받아도 무시).
  const handleCreateFolder = () => promptAndCreateFolder(currentFolderId);

  // Effects
  useEffect(() => {
    // location.key: 새 내비게이션마다 재실행(사이드바에서 /documents 로 재진입하는 경우 포함).
    // 에디터 breadcrumb·사이드바 폴더 클릭 등에서 넘어온 폴더 경로가 있으면 그 폴더로 복원한다.
    const incoming = (
      location.state as { folderPath?: FolderPathItem[] } | null
    )?.folderPath;
    if (incoming && incoming.length > 0) {
      setBreadcrumb(incoming);
      loadContents(incoming[incoming.length - 1].folderId);
    } else {
      setBreadcrumb([]);
      loadContents(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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
        onChanged={() => loadContents(currentFolderId)}
      />
    </AppShell>
  );
}
