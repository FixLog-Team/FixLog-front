import { koDateTime } from '@/shared/lib/date/format';
import { History, X, RotateCcw, PenLine } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils/index';
import { useDocumentHistories } from '@/features/documents/restore-document/hooks/use-document-histories';

/** 패널이 페이지로 올려보내는 선택 버전. 페이지가 본문 미리보기와 복원에 쓴다. */
export interface HistoryVersionRef {
  historyId: string;
  /** 목록에 표시되는 버전 번호(오래된 것이 1). 미리보기 배너에서도 같은 번호를 쓴다. */
  versionNo: number;
  title: string;
  createTime: string | null;
}

interface DocumentHistorySidePanelProps {
  open: boolean;
  documentId: string;
  /** 목록 맨 위에 "현재 버전"으로 표시할 문서의 현재 상태 */
  currentTitle: string;
  currentUser: string | null;
  currentUpdateTime: string | null;
  /** 지금 좌측 본문에 미리보기 중인 버전. null 이면 현재 버전을 보고 있다. */
  preview: HistoryVersionRef | null;
  isRestoring: boolean;
  /** 버전 선택/해제. null 이면 현재 버전으로 돌아간다. */
  onPreview: (version: HistoryVersionRef | null) => void;
  /** 복원 확인 대화상자를 연다(실제 복원은 페이지가 수행). */
  onRestoreRequest: () => void;
  onClose: () => void;
}

/**
 * 문서 에디터 우측 "버전 기록" 사이드 패널.
 * 서버 히스토리(/api/documents/{id}/history) 목록을 최신순으로 보여주고, 선택한 버전을
 * 페이지에 알려 좌측 본문에서 읽기 전용으로 미리보게 한다(패널 안에서는 본문을 보여주지 않는다).
 * 히스토리는 저장 시점의 스냅샷이며, 문서 정보로 합성한 "현재 버전" 카드를 맨 위에 둔다.
 * (버전 비교(diff) UI는 1차 MVP 범위에서 제외)
 */
export function DocumentHistorySidePanel({
  open,
  documentId,
  currentTitle,
  currentUser,
  currentUpdateTime,
  preview,
  isRestoring,
  onPreview,
  onRestoreRequest,
  onClose,
}: DocumentHistorySidePanelProps) {
  // Hooks
  const history = useDocumentHistories(documentId, open);

  // Variables
  const versions = history.data ?? [];

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
          aria-label="패널 닫기"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {/* 현재 버전 — 히스토리에는 지나간 버전만 있으므로 문서 정보로 맨 위에 합성 */}
        <button
          type="button"
          onClick={() => onPreview(null)}
          aria-current={preview === null}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
            preview === null
              ? 'border-primary/40 bg-accent/40'
              : 'border-border hover:bg-muted'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {currentTitle || '제목 없음'}
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              현재 버전
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground" title={formatAbsoluteTime(currentUpdateTime)}>
            {formatRelativeTime(currentUpdateTime)}
            {currentUser ? ` · ${currentUser}` : ''}
          </p>
        </button>

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
              아직 이전 버전이 없습니다. 문서를 저장하면 그 시점의 내용이 여기에 쌓여요.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {versions.map((version, index) => {
                const isSelected = version.historyId === preview?.historyId;
                const versionNo = versions.length - index;
                const newerTitle = index === 0 ? currentTitle : versions[index - 1].title;
                const titleChanged = version.title !== newerTitle;
                return (
                  <li key={version.historyId}>
                    <button
                      type="button"
                      onClick={() =>
                        onPreview(
                          isSelected
                            ? null
                            : {
                                historyId: version.historyId,
                                versionNo,
                                title: version.title,
                                createTime: version.createTime,
                              }
                        )
                      }
                      aria-current={isSelected}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-accent/60'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {/* 상대 시간 + 배지 */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-xs font-medium text-muted-foreground"
                          title={formatAbsoluteTime(version.createTime)}
                        >
                          <span className="mr-1.5 tabular-nums text-foreground/70">v{versionNo}</span>
                          {formatRelativeTime(version.createTime)}
                        </span>
                        {titleChanged && (
                          <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            <PenLine className="size-3" />
                            제목 변경
                          </span>
                        )}
                      </div>
                      {/* 제목 */}
                      <p className="mt-1.5 truncate text-sm text-foreground">
                        {version.title || '제목 없음'}
                      </p>
                      {version.createUser && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {version.createUser}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Restore action */}
      {preview !== null && (
        <div className="border-t border-border p-4">
          <Button className="w-full" disabled={isRestoring} onClick={onRestoreRequest}>
            <RotateCcw />
            {isRestoring ? '복원 중…' : `v${preview.versionNo} 내용으로 복원`}
          </Button>
        </div>
      )}
    </aside>
  );
}

/** 상대 시간 표시. 최근이면 "n분 전", 오래되면 절대 시간. */
function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return koDateTime(date);
}

/** 툴팁용 절대 시간. */
function formatAbsoluteTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return koDateTime(date);
}
