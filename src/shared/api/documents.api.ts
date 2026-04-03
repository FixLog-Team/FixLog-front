import type { Document, Folder } from '@/shared/types/document';
import { MOCK_DOCUMENTS } from '@/shared/lib/mock-data/documents';
import { MOCK_DOCUMENT_DETAILS, type DocumentDetail } from '@/shared/lib/mock-data/document-details';
import { API_MOCK_DELAY } from '@/shared/constants/api';

// Re-export DocumentDetail type for convenience
export type { DocumentDetail };

/**
 * Fetches the list of documents and folders
 *
 * TODO: Replace with actual API call
 * Example:
 * ```typescript
 * const response = await fetch('/api/documents');
 * return response.json();
 * ```
 */
export async function fetchDocuments(): Promise<Array<Document | Folder>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY.FETCH));

  // Return mock data
  return MOCK_DOCUMENTS;
}

/**
 * Fetches a specific document's detail by ID
 *
 * @param documentId - The ID of the document to fetch
 * @returns Document detail or null if not found
 *
 * TODO: Replace with actual API call
 * Example:
 * ```typescript
 * const response = await fetch(`/api/documents/${documentId}`);
 * if (!response.ok) return null;
 * return response.json();
 * ```
 */
export async function fetchDocumentDetail(documentId: string): Promise<DocumentDetail | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY.FETCH));

  // Return mock data
  return MOCK_DOCUMENT_DETAILS[documentId] || null;
}

/**
 * Creates a new document
 *
 * @param data - Document creation data
 * @returns Created document
 *
 * TODO: Replace with actual API call
 * Example:
 * ```typescript
 * const response = await fetch('/api/documents', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data),
 * });
 * return response.json();
 * ```
 */
export async function createDocument(data: { name: string; folderId?: string }): Promise<Document> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY.MUTATE));

  // Mock implementation
  const newDocument: Document = {
    id: `doc-${Date.now()}`,
    name: data.name,
    type: 'document',
    createdAt: new Date(),
    modifiedAt: new Date(),
    folderId: data.folderId,
  };

  return newDocument;
}

/**
 * Creates a new folder
 *
 * @param data - Folder creation data
 * @returns Created folder
 *
 * TODO: Replace with actual API call
 */
export async function createFolder(data: { name: string; parentId?: string }): Promise<Folder> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY.MUTATE));

  // Mock implementation
  const newFolder: Folder = {
    id: `folder-${Date.now()}`,
    name: data.name,
    type: 'folder',
    parentId: data.parentId,
    children: [],
  };

  return newFolder;
}

/**
 * Searches documents by query
 *
 * @param query - Search query string
 * @returns Matching documents
 *
 * TODO: Replace with actual API call
 */
export async function searchDocuments(query: string): Promise<Array<Document | Folder>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_MOCK_DELAY.SEARCH));

  // Mock implementation - simple name filter
  const filterItems = (items: Array<Document | Folder>): Array<Document | Folder> => {
    const results: Array<Document | Folder> = [];

    for (const item of items) {
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(item);
      }

      if (item.type === 'folder' && item.children) {
        results.push(...filterItems(item.children));
      }
    }

    return results;
  };

  return filterItems(MOCK_DOCUMENTS);
}
