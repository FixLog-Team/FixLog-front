import { useEffect, useRef, useState } from "react";
import { koDateTime } from "@/shared/lib/date/format";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { PartialBlock } from "@blocknote/core";
import { AppShell } from "@/widgets/app-shell";
import { DocumentHeader } from "@/widgets/document-header/ui/DocumentHeader";
import {
  DocumentEditor,
  type DocumentEditorHandle,
} from "@/widgets/document-editor";
import { AiSummaryPanel } from "@/widgets/ai-summary-panel";
import { DocumentLabels } from "@/widgets/document-labels";
import { DocumentHistorySidePanel } from "@/widgets/document-history-side-panel";
import { Avatar } from "@/shared/ui/avatar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog";
import { useDocument } from "@/domains/documents";
import { useSession } from "@/domains/auth/hooks/use-session";
import { useWorkspaceRole } from "@/domains/workspaces";
import { useFolderTree } from "@/domains/folders";
import type { FolderPathItem, FolderTreeNode } from "@/domains/folders";
import { useSaveDocument } from "@/features/documents/save-document/hooks/use-save-document";
import { useDeleteDocument } from "@/features/documents/delete-document/hooks/use-delete-document";
import { useSummarizeDocument } from "@/features/ai/summarize-document/hooks/use-summarize-document";
import { useSuggestTags } from "@/features/ai/suggest-tags/hooks/use-suggest-tags";
import { TagSuggestionDialog } from "@/features/labels/add-label/ui/TagSuggestionDialog";
import { ShareDialog } from "@/features/sharing/share-resource/ui/ShareDialog";
import { blocksToPlainText } from "@/shared/lib/editor/blocks-to-plain-text";
import { ROUTES } from "@/shared/constants/routes";
import { isResourceAccessDeniedError } from "@/shared/lib/http/resource-access-error";

/** 폴더 트리에서 targetId 까지의 조상 경로를 찾는다(루트→대상). 없으면 null. */
function findFolderPath(
  nodes: FolderTreeNode[],
  targetId: string,
): FolderPathItem[] | null {
  for (const node of nodes) {
    const self: FolderPathItem = {
      folderId: node.folderId,
      folderName: node.folderName,
    };
    if (node.folderId === targetId) return [self];
    const childPath = findFolderPath(node.children, targetId);
    if (childPath) return [self, ...childPath];
  }
  return null;
}

