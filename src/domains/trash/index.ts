export { trashApi } from '@/domains/trash/api/trash.api';
export {
  useTrash,
  useRestoreTrash,
  usePurgeTrash,
} from '@/domains/trash/hooks/use-trash';
export type { TrashItem, TrashResourceType } from '@/domains/trash/types/trash';
