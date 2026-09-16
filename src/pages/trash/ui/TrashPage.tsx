import { useState } from 'react';
import { koDateTime } from '@/shared/lib/date/format';
import { Folder, FileText, RotateCcw, Trash2 } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/ui/alert-dialog';
import { useTrash, useRestoreTrash, usePurgeTrash } from '@/domains/trash';
import type { TrashItem } from '@/domains/trash';

function formatDeleted(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return koDateTime(date);
}

export function TrashPage() {
  // Hooks
  const { data, isLoading } = useTrash();
  const restore = useRestoreTrash();
  const purge = usePurgeTrash();

  // State
  const [purgeTarget, setPurgeTarget] = useState<TrashItem | null>(null);

  // Variables
  const items = data ?? [];

  // Functions
  const handleRestore = (item: TrashItem) => {
    restore.mutate({
      resourceType: item.resourceType,
      resourceId: item.resourceId,
    });
  };

  const handlePurge = () => {
    if (!purgeTarget) return;
    purge.mutate(
      {
        resourceType: purgeTarget.resourceType,
        resourceId: purgeTarget.resourceId,
      },
      { onSettled: () => setPurgeTarget(null) }
    );
  };

  // Render
  return (
    <AppShell header={<PageHeader title="휴지통" />}>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <p className="mb-4 text-sm text-muted-foreground">
          삭제한 문서·폴더는 여기에 보관됩니다. 복원하거나 영구 삭제할 수 있습니다.
          (지운 본인과 워크스페이스 관리자만 볼 수 있어요.)
        </p>

        {isLoading ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            불러오는 중…
          </p>
        ) : items.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            휴지통이 비어 있습니다.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={`${item.resourceType}-${item.resourceId}`}
                className="flex items-center gap-3 py-3"
              >
                {item.resourceType === 'FOLDER' ? (
                  <Folder className="size-[18px] shrink-0 text-primary" />
                ) : (
                  <FileText className="size-[18px] shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.resourceType === 'FOLDER' ? '폴더' : '문서'} · 삭제됨{' '}
                    {formatDeleted(item.deletedAt)}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestore(item)}
                  disabled={restore.isPending}
                >
                  <RotateCcw />
                  복원
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPurgeTarget(item)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  영구 삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 영구 삭제 확인 */}
      <AlertDialog
        open={purgeTarget !== null}
        onOpenChange={(o) => !o && setPurgeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영구 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{purgeTarget?.name}&apos;
              {purgeTarget?.resourceType === 'FOLDER'
                ? ' 폴더와 그 안의 항목을'
                : ' 문서를'}{' '}
              영구 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={purge.isPending}
              onClick={(e) => {
                e.preventDefault();
                handlePurge();
              }}
            >
              영구 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
