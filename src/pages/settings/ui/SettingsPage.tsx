import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, LogOut, Trash2, Share2, FileText, Folder, ChevronRight, X } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
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
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { ROUTES, documentDetailPath } from '@/shared/constants/routes';
import { useSession } from '@/domains/auth';
import { permissionsApi } from '@/domains/permissions';
import type { PermissionDto } from '@/domains/permissions';
import { documentsApi } from '@/domains/documents';
import type { DocumentDto } from '@/domains/documents';
import { foldersApi } from '@/domains/folders';
import type { FolderItem, FolderPathItem } from '@/domains/folders';
import { cn } from '@/shared/lib/utils/index';
import {
  useWorkspaces,
  useSecurityPolicy,
  useLeaveWorkspace,
  useDeleteWorkspace,
  useOwnerName,
} from '@/domains/workspaces';
import type { Workspace } from '@/domains/workspaces';

export function SettingsPage() {
  // Hooks
  const { data: workspaces } = useWorkspaces();

  // Variables
  const currentId = workspaceStorage.get();
  const currentWorkspace =
    workspaces?.find((w) => w.workspaceId === currentId) ??
    workspaces?.find((w) => w.personal) ??
    workspaces?.[0];
  const workspaceId = currentWorkspace?.workspaceId;

  // Render
  return (
    <AppShell header={<PageHeader title="워크스페이스 설정" />}>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* 현재 워크스페이스 */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            현재 워크스페이스
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {currentWorkspace?.workspaceName ?? '—'}
            </span>
            {currentWorkspace && (
              <Badge variant="published">
                {currentWorkspace.personal
                  ? '개인'
                  : currentWorkspace.role === 'OWNER'
                    ? '소유자'
                    : currentWorkspace.role === 'ADMIN'
                      ? '관리자'
                      : '구성원'}
              </Badge>
            )}
          </div>

          {currentWorkspace && (
            <WorkspaceLifecycleRow workspace={currentWorkspace} />
          )}
        </Card>

        <SharedResourcesCard />

        <SecurityPolicyCard workspaceId={workspaceId} />
      </div>
    </AppShell>
  );
}

/**
 * 공유 — 공유받은 문서(shared-with-me)와 내가 공유한 문서를 확인·회수한다.
 * "내가 공유한 목록" 전용 API 가 없어, 내 문서(최근 50개)의 권한을 조회해 도출한다(임시).
 * 회수는 DELETE /api/documents/{id}/permissions/{permissionId}.
 */
