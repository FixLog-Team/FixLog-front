import { useState, useEffect, useCallback } from 'react';
import { foldersApi } from '@/domains/folders/api/folders.api';
import type { FolderItem } from '@/domains/folders/types/folder';
import type { DocumentDto } from '@/domains/documents/types/document';

/** 루트 폴더/문서 조회(사이드바 최상위). */
export function useRootFolders(enabled: boolean) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const result = await foldersApi.getRootContents();
      setFolders(result.folders);
      setDocuments(result.documents);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load root folders:', error);
    }
  }, []);

  useEffect(() => {
    if (enabled && !isLoaded) {
      refetch();
    }
  }, [enabled, isLoaded, refetch]);

  return { folders, documents, isLoaded, refetch };
}
