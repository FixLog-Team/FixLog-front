import { useState, useCallback } from 'react';
import { foldersApi } from '@/domains/folders/api/folders.api';
import type { FolderItem } from '@/domains/folders/types/folder';
import type { DocumentDto } from '@/domains/documents/types/document';

/** 특정 폴더의 하위 폴더/문서 지연 로딩(사이드바 확장 시). */
export function useFolderChildren(folderId: string) {
  const [childFolders, setChildFolders] = useState<FolderItem[]>([]);
  const [childDocuments, setChildDocuments] = useState<DocumentDto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadChildren = useCallback(async () => {
    if (!isLoaded) {
      try {
        const result = await foldersApi.getFolderContents(folderId);
        setChildFolders(result.folders);
        setChildDocuments(result.documents);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load folder contents:', error);
      }
    }
  }, [folderId, isLoaded]);

  return { childFolders, childDocuments, isLoaded, loadChildren };
}
