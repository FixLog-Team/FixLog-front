import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
} from 'lucide-react';
import type { FolderItem, DocumentItem, FolderPathItem } from '@/domains/folders';
import { useRootFolders } from '@/domains/folders/hooks/use-root-folders';
import { useFolderChildren } from '@/domains/folders/hooks/use-folder-children';
import { LAYOUT } from '@/shared/constants/layout';

interface SidebarProps {
  currentFolderId?: string | null;
  selectedDocumentId?: string | null;
  workspaceId: string;
  onFolderClick?: (folder: FolderItem, path: FolderPathItem[]) => void;
  onDocumentClick?: (document: DocumentItem) => void;
  onCreateDocument?: () => void;
}

export function Sidebar({
  currentFolderId,
  selectedDocumentId,
  workspaceId,
  onFolderClick,
  onDocumentClick,
  onCreateDocument,
}: SidebarProps) {
  const [isMyDocumentsExpanded, setIsMyDocumentsExpanded] = useState(true);

  const { folders: rootFolders, documents: rootDocuments, isLoaded } =
    useRootFolders(workspaceId, isMyDocumentsExpanded);

  return (
    <aside style={{ width: LAYOUT.SIDEBAR_WIDTH }} className="h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">FixLog</h1>
      </div>

      {/* Create Document Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onCreateDocument}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Create Document</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <div className="mb-4">
          <button
            onClick={() => setIsMyDocumentsExpanded(!isMyDocumentsExpanded)}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium text-gray-700"
          >
            {isMyDocumentsExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span>My Documents</span>
          </button>

          {isMyDocumentsExpanded && isLoaded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {rootFolders.map((folder) => (
                <SidebarFolderItem
                  key={folder.folderId}
                  folder={folder}
                  parentPath={[]}
                  workspaceId={workspaceId}
                  currentFolderId={currentFolderId}
                  selectedDocumentId={selectedDocumentId}
                  onFolderClick={onFolderClick}
                  onDocumentClick={onDocumentClick}
                />
              ))}
              {rootDocuments.map((doc) => (
                <SidebarDocumentItem
                  key={doc.documentId}
                  document={doc}
                  isSelected={doc.documentId === selectedDocumentId}
                  onClick={() => onDocumentClick?.(doc)}
                />
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

interface SidebarFolderItemProps {
  folder: FolderItem;
  parentPath: FolderPathItem[];
  workspaceId: string;
  currentFolderId?: string | null;
  selectedDocumentId?: string | null;
  onFolderClick?: (folder: FolderItem, path: FolderPathItem[]) => void;
  onDocumentClick?: (document: DocumentItem) => void;
}

function SidebarFolderItem({
  folder,
  parentPath,
  workspaceId,
  currentFolderId,
  selectedDocumentId,
  onFolderClick,
  onDocumentClick,
}: SidebarFolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { childFolders, childDocuments, isLoaded, loadChildren } =
    useFolderChildren(folder.folderId, workspaceId);

  const isCurrentFolder = folder.folderId === currentFolderId;

  useEffect(() => {
    if (isCurrentFolder && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isCurrentFolder]);

  const handleChevronClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (nextExpanded) {
      await loadChildren();
    }
  };

  const currentPath: FolderPathItem[] = [
    ...parentPath,
    { folderId: folder.folderId, folderName: folder.folderName },
  ];

  const handleNameClick = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      await loadChildren();
    }
    onFolderClick?.(folder, currentPath);
  };

  const className = isCurrentFolder
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'text-gray-700 hover:bg-gray-100';

  return (
    <div>
      <div
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm ${className}`}
      >
        {/* Chevron: 펼침/접힘만 */}
        <button
          onClick={handleChevronClick}
          className="flex-shrink-0 hover:text-gray-900"
        >
          {isExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {/* 폴더명: 펼침 + 메인 영역 이동 */}
        <button
          onClick={handleNameClick}
          className="flex items-center gap-1.5 min-w-0 flex-1"
        >
          {isExpanded ? (
            <FolderOpen size={16} className="flex-shrink-0 text-gray-500" />
          ) : (
            <Folder size={16} className="flex-shrink-0 text-gray-500" />
          )}
          <span className="truncate">{folder.folderName}</span>
        </button>
      </div>

      {isExpanded && isLoaded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {childFolders.map((child) => (
            <SidebarFolderItem
              key={child.folderId}
              folder={child}
              parentPath={currentPath}
              workspaceId={workspaceId}
              currentFolderId={currentFolderId}
              selectedDocumentId={selectedDocumentId}
              onFolderClick={onFolderClick}
              onDocumentClick={onDocumentClick}
            />
          ))}
          {childDocuments.map((doc) => (
            <SidebarDocumentItem
              key={doc.documentId}
              document={doc}
              isSelected={doc.documentId === selectedDocumentId}
              onClick={() => onDocumentClick?.(doc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarDocumentItemProps {
  document: DocumentItem;
  isSelected: boolean;
  onClick: () => void;
}

function SidebarDocumentItem({ document, isSelected, onClick }: SidebarDocumentItemProps) {
  const className = isSelected
    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    : 'text-gray-700 hover:bg-gray-100';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm ${className}`}
    >
      <div className="w-[14px]" />
      <FileText size={16} className="flex-shrink-0 text-gray-500" />
      <span className="truncate">{document.title}</span>
    </button>
  );
}
