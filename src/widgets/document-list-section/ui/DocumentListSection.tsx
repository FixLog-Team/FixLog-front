import { useState } from 'react';
import { Folder, FileText, Square, CheckSquare, FolderPlus, FilePlus, ChevronRight } from 'lucide-react';
import type { FolderItem, DocumentItem } from '@/domains/folders';
import { TIME_MS } from '@/shared/constants/time';

interface BreadcrumbItem {
  folderId: string;
  folderName: string;
}

interface DocumentListSectionProps {
  folders: FolderItem[];
  documents: DocumentItem[];
  breadcrumb: BreadcrumbItem[];
  onFolderClick?: (folder: FolderItem) => void;
  onDocumentClick?: (document: DocumentItem) => void;
  onBreadcrumbClick: (index: number) => void;
  onCreateFolder?: () => void;
  onCreateDocument?: () => void;
}

export function DocumentListSection({
  folders,
  documents,
  breadcrumb,
  onFolderClick,
  onDocumentClick,
  onBreadcrumbClick,
  onCreateFolder,
  onCreateDocument,
}: DocumentListSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Breadcrumb and Actions */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <button
            onClick={() => onBreadcrumbClick(0)}
            className="text-gray-900 hover:text-blue-600 transition-colors"
          >
            My Documents
          </button>

          {breadcrumb.map((item, index) => (
            <div key={item.folderId} className="flex items-center gap-2">
              <ChevronRight size={20} className="text-gray-400" />
              <button
                onClick={() => onBreadcrumbClick(index + 1)}
                className={`transition-colors ${
                  index === breadcrumb.length - 1
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.folderName}
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateFolder}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-700"
          >
            <FolderPlus size={18} />
            <span>Create Folder</span>
          </button>

          <button
            onClick={onCreateDocument}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FilePlus size={18} />
            <span>Create Document</span>
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="px-6 py-4">
        {folders.length === 0 && documents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">폴더가 비었습니다.</p>
        ) : (
          <div className="space-y-1">
            {/* Folders */}
            {folders.map((folder) => (
              <ListItem
                key={folder.folderId}
                id={folder.folderId}
                name={folder.folderName}
                type="folder"
                updatedAt={folder.updateTime}
                isSelected={selectedIds.has(folder.folderId)}
                onToggleSelection={() => handleToggleSelection(folder.folderId)}
                onClick={() => onFolderClick?.(folder)}
              />
            ))}

            {/* Documents */}
            {documents.map((doc) => (
              <ListItem
                key={doc.documentId}
                id={doc.documentId}
                name={doc.title}
                type="document"
                updatedAt={doc.updateTime}
                isSelected={selectedIds.has(doc.documentId)}
                onToggleSelection={() => handleToggleSelection(doc.documentId)}
                onClick={() => onDocumentClick?.(doc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ListItemProps {
  id: string;
  name: string;
  type: 'folder' | 'document';
  updatedAt: string;
  isSelected: boolean;
  onToggleSelection: () => void;
  onClick?: () => void;
}

function ListItem({
  name,
  type,
  updatedAt,
  isSelected,
  onToggleSelection,
  onClick,
}: ListItemProps) {
  const isFolder = type === 'folder';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / TIME_MS.DAY);

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection();
  };

  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
        >
          {isSelected ? (
            <CheckSquare size={20} className="text-blue-600" />
          ) : (
            <Square size={20} />
          )}
        </button>

        {/* Icon */}
        <div className="flex-shrink-0">
          {isFolder ? (
            <Folder className="text-gray-400 group-hover:text-blue-500" size={20} />
          ) : (
            <FileText className="text-gray-400 group-hover:text-blue-500" size={20} />
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-900 truncate">
          {name}
        </span>
      </div>

      {/* Modified Date */}
      <div className="flex-shrink-0 ml-4">
        <span className="text-sm text-gray-500">
          {formatDate(updatedAt)}
        </span>
      </div>
    </div>
  );
}
