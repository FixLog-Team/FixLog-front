import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useDocumentLabels } from '@/domains/labels';
import { useRemoveDocumentLabel } from '@/features/labels/remove-label/hooks/use-remove-document-label';
import { AddLabelDialog } from '@/features/labels/add-label/ui/AddLabelDialog';

interface DocumentLabelsProps {
  documentId: string;
}

/**
 * 문서 상세의 태그 행(날짜 아래, 가로 표시).
 * - 태그가 있으면 태그 목록 + 우측 "편집"(파란색) 버튼을 보여준다.
 * - 편집 모드: 각 태그에 X(삭제) 버튼, 편집 버튼 좌측에 "추가" 버튼(직접 입력 팝업).
 * - 편집 버튼을 다시 누르면 편집 모드 종료.
 */
export function DocumentLabels({ documentId }: DocumentLabelsProps) {
  // Hooks
  const { data } = useDocumentLabels(documentId);
  const removeLabel = useRemoveDocumentLabel(documentId);

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Variables
  const labels = data ?? [];

  // 태그가 없고 편집 중도 아니면, 직접 추가할 수 있도록 "태그 추가" 버튼만 보여준다.
  // (요약을 하지 않아도 태그를 붙일 수 있게 함)
  if (labels.length === 0 && !isEditing) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-primary transition-colors hover:bg-muted"
        >
          <Plus className="size-3" />
          태그 추가
        </button>
        <AddLabelDialog open={addOpen} onOpenChange={setAddOpen} documentId={documentId} />
      </div>
    );
  }

  // Render
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {labels.map((label) => (
        <span
          key={label.labelId}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          {label.labelName}
          {isEditing && (
            <button
              type="button"
              onClick={() => removeLabel.mutate(label.labelId)}
              aria-label={`${label.labelName} 삭제`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}

      {isEditing && (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-primary transition-colors hover:bg-muted"
        >
          <Plus className="size-3" />
          추가
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsEditing((v) => !v)}
        className="ml-1 text-xs font-medium text-primary hover:underline"
      >
        편집
      </button>

      <AddLabelDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        documentId={documentId}
      />
    </div>
  );
}
