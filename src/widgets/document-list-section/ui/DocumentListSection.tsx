import { useState } from 'react';
import { Folder, FileText, Square, CheckSquare, FolderPlus, FilePlus, ChevronRight } from 'lucide-react';
import type { Document, Folder as FolderType } from '@/shared/types/document';
import { TIME_MS } from '@/shared/constants/time';

interface DocumentListSectionProps {
  items: Array<Document | FolderType>;
  currentPath: string[];
  onItemClick?: (item: Document | FolderType) => void;
  onBreadcrumbClick: (index: number) => void;
  onCreateFolder?: () => void;
  onCreateDocument?: () => void;
}

export function DocumentListSection({
  items,
  currentPath,
  onItemClick,
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

          {currentPath.map((folder, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight size={20} className="text-gray-400" />
              <button
                onClick={() => onBreadcrumbClick(index + 1)}
                className={`transition-colors ${
                  index === currentPath.length - 1
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {folder}
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

      {/* Document List */}
      <div className="px-6 py-4">
        <div className="space-y-1">
          {items.map((item) => (
            <DocumentListItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelection={() => handleToggleSelection(item.id)}
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DocumentListItemProps {
  item: Document | FolderType;
  isSelected: boolean;
  onToggleSelection: () => void;
  onClick?: () => void;
}

function DocumentListItem({
  item,
  isSelected,
  onToggleSelection,
  onClick,
}: DocumentListItemProps) {
  const isFolder = item.type === 'folder';
  const modifiedAt = 'modifiedAt' in item ? item.modifiedAt : undefined;

  const formatDate = (date: Date) => {
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

  const handleRowClick = () => {
    onClick?.();
  };

  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onClick={handleRowClick}
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
          {item.name}
        </span>
      </div>

      {/* Modified Date */}
      {modifiedAt && (
        <div className="flex-shrink-0 ml-4">
          <span className="text-sm text-gray-500">
            {formatDate(modifiedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
