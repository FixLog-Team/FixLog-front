import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/widgets/app-shell';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import { foldersApi, useFolderTree } from '@/domains/folders';
import type { FolderItem, FolderPathItem, FolderTreeNode } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';
import { permissionsApi } from '@/domains/permissions';
import { useWorkspaceRole } from '@/domains/workspaces';
import { useSession } from '@/domains/auth';
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
  const { isAdmin, isPersonal } = useWorkspaceRole();
  const { data: session } = useSession();
  const myId = session?.userId;

  // 일반 구성원의 협업 워크스페이스에서만, "명시적으로 공유되지 않은" 항목을 목록에서 숨긴다.
  // 관리자·소유자·개인 워크스페이스는 항상 전체 접근이라 걸러낼 필요가 없다.
  const hideUnshared = !isAdmin && !isPersonal;

  // 설정 화면과 동일한 권위(shared-with-me)로 판단한다. my-permission 의 source 는 DENY 레코드가
  // 남아 있으면 DIRECT 로 잘못 잡혀 신뢰할 수 없으므로, "내게 실제로 공유된 목록"을 기준으로 필터링한다.
  const sharedQuery = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => permissionsApi.sharedWithMe(),
    enabled: hideUnshared,
  });
  const sharedIds = useMemo(() => {
    const set = new Set<string>();
    for (const f of sharedQuery.data?.folders ?? []) set.add(f.folderId);
    for (const d of sharedQuery.data?.documents ?? []) set.add(d.documentId);
    return set;
  }, [sharedQuery.data]);

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
      // 원본 그대로 보관하고, 노출 필터는 렌더 단계에서 shared-with-me 기준으로 적용한다.
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

  // 노출 필터(일반 구성원·협업 워크스페이스): 내게 명시적으로 공유된 것(shared-with-me)만 보인다.
  // - 내가 만든 항목은 항상 표시(생성자 보호)
  // - 공유받은 폴더 안(현재 경로에 공유 폴더가 포함)에 들어와 있으면 그 하위는 모두 표시(폴더 공유 상속)
  const insideSharedScope = breadcrumb.some((b) => sharedIds.has(b.folderId));
  const isVisible = (id: string, createUser: string | null) =>
    !hideUnshared ||
    (!!myId && createUser === myId) ||
    insideSharedScope ||
    sharedIds.has(id);
  const visibleFolders = folders.filter((f) => isVisible(f.folderId, f.createUser));
  const visibleDocuments = documents.filter((d) => isVisible(d.documentId, d.createUser));

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
        folders={visibleFolders}
        documents={visibleDocuments}
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
