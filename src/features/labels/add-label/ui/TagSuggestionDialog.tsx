import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils/index';
import { useAddDocumentLabel } from '@/features/labels/add-label/hooks/use-add-document-label';

interface TagSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  /** AI(/ai/tags)가 제안한 태그들. */
  suggestions: string[];
}

/**
 * AI 추천 태그 선택 팝업. 요약과 함께 받은 태그 제안을 보여주고,
 * 사용자가 고른 것만 태그로 문서에 추가한다(POST /api/documents/{id}/labels).
 */
export function TagSuggestionDialog({
  open,
  onOpenChange,
  documentId,
  suggestions,
}: TagSuggestionDialogProps) {
  // Hooks
  const addLabel = useAddDocumentLabel(documentId);

  // State
  const [selected, setSelected] = useState<string[]>([]);

  // Effects — 열릴 때 제안 태그를 기본 전체 선택으로 초기화
  useEffect(() => {
    if (open) setSelected(suggestions);
  }, [open, suggestions]);

  // Functions
  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = async () => {
    if (selected.length === 0) {
      onOpenChange(false);
      return;
    }
    try {
      await Promise.all(selected.map((name) => addLabel.mutateAsync(name)));
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add labels:', error);
    }
  };

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 추천 태그</DialogTitle>
          <DialogDescription>
            요약과 함께 추천된 태그입니다. 문서에 추가할 태그를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {suggestions.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            추천된 태그가 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 py-2">
            {suggestions.map((tag) => {
              const isSelected = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  aria-pressed={isSelected}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  )}
                >
                  {isSelected && <Check className="size-3.5" />}
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={addLabel.isPending || selected.length === 0}
          >
            {addLabel.isPending ? '추가 중…' : `추가 (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