/** 서버 blocks(JSON 문자열) → BlockNote 블록 배열. 빈/오류면 undefined(빈 문서). */
function parseBlocks(blocks: string | null): PartialBlock[] | undefined {
  if (!blocks) return undefined;
  try {
    const parsed = JSON.parse(blocks);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as PartialBlock[];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function formatUpdated(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return koDateTime(date);
}

export function DocumentEditorPage() {
  // Hooks
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef<DocumentEditorHandle>(null);
  const { data, error, isLoading, isError } = useDocument(documentId);
  const { data: folderTree } = useFolderTree();
  const { data: session } = useSession();
  const { isAdmin } = useWorkspaceRole();
  const save = useSaveDocument(documentId ?? "");
  const deleteDocument = useDeleteDocument();
  const summarize = useSummarizeDocument();
  const suggestTags = useSuggestTags();

  // State
  const [title, setTitle] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  // 복원 시에만 편집기를 리마운트해 되돌린 본문을 반영한다(저장 때마다 리마운트되면 커서가 초기화됨).
  const [restoreSeq, setRestoreSeq] = useState(0);

  // Effects — 문서 로드/전환 시 편집용 제목을 서버 값으로 동기화
  useEffect(() => {
    if (data) setTitle(data.title);
  }, [documentId, data?.title]);

  // Functions
  const handleSave = () => {
    const blocks = editorRef.current?.getBlocks();
    if (!blocks || !data) return;
    save.mutate(
      { title: title.trim() || "Untitled", blocks },
      {
        onError: (error) => {
          console.error("Failed to save document:", error);
          alert("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        },
      },
    );
  };

  const handleSummarize = async () => {
    const blocks = editorRef.current?.getBlocks();
    if (!blocks || !documentId) return;
    setSummaryOpen(true);
    summarize.reset();
    suggestTags.reset();
    const content = blocksToPlainText(blocks);
    try {
      // 서버가 DB 원문을 요약하므로 최신 본문 저장을 먼저 수행한다.
      await save.mutateAsync({ title: title.trim() || "Untitled", blocks });
      // 요약(패널)과 태그 제안(팝업)을 독립적으로 진행 — 한쪽 실패가 다른 쪽을 막지 않는다.
      summarize.mutateAsync(documentId).catch((error) => {
        console.error("AI summarize failed:", error);
      });
      if (content) {
        try {
          const tags = await suggestTags.mutateAsync(content);
          if (tags.length > 0) setTagDialogOpen(true);
        } catch (error) {
          console.error("AI tag suggestion failed:", error);
        }
      }
    } catch (error) {
      console.error("Failed to save before summarize:", error);
    }
  };

  // Render
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading document…</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !data || !documentId) {
    const errorMessage = isResourceAccessDeniedError(error)
      ? "문서에 접근할 권한이 없습니다."
      : "문서를 불러오지 못했습니다.";

    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      </AppShell>
    );
  }

  const ownerName = data.updateUser ?? data.createUser ?? "Unknown";
  // 삭제는 소유자(생성자) 또는 워크스페이스 관리자만.
  const canDelete =
    isAdmin || (!!session?.userId && data.createUser === session.userId);
  const ownerEmail = session?.email ?? null;

  // 진입 경로: 목록에서 넘겨준 state 우선, 없으면(새로고침/딥링크) folderId 로 트리에서 역산
  const statePath = (location.state as { folderPath?: FolderPathItem[] } | null)
    ?.folderPath;
  const folderPath: FolderPathItem[] =
    statePath ??
    (data.folderId && folderTree
      ? (findFolderPath(folderTree, data.folderId) ?? [])
      : []);

  const goToFolder = (path: FolderPathItem[]) => {
    navigate(ROUTES.DOCUMENTS, { state: { folderPath: path } });
  };

  const handleDelete = async () => {
    try {
      await deleteDocument.mutateAsync(documentId);
      goToFolder(folderPath);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const breadcrumb = [
    { label: "My Documents", onClick: () => goToFolder([]) },
    ...folderPath.map((item, index) => ({
      label: item.folderName,
      onClick: () => goToFolder(folderPath.slice(0, index + 1)),
    })),
    { label: data.title },
  ];

  return (
    <AppShell
      scroll={false}
      header={
        <DocumentHeader
          mode="detail"
          breadcrumb={breadcrumb}
          isFavorite={isFavorite}
          isSaving={save.isPending}
          isSaved={save.isSuccess}
          onToggleFavorite={() => setIsFavorite((v) => !v)}
          onSave={handleSave}
          onSummarize={handleSummarize}
          onShare={() => setShareOpen(true)}
          onHistory={() => setHistoryOpen((v) => !v)}
          isHistoryOpen={historyOpen}
          onDelete={() => setIsDeleteOpen(true)}
          canDelete={canDelete}
        />
      }
    >
      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col bg-card">
        {/* Title + meta */}
        <div className="mx-auto w-full max-w-4xl px-12 pt-12">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            aria-label="문서 제목"
            className="w-full bg-transparent text-[36px] font-semibold leading-tight tracking-[-0.022em] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Avatar name={ownerName} size="sm" />
              <span className="text-foreground">
                {ownerEmail ?? ownerName}
              </span>
            </span>
            {data.updateTime && (
              <span>Updated {formatUpdated(data.updateTime)}</span>
            )}
          </div>
          <DocumentLabels documentId={documentId} />
        </div>

        {/* Writing area — BlockNote */}
        <div className="min-h-0 flex-1">
          <DocumentEditor
            key={`${documentId}-${restoreSeq}`}
            ref={editorRef}
            initialBlocks={parseBlocks(data.blocks)}
          />
        </div>
      </div>

      {/* 버전 기록 패널 */}
      <DocumentHistorySidePanel
        open={historyOpen}
        documentId={documentId}
        currentTitle={data.title}
        currentUser={ownerEmail ?? ownerName}
        currentUpdateTime={data.updateTime}
        onClose={() => setHistoryOpen(false)}
        onRestored={(restored) => {
          setTitle(restored.title);
          setRestoreSeq((seq) => seq + 1);
        }}
      />

      {/* AI summary panel — 문서가 바뀌면 대화 문맥도 새로 시작하도록 key 로 재마운트 */}
      <AiSummaryPanel
        key={documentId}
        open={summaryOpen}
        isLoading={save.isPending || summarize.isPending}
        summary={summarize.data}
        isError={summarize.isError}
        onClose={() => setSummaryOpen(false)}
      />

      {/* AI 추천 태그 선택 → 라벨 추가 */}
      <TagSuggestionDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        documentId={documentId}
        suggestions={suggestTags.data ?? []}
      />

      {/* 공유 — 문서 목록의 공유 기능과 동일(ShareDialog) */}
      {documentId && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          kind="document"
          id={documentId}
          name={title || data?.title || '문서'}
        />
      )}

      {/* 삭제 확인 */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{data.title}&apos; 문서를 삭제합니다. 삭제된 문서는 복구할 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteDocument.isPending}
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
    </AppShell>
  );
}
