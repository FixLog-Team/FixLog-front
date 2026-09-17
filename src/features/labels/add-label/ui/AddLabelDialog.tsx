import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAddDocumentLabel } from '@/features/labels/add-label/hooks/use-add-document-label';

interface AddLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
}

/** 태그 직접 입력 추가 팝업. 입력한 이름을 문서에 태그로 추가한다(없으면 서버가 생성). */
export function AddLabelDialog({
  open,
  onOpenChange,
  documentId,
}: AddLabelDialogProps) {
  const addLabel = useAddDocumentLabel(documentId);
  const [value, setValue] = useState('');

  // 열릴 때 입력 초기화
  useEffect(() => {
    if (open) setValue('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    try {
      await addLabel.mutateAsync(name);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>태그 추가</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="태그 이름"
            className="mt-4"
          />
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!value.trim() || addLabel.isPending}>
              {addLabel.isPending ? '추가 중…' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
