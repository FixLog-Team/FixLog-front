import { useState, useEffect } from 'react';
import { foldersApi } from '@/domains/folders/api/folders.api';
import type { FolderItem } from '@/domains/folders/types/folder';
import type { DocumentDto } from '@/domains/documents/types/document';

/** 루트 폴더/문서 조회(사이드바 최상위). */
export function useRootFolders(enabled: boolean) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (enabled && !isLoaded) {
      foldersApi
        .getRootContents()
        .then((result) => {
          setFolders(result.folders);
          setDocuments(result.documents);
          setIsLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load root folders:', error);
        });
    }
  }, [enabled, isLoaded]);

  return { folders, documents, isLoaded };
}
