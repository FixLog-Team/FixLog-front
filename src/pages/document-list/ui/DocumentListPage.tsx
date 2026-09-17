import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { foldersApi, useFolderTree } from '@/domains/folders';
import type { FolderItem, FolderPathItem, FolderTreeNode } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';
import { useCreateDocument } from '@/features/documents/create-document/hooks/use-create-document';
import { CreateFolderDialog } from '@/features/folders/create-folder/ui/CreateFolderDialog';
import { documentDetailPath } from '@/shared/constants/routes';

/** 폴더 트리에서 targetId 까지의 경로(루트→대상)를 찾는다. 없으면 null. */
function findFolderPath(
  nodes: FolderTreeNode[],
  targetId: string,
): FolderPathItem[] | null {
  for (const node of nodes) {
    const self: FolderPathItem = {
      folderId: node.folderId,
      folderName: node.folderName,
    };
    if (node.folderId === targetId) return [self];
    const childPath = findFolderPath(node.children, targetId);
    if (childPath) return [self, ...childPath];
  }
  return null;
}

export function DocumentListPage() {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const createDocument = useCreateDocument();
  const { data: folderTree } = useFolderTree();

  // State
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
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

  // 이동 성공 후: 옮긴 항목이 있는 목적지 폴더(루트면 null)를 연다.
  const handleMoved = (destinationId: string | null) => {
    if (destinationId === null) {
      setBreadcrumb([]);
      loadContents(null);
      return;
    }
    const path = folderTree ? findFolderPath(folderTree, destinationId) : null;
    setBreadcrumb(path ?? [{ folderId: destinationId, folderName: '폴더' }]);
    loadContents(destinationId);
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

  // 헤더의 New Folder 버튼: 팝업을 열고, 생성 성공 시 현재 폴더 내용을 다시 불러온다.
  const handleCreateFolder = () => setCreateFolderOpen(true);

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
        onMoved={handleMoved}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={currentFolderId}
        onCreated={() => loadContents(currentFolderId)}
      />
    </AppShell>
  );
}
