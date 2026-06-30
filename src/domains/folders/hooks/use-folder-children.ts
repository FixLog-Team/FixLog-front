import { useState, useCallback } from 'react';
import { fetchFolderContents } from '@/domains/folders/api/folders.api';
import type { FolderItem, DocumentItem } from '@/domains/folders/types/folder';

export function useFolderChildren(folderId: string, workspaceId: string) {
  const [childFolders, setChildFolders] = useState<FolderItem[]>([]);
  const [childDocuments, setChildDocuments] = useState<DocumentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadChildren = useCallback(async () => {
    if (!isLoaded) {
      try {
        const result = await fetchFolderContents(folderId, workspaceId);
        setChildFolders(result.folders);
        setChildDocuments(result.documents);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load folder contents:', error);
      }
    }
  }, [folderId, workspaceId, isLoaded]);

  return { childFolders, childDocuments, isLoaded, loadChildren };
}