function SharedResourcesCard() {
  // Hooks
  const { data: session } = useSession();
  const myId = session?.userId;
  const queryClient = useQueryClient();

  const received = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => permissionsApi.sharedWithMe(),
  });

  const sharedByMe = useQuery({
    queryKey: ['shared-by-me', myId],
    enabled: !!myId,
    queryFn: async () => {
      const page = await documentsApi.list({ size: 50 });
      const mine = page.items.filter((d) => d.createUser === myId);
      const results = await Promise.all(
        mine.map(async (d) => {
          try {
            const perms = await permissionsApi.list('document', d.documentId);
            const grants = perms.filter((p) => p.principalId !== myId);
            return grants.length > 0 ? { doc: d, grants } : null;
          } catch {
            return null; // 소유자 아님 등 조회 불가는 건너뛴다.
          }
        })
      );
      return results.filter(
        (x): x is { doc: DocumentDto; grants: PermissionDto[] } => x !== null
      );
    },
  });

  const revoke = useMutation({
    mutationFn: ({ docId, permissionId }: { docId: string; permissionId: string }) =>
      permissionsApi.revoke('document', docId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-by-me'] });
      queryClient.invalidateQueries({ queryKey: ['shared-with-me'] });
    },
  });

  // 공유받은 폴더는 트리로 표시하고, 그 폴더에 속한 문서는 폴더를 펼쳤을 때 안에서 보이게 한다.
  // 반면 폴더가 없거나(folderId=null) 부모 폴더가 공유 목록에 없는(외부 공유) 문서는
  // 트리에 자리가 없으므로 수정 전처럼 루트에 따로 표시한다.
  const receivedFolders = received.data?.folders ?? [];
  const sharedFolderIds = new Set(receivedFolders.map((f) => f.folderId));
  const rootDocuments = (received.data?.documents ?? []).filter(
    (d) => d.folderId === null || !sharedFolderIds.has(d.folderId),
  );
  const receivedCount = receivedFolders.length + rootDocuments.length;
  const sharedItems = sharedByMe.data ?? [];

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Share2 className="size-4 text-primary" />
        공유
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        내가 공유했거나 공유받은 폴더·문서를 확인합니다.
      </p>

      {/* 공유받은 폴더·문서 */}
      <div className="mt-5">
        <h3 className="text-sm font-medium text-foreground">공유받은 폴더·문서</h3>
        {received.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">불러오는 중…</p>
        ) : received.isError ? (
          <p className="mt-2 text-sm text-muted-foreground">공유받은 항목을 불러올 수 없습니다.</p>
        ) : receivedCount === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">공유받은 폴더·문서가 없습니다.</p>
        ) : (
          <div className="mt-2 overflow-hidden rounded-lg border border-border">
            {receivedFolders.map((f) => (
              <SharedFolderNode
                key={f.folderId}
                folder={f}
                depth={0}
                path={[{ folderId: f.folderId, folderName: f.folderName }]}
              />
            ))}
            {rootDocuments.map((d) => (
              <SharedDocRow
                key={d.documentId}
                documentId={d.documentId}
                title={d.title}
                createUser={d.createUser}
                createUserName={d.createUserName}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* 내가 공유한 문서 */}
      <div className="mt-5">
        <h3 className="text-sm font-medium text-foreground">내가 공유한 문서</h3>
        {sharedByMe.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">불러오는 중…</p>
        ) : sharedByMe.isError ? (
          <p className="mt-2 text-sm text-muted-foreground">공유 현황을 불러올 수 없습니다.</p>
        ) : sharedItems.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">다른 사용자에게 공유한 문서가 없습니다.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {sharedItems.map(({ doc, grants }) => (
              <li key={doc.documentId} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <Link
                    to={documentDetailPath(doc.documentId)}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {doc.title || '제목 없음'}
                  </Link>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{grants.length}명</span>
                </div>
                <ul className="mt-2 space-y-1 pl-6">
                  {grants.map((g) => (
                    <li key={g.permissionId} className="flex items-center gap-2 text-xs">
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {g.principalName ?? g.principalId}
                        {g.principalType === 'GROUP' && (
                          <span className="ml-1 text-muted-foreground">(그룹)</span>
                        )}
                      </span>
                      <span className="text-success">
                        허용
                        {!g.canDownload && ' · 반출금지'}
                      </span>
                      <button
                        type="button"
                        onClick={() => revoke.mutate({ docId: doc.documentId, permissionId: g.permissionId })}
                        disabled={revoke.isPending}
                        aria-label={`${g.principalName ?? '대상'} 공유 회수`}
                        className="inline-flex shrink-0 items-center gap-0.5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                        회수
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          최근 문서 기준으로, 다른 사용자에게 권한을 부여한 문서만 표시합니다.
        </p>
      </div>
    </Card>
  );
}

/** 트리 들여쓰기(깊이별 좌측 여백). 토글 버튼 자리(size-5=20px)만큼 하위가 밀려 정렬된다. */
const treeIndent = (depth: number) => 12 + depth * 20;

/**
 * 공유받은 폴더 트리 노드. 좌측 토글(▶/▼) 버튼 또는 행의 빈 곳을 누르면 펼침/접힘이 되고,
 * 폴더 이름을 누르면 문서 목록 화면에서 해당 폴더를 연다(진입 경로를 state 로 전달).
 * 펼칠 때만 GET /api/folders/{id}/contents 로 하위 폴더·문서를 지연 로드한다.
 */
function SharedFolderNode({
  folder,
  depth,
  path,
}: {
  folder: FolderItem;
  depth: number;
  path: FolderPathItem[];
}) {
  // State
  const [expanded, setExpanded] = useState(false);

  // Hooks — 펼친 뒤에만 콘텐츠를 조회한다.
  const navigate = useNavigate();
  const contents = useQuery({
    queryKey: ['shared-folder-contents', folder.folderId],
    queryFn: () => foldersApi.getFolderContents(folder.folderId),
    enabled: expanded,
  });

  // Variables
  const childFolders = contents.data?.folders ?? [];
  const childDocs = contents.data?.documents ?? [];
  const isEmpty = childFolders.length === 0 && childDocs.length === 0;

  // Functions
  const toggle = () => setExpanded((v) => !v);
  // 폴더 이름 클릭: 문서 목록으로 이동하며 이 폴더까지의 경로를 함께 넘겨 그 폴더를 연다.
  const openFolder = () => navigate(ROUTES.DOCUMENTS, { state: { folderPath: path } });

  // Render
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={expanded}
        className="flex cursor-pointer items-center gap-2 py-2.5 pr-3 hover:bg-muted/40"
        style={{ paddingLeft: treeIndent(depth) }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-label={expanded ? '접기' : '펼치기'}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} />
        </button>
        <Folder className="size-4 shrink-0 text-muted-foreground" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openFolder();
          }}
          className="min-w-0 flex-1 truncate text-left text-sm text-foreground hover:underline"
        >
          {folder.folderName || '이름 없는 폴더'}
        </button>
      </div>

      {expanded && (
        <div>
          {contents.isLoading ? (
            <p className="py-2 text-xs text-muted-foreground" style={{ paddingLeft: treeIndent(depth + 1) }}>
              불러오는 중…
            </p>
          ) : contents.isError ? (
            <p className="py-2 text-xs text-muted-foreground" style={{ paddingLeft: treeIndent(depth + 1) }}>
              폴더 내용을 불러올 수 없습니다.
            </p>
          ) : isEmpty ? (
            <p className="py-2 text-xs text-muted-foreground" style={{ paddingLeft: treeIndent(depth + 1) }}>
              빈 폴더입니다.
            </p>
          ) : (
            <>
              {childFolders.map((f) => (
                <SharedFolderNode
                  key={f.folderId}
                  folder={f}
                  depth={depth + 1}
                  path={[...path, { folderId: f.folderId, folderName: f.folderName }]}
                />
              ))}
              {childDocs.map((d) => (
                <SharedDocRow
                  key={d.documentId}
                  documentId={d.documentId}
                  title={d.title}
                  createUser={d.createUser}
                  createUserName={d.createUserName}
                  depth={depth + 1}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 트리의 문서 리프. 토글 버튼 자리만큼 빈 여백을 두어 상위 폴더명과 아이콘이 정렬되게 한다.
 * 작성자는 응답의 createUserName 을 우선 쓰고(공유받은 문서 응답에만 포함), 없으면
 * createUser(userId)를 구성원 목록으로 이름 변환한다(폴더 콘텐츠 문서에는 createUserName 이 없음).
 */
function SharedDocRow({
  documentId,
  title,
  createUser,
  createUserName,
  depth,
}: {
  documentId: string;
  title: string;
  createUser?: string | null;
  createUserName?: string | null;
  depth: number;
}) {
  const resolveOwner = useOwnerName();
  const resolved = createUserName ?? resolveOwner(createUser);
  const author = resolved && resolved !== '—' ? resolved : null;

  return (
    <div
      className="flex items-center gap-2 py-2.5 pr-3 hover:bg-muted/40"
      style={{ paddingLeft: treeIndent(depth) }}
    >
      <span className="size-5 shrink-0" aria-hidden />
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <Link
        to={documentDetailPath(documentId)}
        className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
      >
        {title || '제목 없음'}
      </Link>
      {author && (
        <span className="shrink-0 text-xs text-muted-foreground">작성자 · {author}</span>
      )}
    </div>
  );
}

/**
 * 현재 워크스페이스 카드 하단 — 권한에 따라 "삭제하기"(소유자) 또는 "나가기"(관리자·구성원).
 * 개인 워크스페이스는 둘 다 불가(서버 규칙)라 안내만 보여준다. 실행 전 확인 팝업을 한 번 띄운다.
 */
function WorkspaceLifecycleRow({ workspace }: { workspace: Workspace }) {
  // Hooks
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const leave = useLeaveWorkspace();
  const remove = useDeleteWorkspace();

  // State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variables
  const isOwner = workspace.role === 'OWNER';
  const mutation = isOwner ? remove : leave;

  // Functions
  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      await mutation.mutateAsync(workspace.workspaceId);
      // 방금 떠난/지운 워크스페이스가 선택돼 있으면 개인 워크스페이스로 되돌린다.
      if (workspaceStorage.get() === workspace.workspaceId) workspaceStorage.clear();
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setConfirmOpen(false);
      navigate(ROUTES.WORKSPACE);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isOwner
            ? '워크스페이스 삭제에 실패했습니다. 서버가 아직 워크스페이스 삭제를 지원하지 않을 수 있습니다.'
            : '워크스페이스 나가기에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        )
      );
    }
  };

  // Render
  if (workspace.personal) {
    return (
      <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
        개인 워크스페이스는 삭제하거나 나갈 수 없습니다.
      </p>
    );
  }

  return (
    <>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? '워크스페이스를 삭제하면 안의 모든 문서·폴더와 멤버 구성이 함께 사라집니다.'
            : '나가면 이 워크스페이스의 문서에 더 이상 접근할 수 없습니다.'}
        </p>
        <Button
          size="sm"
          variant={isOwner ? 'destructive' : 'secondary'}
          className="shrink-0"
          onClick={() => {
            setErrorMessage(null);
            setConfirmOpen(true);
          }}
        >
          {isOwner ? <Trash2 /> : <LogOut />}
          {isOwner ? '워크스페이스 삭제하기' : '워크스페이스 나가기'}
        </Button>
      </div>

      {/* 확인 팝업(1회) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isOwner ? '워크스페이스를 삭제할까요?' : '워크스페이스에서 나갈까요?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{workspace.workspaceName}&apos;
              {isOwner
                ? ' 워크스페이스와 그 안의 모든 문서·폴더가 삭제되며 되돌릴 수 없습니다.'
                : ' 워크스페이스에서 나갑니다. 다시 참여하려면 관리자의 초대가 필요합니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant={isOwner ? 'destructive' : undefined}
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
            >
              {mutation.isPending ? '처리 중…' : isOwner ? '삭제' : '나가기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** 15. 보안 정책(제약 확인, 읽기 전용). */
function SecurityPolicyCard({ workspaceId }: { workspaceId?: string }) {
  const { data, isLoading, isError } = useSecurityPolicy(workspaceId);

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        보안 정책
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        이 워크스페이스에 적용된 제약입니다. 정책은 개별 권한·관리자 특권보다
        우선합니다.
      </p>
      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">불러오는 중…</p>
      ) : isError || !data ? (
        <p className="mt-3 text-sm text-muted-foreground">
          보안 정책을 불러올 수 없습니다.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          <PolicyRow label="공유 허용" allowed={data.allowSharing} />
          <PolicyRow label="다운로드 허용" allowed={data.allowDownload} />
          <PolicyValueRow
            label="감사 로그 보관"
            value={`${data.auditRetentionDays}일`}
          />
          <PolicyValueRow
            label="휴지통 보관"
            value={`${data.trashRetentionDays}일`}
          />
        </div>
      )}
    </Card>
  );
}

function PolicyRow({
  label,
  allowed,
  onLabel = '허용',
  offLabel = '금지',
}: {
  label: string;
  allowed: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      {allowed ? (
        <Badge variant="published">{onLabel}</Badge>
      ) : (
        <Badge variant="draft">{offLabel}</Badge>
      )}
    </div>
  );
}

function PolicyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
