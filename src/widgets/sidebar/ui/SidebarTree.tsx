import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { ROUTES, documentDetailPath } from '@/shared/constants/routes';
import { QUERY_KEYS } from '@/app/config/query-keys';
import { foldersApi } from '@/domains/folders';
import type { FolderItem, FolderPathItem } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';

/**
 * 사이드바 문서 트리(폴더 + 문서).
 *
 * 문서 페이지와 같은 소스(폴더 콘텐츠 API)와 같은 노출 규칙을 쓴다.
 * 폴더는 펼칠 때만 하위를 불러오고(lazy), 펼친 폴더 안은 문서 페이지처럼
 * 하위 폴더 → 문서 순서로 보여준다.
 */

/** 항목 노출 여부 판정. 문서 페이지의 isVisible 과 같은 규칙을 주입받는다. */
export type SidebarVisibility = (
  id: string,
  createUser: string | null,
  insideShared: boolean
) => boolean;

interface SidebarTreeProps {
  folders: FolderItem[];
  documents: DocumentDto[];
  isVisible: SidebarVisibility;
  /** 내게 공유된 폴더/문서 id. 공유 폴더 안쪽은 하위 전체가 보인다(폴더 공유 상속). */
  sharedIds: Set<string>;
}

/** 들여쓰기 — 깊이당 12px. */
const indentOf = (depth: number) => ({ paddingLeft: 10 + depth * 12 });

export function SidebarTree({
  folders,
  documents,
  isVisible,
  sharedIds,
}: SidebarTreeProps) {
  const visibleFolders = folders.filter((f) =>
    isVisible(f.folderId, f.createUser, false)
  );
  const visibleDocuments = documents.filter((d) =>
    isVisible(d.documentId, d.createUser, false)
  );

  if (visibleFolders.length === 0 && visibleDocuments.length === 0) {
    return (
      <p className="px-2.5 py-2 text-xs text-muted-foreground">비어 있습니다.</p>
    );
  }

  return (
    <>
      {visibleFolders.map((folder) => (
        <SidebarFolderNode
          key={folder.folderId}
          folder={folder}
          depth={0}
          path={[{ folderId: folder.folderId, folderName: folder.folderName }]}
          insideShared={sharedIds.has(folder.folderId)}
          isVisible={isVisible}
          sharedIds={sharedIds}
        />
      ))}
      {visibleDocuments.map((doc) => (
        <SidebarDocumentRow key={doc.documentId} document={doc} depth={0} path={[]} />
      ))}
    </>
  );
}

/** 폴더 한 줄 + (펼쳤을 때) 하위 항목. 화살표로 펼침/접힘, 이름 클릭으로 해당 폴더 열기. */
function SidebarFolderNode({
  folder,
  depth,
  path,
  insideShared,
  isVisible,
  sharedIds,
}: {
  folder: FolderItem;
  depth: number;
  path: FolderPathItem[];
  insideShared: boolean;
  isVisible: SidebarVisibility;
  sharedIds: Set<string>;
}) {
  const [open, setOpen] = useState(false);

  // 펼칠 때만 하위를 불러온다(문서 페이지와 같은 폴더 콘텐츠 API).
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.folders.contents(folder.folderId),
    queryFn: () => foldersApi.getFolderContents(folder.folderId),
    enabled: open,
  });

  // 공유받은 폴더 안으로 들어오면 그 하위는 모두 보인다(폴더 공유 상속).
  const childInsideShared = insideShared || sharedIds.has(folder.folderId);
  const childFolders = (data?.folders ?? []).filter((f) =>
    isVisible(f.folderId, f.createUser, childInsideShared)
  );
  const childDocuments = (data?.documents ?? []).filter((d) =>
    isVisible(d.documentId, d.createUser, childInsideShared)
  );
  const isEmpty = childFolders.length === 0 && childDocuments.length === 0;

  return (
    <>
      <div
        style={indentOf(depth)}
        className="flex items-center gap-1 rounded-lg pr-1 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? `${folder.folderName} 접기` : `${folder.folderName} 펼치기`}
          aria-expanded={open}
          className="shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <Link
          to={ROUTES.DOCUMENTS}
          // 문서 페이지가 이 경로를 읽어 해당 폴더를 연다.
          state={{ folderPath: path }}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5"
        >
          <Folder className="size-[18px] shrink-0 text-primary" />
          <span className="truncate">{folder.folderName}</span>
        </Link>
      </div>

      {open && (
        <>
          {isLoading ? (
            <p
              style={indentOf(depth + 1)}
              className="py-1 text-xs text-muted-foreground"
            >
              불러오는 중…
            </p>
          ) : isEmpty ? (
            <p
              style={indentOf(depth + 1)}
              className="py-1 text-xs text-muted-foreground"
            >
              비어 있습니다.
            </p>
          ) : (
            <>
              {childFolders.map((child) => (
                <SidebarFolderNode
                  key={child.folderId}
                  folder={child}
                  depth={depth + 1}
                  path={[
                    ...path,
                    { folderId: child.folderId, folderName: child.folderName },
                  ]}
                  insideShared={childInsideShared}
                  isVisible={isVisible}
                  sharedIds={sharedIds}
                />
              ))}
              {childDocuments.map((doc) => (
                <SidebarDocumentRow
                  key={doc.documentId}
                  document={doc}
                  depth={depth + 1}
                  path={path}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}

/** 문서 한 줄. 클릭 시 에디터로 이동하며, 진입 경로(folderPath)를 함께 넘겨 breadcrumb 를 유지한다. */
function SidebarDocumentRow({
  document,
  depth,
  path,
}: {
  document: DocumentDto;
  depth: number;
  path: FolderPathItem[];
}) {
  return (
    <Link
      to={documentDetailPath(document.documentId)}
      state={{ folderPath: path }}
      style={indentOf(depth)}
      className="flex items-center gap-2 rounded-lg py-1.5 pr-1 text-sm text-foreground transition-colors hover:bg-muted"
    >
      {/* 화살표 자리만큼 띄워 폴더 행과 아이콘 위치를 맞춘다. */}
      <span aria-hidden className="size-4 shrink-0" />
      <FileText className="size-[18px] shrink-0 text-muted-foreground" />
      <span className="truncate">{document.title}</span>
    </Link>
  );
}
