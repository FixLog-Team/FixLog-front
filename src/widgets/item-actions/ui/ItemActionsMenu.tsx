import { useState } from 'react';
import { MoreVertical, Pencil, Copy, FolderInput, Share2, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog';
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
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useRenameDocument } from '@/features/documents/rename-document/hooks/use-rename-document';
import { useDuplicateDocument } from '@/features/documents/duplicate-document/hooks/use-duplicate-document';
import { useMoveDocument } from '@/features/documents/move-document/hooks/use-move-document';
import { useDeleteDocument } from '@/features/documents/delete-document/hooks/use-delete-document';
import { useDownloadDocument } from '@/features/documents/download-document/hooks/use-download-document';
import { useRenameFolder } from '@/features/folders/rename-folder/hooks/use-rename-folder';
import { useMoveFolder } from '@/features/folders/move-folder/hooks/use-move-folder';
import { useDeleteFolder } from '@/features/folders/delete-folder/hooks/use-delete-folder';
import { MoveDialog } from '@/widgets/item-actions/ui/MoveDialog';
import type { ActionTarget } from '@/widgets/item-actions/ui/types';
import { ShareDialog } from '@/features/sharing/share-resource/ui/ShareDialog';
import { useSession } from '@/domains/auth';
import { useWorkspaceRole } from '@/domains/workspaces';

interface ItemActionsMenuProps {
  target: ActionTarget;
  /** 액션 성공 후 목록을 갱신하기 위한 콜백(리스트가 로컬 state 기반이라 필요). */
  onChanged: () => void;
  /** 이동 성공 후 목적지 폴더(루트면 null)로 이동시키기 위한 콜백. */
  onMoved?: (destinationId: string | null) => void;
}

type OpenDialog = 'rename' | 'move' | 'delete' | null;

/**
 * 목록 행의 ⋮ 액션 메뉴. 폴더/문서 공통으로 이름변경·복제(문서)·이동·삭제를 제공한다.
 * 안드로이드 MainActivity 의 롱클릭 컨텍스트 메뉴와 대응된다.
 */
export function ItemActionsMenu({ target, onChanged, onMoved }: ItemActionsMenuProps) {
  const isFolder = target.kind === 'folder';

  // 역할 기반 게이팅: 공유/삭제는 소유자 전용(OWNER) 액션이므로,
  // 내가 소유자(생성자)이거나 워크스페이스 관리자일 때만 노출한다.
  // (이름변경/복제/이동은 편집 권한만 있으면 되므로 노출하고 서버 판정에 맡긴다.)
  const { data: session } = useSession();
  const { isAdmin } = useWorkspaceRole();
  const isOwner = !!target.ownerId && target.ownerId === session?.userId;
  const canOwnerAction = isAdmin || isOwner;

  // 훅은 조건 없이 항상 호출한다. 문서가 아닐 땐 rename 훅에 빈 id 를 넘기며 사용하지 않는다.
  const renameDocument = useRenameDocument(target.kind === 'document' ? target.id : '');
  const renameFolder = useRenameFolder();
  const duplicateDocument = useDuplicateDocument();
  const moveDocument = useMoveDocument();
  const moveFolder = useMoveFolder();
  const deleteDocument = useDeleteDocument();
  const deleteFolder = useDeleteFolder();
  const downloadDocument = useDownloadDocument();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(target.name);

  const close = () => setOpenDialog(null);

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = renameValue.trim();
    if (!name || name === target.name) {
      close();
      return;
    }
    try {
      if (target.kind === 'folder') {
        await renameFolder.mutateAsync({
          folderId: target.id,
          folderName: name,
          parentId: target.parentId,
        });
      } else {
        await renameDocument.mutateAsync(name);
      }
      onChanged();
      close();
    } catch (error) {
      console.error('rename failed:', error);
    }
  };

  const handleDuplicate = async () => {
    if (target.kind !== 'document') return;
    try {
      await duplicateDocument.mutateAsync(target.id);
      onChanged();
    } catch (error) {
      console.error('duplicate failed:', error);
    }
  };

  const handleMove = async (destinationId: string | null) => {
    try {
      if (target.kind === 'folder') {
        if (destinationId === target.id) return; // 자기 자신으로 이동 방지
        await moveFolder.mutateAsync({ folderId: target.id, parentId: destinationId });
      } else {
        await moveDocument.mutateAsync({ documentId: target.id, folderId: destinationId });
      }
      close();
      // 이동 후에는 목적지(루트면 null)를 연다. onMoved 가 목적지 로드를 담당하므로,
      // 현재 폴더를 다시 부르는 onChanged 와 동시에 호출하면 두 로드가 경쟁해
      // 브레드크럼(목적지)과 리스트(현재 폴더)가 어긋난다. onMoved 가 없을 때만 현재 목록을 갱신.
      if (onMoved) onMoved(destinationId);
      else onChanged();
    } catch (error) {
      console.error('move failed:', error);
    }
  };

  // 문서 PDF 다운로드(GET /api/documents/{id}/download). 편집 페이지와 동일 동작.
  const handleDownload = async () => {
    if (target.kind !== 'document') return;
    try {
      await downloadDocument.mutateAsync({ documentId: target.id, title: target.name });
    } catch (error) {
      console.error('download failed:', error);
      alert('다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDelete = async () => {
    try {
      if (target.kind === 'folder') {
        await deleteFolder.mutateAsync(target.id);
      } else {
        await deleteDocument.mutateAsync(target.id);
      }
      onChanged();
      close();
    } catch (error) {
      console.error('delete failed:', error);
    }
  };

  const isDeleting = deleteFolder.isPending || deleteDocument.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="더보기"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={() => {
              setRenameValue(target.name);
              setOpenDialog('rename');
            }}
          >
            <Pencil />
            이름 변경
          </DropdownMenuItem>
          {!isFolder && (
            <DropdownMenuItem onSelect={handleDuplicate}>
              <Copy />
              복제
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setOpenDialog('move')}>
            <FolderInput />
            이동
          </DropdownMenuItem>
          {canOwnerAction && (
            <DropdownMenuItem onSelect={() => setShareOpen(true)}>
              <Share2 />
              공유하기
            </DropdownMenuItem>
          )}
          {!isFolder && (
            <DropdownMenuItem
              onSelect={handleDownload}
              disabled={downloadDocument.isPending}
            >
              <Download />
              {downloadDocument.isPending ? '다운로드 중…' : '다운로드'}
            </DropdownMenuItem>
          )}
          {canOwnerAction && <DropdownMenuSeparator />}
          {canOwnerAction && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setOpenDialog('delete')}
            >
              <Trash2 />
              삭제
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 이름 변경 */}
      <Dialog open={openDialog === 'rename'} onOpenChange={(o) => !o && close()}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>이름 변경</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-4"
              placeholder={isFolder ? '폴더 이름' : '문서 제목'}
            />
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit">변경</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 이동 */}
      <MoveDialog
        target={target}
        open={openDialog === 'move'}
        onOpenChange={(o) => !o && close()}
        onSelect={handleMove}
      />

      {/* 공유 */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        kind={target.kind}
        id={target.id}
        name={target.name}
        canManage={canOwnerAction}
      />

      {/* 삭제 확인 */}
      <AlertDialog open={openDialog === 'delete'} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {isFolder
                ? `'${target.name}' 폴더와 하위 폴더·문서를 휴지통으로 이동합니다. 휴지통에서 복원할 수 있습니다.`
                : `'${target.name}' 문서를 휴지통으로 이동합니다. 휴지통에서 복원할 수 있습니다.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
