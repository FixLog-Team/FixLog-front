import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { DocumentHeader } from '@/widgets/document-header/ui/DocumentHeader';
import { DocumentListSection } from '@/widgets/document-list-section/ui/DocumentListSection';
import type { Document, Folder } from '@/domains/documents/types/document';
import { fetchDocuments } from '@/domains/documents/api/documents.api';

export function DocumentListPage() {
  // State
  const [documents, setDocuments] = useState<Array<Document | Folder>>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const navigate = useNavigate();

  const currentItems = useMemo(() => {
    if (currentPath.length === 0) {
      return documents;
    }

    let items: Array<Document | Folder> = documents;
    for (const folderName of currentPath) {
      const folder = items.find(
        (item) => item.type === 'folder' && item.name === folderName
      ) as Folder | undefined;

      if (folder && folder.children) {
        items = folder.children;
      } else {
        return [];
      }
    }
    return items;
  }, [documents, currentPath]);

  const handleCreateDocument = () => {
    console.log('Create document clicked');
  };

  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  const handleItemClick = (item: Document | Folder) => {
    if (item.type === 'folder') {
      // Navigate into folder
      setCurrentPath([...currentPath, item.name]);
    } else {
      // Set selected document and navigate to detail page
      setSelectedDocumentId(item.id);
      navigate(`/documents/${item.id}`);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    // Navigate to clicked path level
    setCurrentPath(currentPath.slice(0, index));
  };

  const handleSidebarItemClick = (item: Document | Folder, itemPath: string[]) => {
    if (item.type === 'folder') {
      // Navigate to folder
      setCurrentPath(itemPath);
    } else {
      // Navigate to document detail page
      setSelectedDocumentId(item.id);
      navigate(`/documents/${item.id}`);
    }
  };

  // Effects
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <p className="text-gray-600">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        items={documents}
        selectedDocumentId={selectedDocumentId}
        currentPath={currentPath}
        onItemClick={handleSidebarItemClick}
        onCreateDocument={handleCreateDocument}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DocumentHeader onSearch={handleSearch} />

        {/* Document List */}
        <DocumentListSection
          items={currentItems}
          currentPath={currentPath}
          onItemClick={handleItemClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          onCreateFolder={handleCreateFolder}
          onCreateDocument={handleCreateDocument}
        />
      </div>
    </div>
  );
}
