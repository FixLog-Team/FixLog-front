import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { PartialBlock } from "@blocknote/core";
import { AppShell } from "@/widgets/app-shell";
import { DocumentHeader } from "@/widgets/document-header/ui/DocumentHeader";
import {
  DocumentEditor,
  type DocumentEditorHandle,
} from "@/widgets/document-editor";
import { AiSummaryPanel } from "@/widgets/ai-summary-panel";
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
import { useFolderTree } from "@/domains/folders";
import type { FolderPathItem, FolderTreeNode } from "@/domains/folders";
import { useSaveDocument } from "@/features/documents/save-document/hooks/use-save-document";
import { useDeleteDocument } from "@/features/documents/delete-document/hooks/use-delete-document";
import { useSummarizeDocument } from "@/features/ai/summarize-document/hooks/use-summarize-document";
import { ROUTES } from "@/shared/constants/routes";

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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentEditorPage() {
  // Hooks
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef<DocumentEditorHandle>(null);
  const { data, isLoading, isError } = useDocument(documentId);
  const { data: folderTree } = useFolderTree();
  const save = useSaveDocument(documentId ?? "");
  const deleteDocument = useDeleteDocument();
  const summarize = useSummarizeDocument();

  // State
  const [title, setTitle] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    try {
      // 서버가 DB 원문을 요약하므로 최신 본문 저장을 먼저 수행한다.
      await save.mutateAsync({ title: title.trim() || "Untitled", blocks });
      await summarize.mutateAsync(documentId);
    } catch (error) {
      console.error("AI summarize failed:", error);
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
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">문서를 불러오지 못했습니다.</p>
        </div>
      </AppShell>
    );
  }

  const owner = data.updateUser ?? data.createUser ?? "Unknown";

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
          onDelete={() => setIsDeleteOpen(true)}
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
              <Avatar name={owner} size="sm" />
              <span className="text-foreground">{owner}</span>
            </span>
            {data.updateTime && (
              <span>Updated {formatUpdated(data.updateTime)}</span>
            )}
          </div>
        </div>

        {/* Writing area — BlockNote */}
        <div className="min-h-0 flex-1">
          <DocumentEditor
            key={documentId}
            ref={editorRef}
            initialBlocks={parseBlocks(data.blocks)}
          />
        </div>
      </div>

      {/* AI summary panel */}
      <AiSummaryPanel
        open={summaryOpen}
        isLoading={save.isPending || summarize.isPending}
        summary={summarize.data}
        isError={summarize.isError}
        onClose={() => setSummaryOpen(false)}
      />

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
