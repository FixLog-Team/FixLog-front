import { useState } from 'react';
import { History, X, RotateCcw } from 'lucide-react';
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
import { cn } from '@/shared/lib/utils/index';
import { useDocumentHistory } from '@/features/documents/restore-document/hooks/use-document-history';
import { useDocumentHistoryVersion } from '@/features/documents/restore-document/hooks/use-document-history-version';
import { useRestoreDocument } from '@/features/documents/restore-document/hooks/use-restore-document';
import type { DocumentDto } from '@/domains/documents';

/** 미리보기에 표시할 최대 줄 수. 패널이 좁아 앞부분만 보여준다. */
const PREVIEW_MAX_LINES = 12;

interface DocumentHistorySidePanelProps {
  open: boolean;
  documentId: string;
  /** 목록 맨 위에 "현재 버전"으로 표시할 문서의 현재 상태 */
  currentTitle: string;
  currentUser: string | null;
  currentUpdateTime: string | null;
  onClose: () => void;
  /** 복원 성공 시 편집기 내용을 갱신하도록 페이지에 알린다. */
  onRestored: (restored: DocumentDto) => void;
}

/**
 * 문서 에디터 우측 "버전 기록" 사이드 패널.
 * (페이지용 목록 위젯 document-history-panel 과는 별개 컴포넌트)
 * 지나간 버전 목록 → 선택 시 본문 미리보기 → 해당 버전으로 복원까지 처리한다.
 * (버전 비교(diff) UI는 1차 MVP 범위에서 제외)
 */
export function DocumentHistorySidePanel({
  open,
  documentId,
  currentTitle,
  currentUser,
  currentUpdateTime,
  onClose,
  onRestored,
}: DocumentHistorySidePanelProps) {
  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Hooks
  const history = useDocumentHistory(documentId, open);
  const selectedVersion = useDocumentHistoryVersion(documentId, selectedId);
  const restore = useRestoreDocument(documentId);

  // Variables
  const versions = history.data?.items ?? [];
  const previewLines = blocksToLines(selectedVersion.data?.blocks ?? null);

  // Functions
  const handleSelect = (historyId: string) => {
    setSelectedId((current) => (current === historyId ? null : historyId));
  };

  const handleRestore = () => {
    if (!selectedId) return;
    restore.mutate(selectedId, {
      onSuccess: (restored) => {
        setIsConfirmOpen(false);
        setSelectedId(null);
        onRestored(restored);
      },
      onError: (error) => {
        console.error('Failed to restore document version:', error);
        setIsConfirmOpen(false);
        alert('복원에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  // Render
  if (!open) return null;

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="size-4 text-primary" />
          버전 기록
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {/* 현재 버전 — 히스토리에는 지나간 버전만 있으므로 문서 정보로 맨 위에 합성 */}
        <div className="rounded-lg border border-primary/40 bg-accent/40 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {currentTitle || '제목 없음'}
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              현재 버전
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatVersionTime(currentUpdateTime)}
            {currentUser ? ` · ${currentUser}` : ''}
          </p>
        </div>

        {/* 지나간 버전 목록 */}
        <div className="mt-4">
          {history.isLoading ? (
            <div className="flex items-center gap-2.5 py-3 text-sm text-muted-foreground">
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              <span>불러오는 중…</span>
            </div>
          ) : history.isError ? (
            <p className="py-3 text-sm text-muted-foreground">
              버전 기록을 불러오지 못했습니다.
            </p>
          ) : versions.length === 0 ? (
            <p className="py-3 text-sm leading-relaxed text-muted-foreground">
              아직 이전 버전이 없습니다. 문서를 저장하면 저장 직전 내용이 여기에 쌓여요.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {versions.map((version) => {
                const isSelected = version.historyId === selectedId;
                return (
                  <li key={version.historyId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(version.historyId)}
                      aria-expanded={isSelected}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-accent/60'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-foreground">
                          {version.title || '제목 없음'}
                        </span>
                        {version.source === 'RESTORE' && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            복원됨
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatVersionTime(version.createTime)}
                        {version.createUser ? ` · ${version.createUser}` : ''}
                      </p>
                    </button>

                    {/* 선택한 버전 미리보기 */}
                    {isSelected && (
                      <div className="mt-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                        {selectedVersion.isLoading ? (
                          <p className="text-xs text-muted-foreground">미리보기 불러오는 중…</p>
                        ) : selectedVersion.isError ? (
                          <p className="text-xs text-muted-foreground">
                            미리보기를 불러오지 못했습니다.
                          </p>
                        ) : previewLines.length === 0 ? (
                          <p className="text-xs italic text-muted-foreground">빈 문서</p>
                        ) : (
                          <div className="space-y-1">
                            {previewLines.map((line, index) => (
                              <p
                                key={index}
                                className="truncate text-xs leading-relaxed text-foreground"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Restore action */}
      {selectedId && (
        <div className="border-t border-border p-4">
          <Button
            className="w-full"
            disabled={restore.isPending || selectedVersion.isLoading}
            onClick={() => setIsConfirmOpen(true)}
          >
            <RotateCcw />
            {restore.isPending ? '복원 중…' : '이 버전으로 복원'}
          </Button>
        </div>
      )}

      {/* 복원 확인 */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 버전으로 복원할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              현재 내용은 새로운 버전으로 기록되므로, 복원 후에도 다시 되돌릴 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={restore.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleRestore();
              }}
            >
              복원
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

/** BlockNote 블록 JSON 문자열에서 미리보기용 텍스트 줄을 뽑는다. */
function blocksToLines(blocksJson: string | null): string[] {
  if (!blocksJson) return [];
  try {
    const parsed = JSON.parse(blocksJson);
    if (!Array.isArray(parsed)) return [];
    const lines: string[] = [];
    for (const block of parsed) {
      if (lines.length >= PREVIEW_MAX_LINES) break;
      const text = inlineText((block as { content?: unknown })?.content).trim();
      if (text) lines.push(text);
    }
    return lines;
  } catch {
    return [];
  }
}

/** BlockNote inline content 배열에서 순수 텍스트만 이어붙인다. */
function inlineText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((node) => {
      const text = (node as { text?: unknown })?.text;
      return typeof text === 'string' ? text : '';
    })
    .join('');
}

function formatVersionTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
