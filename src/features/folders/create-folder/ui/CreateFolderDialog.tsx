import { useState } from 'react';
import { NameInputDialog } from '@/shared/ui/name-input-dialog';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { useCreateFolder } from '@/features/folders/create-folder/hooks/use-create-folder';
import type { FolderItem } from '@/domains/folders';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 생성 위치. 루트면 null. */
  parentId: string | null;
  /** 생성 성공 후 호출(이동·목록 갱신 등). 팝업은 성공 시 자동으로 닫힌다. */
  onCreated?: (folder: FolderItem) => void;
}

/**
 * 폴더 생성 팝업. 사이드바 FOLDERS +, Home "New Folder", Documents 헤더가 공통으로 쓴다.
 * 생성 성공 시에만 onCreated 를 호출하고 닫히며, 취소하면 아무 것도 하지 않는다.
 * 사이드바 목록은 useCreateFolder 의 folders.all 무효화로 자동 갱신된다.
 */
export function CreateFolderDialog({ open, onOpenChange, parentId, onCreated }: CreateFolderDialogProps) {
  // Hooks
  const createFolder = useCreateFolder();

  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Functions
  const handleSubmit = async (folderName: string) => {
    setErrorMessage(null);
    try {
      const created = await createFolder.mutateAsync({ parentId, folderName });
      onOpenChange(false);
      onCreated?.(created);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '폴더 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.'));
    }
  };

  // Render
  return (
    <NameInputDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setErrorMessage(null);
        onOpenChange(o);
      }}
      title="새 폴더"
      description={parentId ? '현재 폴더 안에 새 폴더를 만듭니다.' : '최상위에 새 폴더를 만듭니다.'}
      placeholder="폴더 이름"
      defaultValue="New Folder"
      submitLabel="만들기"
      isPending={createFolder.isPending}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
    />
  );
}
