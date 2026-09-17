import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, LogOut, Trash2, Share2, FileText, X } from 'lucide-react';
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
import {
  useWorkspaces,
  useSecurityPolicy,
  useLeaveWorkspace,
  useDeleteWorkspace,
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

  const receivedItems = received.data ?? [];
  const sharedItems = sharedByMe.data ?? [];

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Share2 className="size-4 text-primary" />
        공유
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        내가 공유했거나 공유받은 문서를 확인합니다.
      </p>

      {/* 공유받은 문서 */}
      <div className="mt-5">
        <h3 className="text-sm font-medium text-foreground">공유받은 문서</h3>
        {received.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">불러오는 중…</p>
        ) : received.isError ? (
          <p className="mt-2 text-sm text-muted-foreground">공유받은 문서를 불러올 수 없습니다.</p>
        ) : receivedItems.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">공유받은 문서가 없습니다.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {receivedItems.map((d) => (
              <SharedRow key={d.documentId} doc={d} />
            ))}
          </ul>
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
                      <span className={g.permissionType === 'DENY' ? 'text-destructive' : 'text-success'}>
                        {g.permissionType === 'DENY' ? '차단' : '허용'}
                        {g.permissionType === 'ALLOW' && !g.canDownload && ' · 반출금지'}
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

function SharedRow({ doc }: { doc: DocumentDto }) {
  return (
    <li className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40">
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <Link
        to={documentDetailPath(doc.documentId)}
        className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
      >
        {doc.title || '제목 없음'}
      </Link>
    </li>
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
