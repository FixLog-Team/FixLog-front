import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
} from 'lucide-react';
import type { Document, Folder as FolderType } from '@/shared/types/document';

interface SidebarProps {
  items: Array<Document | FolderType>;
  selectedDocumentId?: string | null;
  currentPath?: string[];
  onItemClick?: (item: Document | FolderType, itemPath: string[]) => void;
  onCreateDocument?: () => void;
}

export function Sidebar({ items, selectedDocumentId, currentPath = [], onItemClick, onCreateDocument }: SidebarProps) {
  const [isMyDocumentsExpanded, setIsMyDocumentsExpanded] = useState(true);

  const handleCreateClick = () => {
    onCreateDocument?.();
  };

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">FixLog</h1>
      </div>

      {/* Create Document Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleCreateClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Create Document</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        {/* My Documents Section */}
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

          {isMyDocumentsExpanded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {items.map((item) => (
                <TreeItem 
                  key={item.id} 
                  item={item} 
                  selectedDocumentId={selectedDocumentId} 
                  currentPath={currentPath}
                  parentPath={[]}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

interface TreeItemProps {
  item: FolderType | Document;
  selectedDocumentId?: string | null;
  currentPath?: string[];
  parentPath: string[];
  onItemClick?: (item: Document | FolderType, itemPath: string[]) => void;
}

function TreeItem({ item, selectedDocumentId, currentPath = [], parentPath, onItemClick }: TreeItemProps) {
  const isFolder = item.type === 'folder';
  const hasChildren = isFolder && item.children && item.children.length > 0;
  const isSelected = !isFolder && item.id === selectedDocumentId;
  
  // Check if this folder is in the current path
  const isInCurrentPath = isFolder && currentPath.includes(item.name);
  const isCurrentFolder = isFolder && currentPath.length > 0 && currentPath[currentPath.length - 1] === item.name;
  
  const [isExpanded, setIsExpanded] = useState(
    item.type === 'folder' ? item.isExpanded ?? false : false
  );

  // Auto-expand if this folder is in the current path
  useEffect(() => {
    if (isInCurrentPath) {
      setIsExpanded(true);
    }
  }, [isInCurrentPath]);

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    // Calculate full path for this item
    const itemFullPath = isFolder ? [...parentPath, item.name] : parentPath;
    
    if (isFolder && hasChildren) {
      // Toggle folder expansion
      handleToggle();
    }
    
    // Call onItemClick handler
    if (onItemClick) {
      onItemClick(item, itemFullPath);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm ${
          isSelected
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : isInCurrentPath
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {hasChildren && (
          <>
            {isExpanded ? (
              <ChevronDown size={14} className="flex-shrink-0" />
            ) : (
              <ChevronRight size={14} className="flex-shrink-0" />
            )}
          </>
        )}
        {!hasChildren && <div className="w-[14px]" />}

        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={16} className="flex-shrink-0 text-gray-500" />
          ) : (
            <Folder size={16} className="flex-shrink-0 text-gray-500" />
          )
        ) : (
          <FileText size={16} className="flex-shrink-0 text-gray-500" />
        )}
        <span className="truncate">{item.name}</span>
      </button>

      {hasChildren && isExpanded && isFolder && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <TreeItem 
              key={child.id} 
              item={child} 
              selectedDocumentId={selectedDocumentId} 
              currentPath={currentPath}
              parentPath={[...parentPath, item.name]}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
