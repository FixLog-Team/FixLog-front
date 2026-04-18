import { useState, useEffect } from 'react';
import { fetchRootFolders } from '@/domains/folders/api/folders.api';
import type { FolderItem, DocumentItem } from '@/domains/folders/types/folder';

export function useRootFolders(workspaceId: string, enabled: boolean) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (enabled && !isLoaded) {
      fetchRootFolders(workspaceId)
        .then((result) => {
          setFolders(result.folders);
          setDocuments(result.documents);
          setIsLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load root folders:', error);
        });
    }
  }, [enabled, isLoaded, workspaceId]);

  return { folders, documents, isLoaded };
}
