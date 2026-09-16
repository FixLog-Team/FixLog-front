export { documentsApi } from '@/domains/documents/api/documents.api';
export type {
  DocumentDto,
  DocumentDuplicateDto,
  DocumentHistoryDto,
  DocumentHistoryDetailDto,
  CreateDocumentBody,
  SaveDocumentBody,
  MoveDocumentBody,
  RenameDocumentBody,
  ListDocumentsParams,
  ResourcePermissionDto,
} from '@/domains/documents/types/document';
export { useDocument } from '@/domains/documents/hooks/use-document';
export { useDocumentList } from '@/domains/documents/hooks/use-document-list';
