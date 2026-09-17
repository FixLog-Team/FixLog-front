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
import { useDocument, useFavorites, useToggleFavorite } from "@/domains/documents";
import { useSession } from "@/domains/auth/hooks/use-session";
import { useWorkspaceRole, useOwnerName } from "@/domains/workspaces";
import { useFolderTree } from "@/domains/folders";
import type { FolderPathItem, FolderTreeNode } from "@/domains/folders";
import { useSaveDocument } from "@/features/documents/save-document/hooks/use-save-document";
import { useDeleteDocument } from "@/features/documents/delete-document/hooks/use-delete-document";
import { useDownloadDocument } from "@/features/documents/download-document/hooks/use-download-document";
import { useSummarizeDocument } from "@/features/ai/summarize-document/hooks/use-summarize-document";
import { useSuggestTags } from "@/features/ai/suggest-tags/hooks/use-suggest-tags";
import { TagSuggestionDialog } from "@/features/labels/add-label/ui/TagSuggestionDialog";
import { ShareDialog } from "@/features/sharing/share-resource/ui/ShareDialog";
import { blocksToPlainText } from "@/shared/lib/editor/blocks-to-plain-text";
import { toast } from "@/shared/ui/toast";
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
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { data: folderTree } = useFolderTree();
  const { data: session } = useSession();
  const { isAdmin } = useWorkspaceRole();
  const resolveOwner = useOwnerName();
  const save = useSaveDocument(documentId ?? "");
  const deleteDocument = useDeleteDocument();
  const downloadDocument = useDownloadDocument();
  const summarize = useSummarizeDocument();
  const suggestTags = useSuggestTags();

  // State
  const [title, setTitle] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  // 복원 시에만 편집기를 리마운트해 되돌린 본문을 반영한다(저장 때마다 리마운트되면 커서가 초기화됨).
  const [restoreSeq, setRestoreSeq] = useState(0);
  // Ctrl/Cmd+S 콜백이 stale 클로저 없이 최신 저장을 호출하도록 ref 로 보관.
  const saveNowRef = useRef<() => void>(() => {});

  // Effects — 문서 로드/전환 시 편집용 제목을 서버 값으로 동기화
  useEffect(() => {
    if (data) setTitle(data.title);
  }, [documentId, data?.title]);

  // Ctrl/Cmd + S 로 저장(브라우저 기본 저장 팝업 방지).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveNowRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Functions
  // 현재 편집 내용을 저장(완료까지 await). 성공 여부를 반환하고, showToast=true 면 성공 토스트.
  const persist = async (showToast = false): Promise<boolean> => {
    const blocks = editorRef.current?.getBlocks();
    if (!blocks || !data) return true; // 저장할 내용이 없으면 통과
    try {
      await save.mutateAsync({ title: title.trim() || "Untitled", blocks });
      if (showToast) toast.success("문서를 저장했어요.");
      return true;
    } catch (error) {
      console.error("Failed to save document:", error);
      return false;
    }
  };

  const handleSave = async () => {
    const ok = await persist(true);
    if (!ok) alert("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };
  // Ctrl/Cmd+S 콜백이 최신 handleSave 를 호출하도록 매 렌더 갱신.
  saveNowRef.current = handleSave;

  // 공유: 최신 내용을 먼저 저장한 뒤 공유 대화상자를 연다.
  const handleShare = async () => {
    await persist();
    setShareOpen(true);
  };

  const handleSummarize = async () => {
    if (!documentId) return;
    setSummaryOpen(true);
    summarize.reset();
    suggestTags.reset();
    // 서버가 DB 원문을 요약하므로 최신 본문 저장을 먼저 완료한다.
    const ok = await persist();
    if (!ok) return;
    const blocks = editorRef.current?.getBlocks();
    const content = blocks ? blocksToPlainText(blocks) : "";
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
  };

  // Render
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">문서를 불러오는 중…</p>
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

  // 소유자는 생성자(createUser). userId 를 구성원 목록으로 실제 이름으로 변환한다.
  const ownerName = resolveOwner(data.createUser);
  // 즐겨찾기 여부는 즐겨찾기 목록에 이 문서가 있는지로 판단.
  const isFavorite = !!favorites?.some((d) => d.documentId === documentId);
  // 삭제는 소유자(생성자) 또는 워크스페이스 관리자만.
  const canDelete =
    isAdmin || (!!session?.userId && data.createUser === session.userId);

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

  // 문서 PDF 다운로드(GET /api/documents/{id}/download). 최신 내용을 먼저 저장한 뒤 다운로드.
  const handleDownload = async () => {
    const ok = await persist();
    if (!ok) {
      alert("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    try {
      await downloadDocument.mutateAsync({
        documentId,
        title: title.trim() || data.title,
      });
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
          isFavoritePending={toggleFavorite.isPending}
          isSaving={save.isPending}
          onToggleFavorite={() =>
            toggleFavorite.mutate({ documentId, favorite: !isFavorite })
          }
          onSave={handleSave}
          onSummarize={handleSummarize}
          onShare={handleShare}
          onDownload={handleDownload}
          isDownloading={downloadDocument.isPending}
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
                {ownerName}
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
        currentUser={ownerName}
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
              &apos;{data.title}&apos; 문서를 삭제합니다. 삭제한 문서는 휴지통으로
              이동하며, 휴지통에서 복원할 수 있습니다.
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
