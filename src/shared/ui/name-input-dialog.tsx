import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface NameInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  /** 열릴 때 입력창에 채워 두는 값(전체 선택 상태). */
  defaultValue?: string;
  submitLabel?: string;
  isPending?: boolean;
  errorMessage?: string | null;
  /** 공백을 제외한 값으로 호출된다. 닫기는 호출부가 성공 시점에 처리한다. */
  onSubmit: (value: string) => void | Promise<void>;
}

/**
 * 이름 하나를 입력받는 공용 팝업. window.prompt 대체용(폴더/워크스페이스 생성 등).
 * Enter 로 제출, Esc/취소로 닫힘. 빈 값은 제출할 수 없다.
 */
export function NameInputDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  defaultValue = '',
  submitLabel = '만들기',
  isPending = false,
  errorMessage,
  onSubmit,
}: NameInputDialogProps) {
  // State
  const [value, setValue] = useState(defaultValue);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Effects — 열릴 때마다 기본값으로 초기화하고 전체 선택
  useEffect(() => {
    if (!open) return;
    setValue(defaultValue);
    const id = window.setTimeout(() => inputRef.current?.select(), 0);
    return () => window.clearTimeout(id);
  }, [open, defaultValue]);

  // Functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isPending) return;
    void onSubmit(trimmed);
  };

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="mt-4">
            <Input
              ref={inputRef}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              aria-label={title}
            />
            {errorMessage && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!value.trim() || isPending}>
              {isPending ? '처리 중…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
