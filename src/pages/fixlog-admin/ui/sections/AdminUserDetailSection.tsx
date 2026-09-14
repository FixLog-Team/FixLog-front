import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserMinus, ShieldCheck, ShieldX } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
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
import { adminPath } from '@/shared/constants/routes';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { useSession } from '@/domains/auth/hooks/use-session';
import {
  useChangeMemberRole,
  useRemoveMember,
} from '@/domains/workspaces';
import type { Workspace, WorkspaceRole } from '@/domains/workspaces';
import { useAdminUser, useAdminUserAccess, useAdminAuditLogs } from '@/domains/admin';
import type { AdminEffectivePermission, AdminPermissionSource, AdminUser } from '@/domains/admin';
import {
  ROLE_LABEL,
  ACTION_LABEL,
  USER_STATUS_LABEL,
  assignableRoles,
  isRoleLocked,
  formatDate,
  formatDateTime,
  selectClass,
  SectionTitle,
  Notice,
  Table,
  THead,
  Th,
  Td,
  StatusText,
  ResourceCell,
  RoleBadge,
} from '@/pages/fixlog-admin/ui/shared';

type Tab = 'profile' | 'access' | 'activity';
const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'access', label: '접근 권한' },
  { key: 'activity', label: '활동' },
];

/** User Detail — Profile(역할/상태) · Access(접근 가능한 리소스와 출처) · Activity(감사 로그). */
export function AdminUserDetailSection({ workspace }: { workspace: Workspace }) {
  // Hooks
  const { userId = '' } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: user, isLoading, isError } = useAdminUser(workspace.workspaceId, userId);

  // Variables
  const tab = (searchParams.get('tab') as Tab | null) ?? 'profile';

  // Render
  if (isLoading) return <StatusText>불러오는 중…</StatusText>;
  if (isError || !user) {
    return (
      <div>
        <BackLink />
        <StatusText>이 워크스페이스에서 사용자를 찾을 수 없습니다.</StatusText>
      </div>
    );
  }

  return (
    <div>
      <BackLink />
      <SectionTitle
        title={user.userName}
        description={user.email}
        action={<RoleBadge role={user.role} />}
      />

      <div className="mb-5 flex gap-1 border-b border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSearchParams(key === 'profile' ? {} : { tab: key })}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm transition-colors',
              tab === key
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab workspace={workspace} member={user} />}
      {tab === 'access' && <AccessTab workspace={workspace} member={user} />}
      {tab === 'activity' && <ActivityTab workspace={workspace} member={user} />}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to={adminPath('users')}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      구성원
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                               */
/* ------------------------------------------------------------------ */

function ProfileTab({ workspace, member }: { workspace: Workspace; member: AdminUser }) {
  // Hooks
  const navigate = useNavigate();
  const { data: session } = useSession();
  const changeRole = useChangeMemberRole(workspace.workspaceId);
  const removeMember = useRemoveMember(workspace.workspaceId);

  // State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Variables
  const isSelf = member.userId === session?.userId;

  // Functions
  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync(member.userId);
      navigate(adminPath('users'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '멤버 제거에 실패했습니다.'));
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.userName} size="md" />
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">{member.userName}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <Field label="워크스페이스 역할">
            <select
              value={member.role}
              disabled={isSelf || isRoleLocked(member.role) || changeRole.isPending}
              onChange={(e) =>
                changeRole.mutate(
                  { userId: member.userId, role: e.target.value as WorkspaceRole },
                  {
                    onError: (error) => setErrorMessage(getApiErrorMessage(error, '역할 변경에 실패했습니다.')),
                    onSuccess: () => setErrorMessage(null),
                  }
                )
              }
              className={cn(selectClass, 'h-8')}
              aria-label="워크스페이스 역할"
            >
              {assignableRoles(member.role).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            {isSelf ? (
              <p className="mt-1 text-xs text-muted-foreground">자기 자신의 역할은 바꿀 수 없습니다.</p>
            ) : isRoleLocked(member.role) ? (
              <p className="mt-1 text-xs text-muted-foreground">소유자는 워크스페이스 생성자만 가질 수 있습니다.</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">초대된 구성원은 최대 관리자까지 승격할 수 있습니다.</p>
            )}
          </Field>
          <Field label="상태">
            {member.userStatus === 'ACTIVE' ? (
              <Badge variant="published">{USER_STATUS_LABEL.ACTIVE}</Badge>
            ) : (
              <Badge variant="draft">{USER_STATUS_LABEL[member.userStatus]}</Badge>
            )}
          </Field>
          <Field label="가입일">{formatDate(member.joinedAt)}</Field>
          <Field label="마지막 로그인">
            {member.lastLoginAt ? formatDateTime(member.lastLoginAt) : '기록 없음'}
          </Field>
          <Field label="사용자 ID">
            <span className="font-mono text-xs text-muted-foreground">{member.userId}</span>
          </Field>
        </dl>
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <p className="text-sm text-muted-foreground">
          워크스페이스에서 제거하면 이 사용자에게 부여된 공유 권한이 더 이상 유효하지 않습니다.
        </p>
        <Button
          variant="destructive"
          size="sm"
          disabled={isSelf}
          onClick={() => setConfirmOpen(true)}
          className="shrink-0"
        >
          <UserMinus />
          워크스페이스에서 제거
        </Button>
      </Card>
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버를 제거할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{member.userName}&apos;을 &apos;{workspace.workspaceName}&apos;에서 제거합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeMember.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleRemove();
              }}
            >
              제거
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-foreground">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Access — 최종 권한 + 출처                                             */
/* ------------------------------------------------------------------ */

const SOURCE_LABEL: Record<AdminPermissionSource, string> = {
  DIRECT: '직접',
  INHERITED: '상속',
  WORKSPACE_DEFAULT: '워크스페이스 기본',
};

function AccessTab({ workspace, member }: { workspace: Workspace; member: AdminUser }) {
  // Hooks — 상속·기본값까지 반영된 유효 접근(GET /admin/users/{userId}/access)
  const access = useAdminUserAccess(workspace.workspaceId, member.userId);

  // Variables
  const isPrivileged = member.role === 'ADMIN' || member.role === 'OWNER';
  // 접근 가능(허용)한 것을 위로 정렬해 보기 쉽게 한다.
  const rows = [...(access.data ?? [])].sort((a, b) => Number(b.access) - Number(a.access));
  const allowedCount = rows.filter((r) => r.access).length;

  if (access.isLoading) return <StatusText>불러오는 중…</StatusText>;
  if (access.isError) return <StatusText>유효 접근 정보를 불러올 수 없습니다. (관리자만 조회 가능)</StatusText>;

  return (
    <div className="space-y-4">
      {isPrivileged && (
        <Notice tone="warn">
          이 사용자는 <b>{ROLE_LABEL[member.role]}</b>이므로 개별 권한과 무관하게 워크스페이스의 모든 폴더·문서에 접근할
          수 있습니다(관리자 특권).
        </Notice>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3 text-sm text-muted-foreground">
          <span>상속·워크스페이스 기본값까지 반영된 <b className="text-foreground">유효 접근</b>입니다.</span>
          <span className="shrink-0 text-xs">
            접근 가능 <b className="text-success">{allowedCount}</b> / 전체 {rows.length}
          </span>
        </div>
        {rows.length === 0 ? (
          <StatusText>표시할 리소스가 없습니다.</StatusText>
        ) : (
          <Table>
            <THead>
              <Th>리소스</Th>
              <Th>접근</Th>
              <Th>출처</Th>
              <Th>다운로드</Th>
            </THead>
            <tbody className="divide-y divide-border">
              {rows.map((item) => (
                <AccessRow key={`${item.resourceType}-${item.resourceId}`} item={item} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Notice>
        서버가 조회 리소스 수를 제한할 수 있어, 매우 많은 워크스페이스에서는 일부만 표시될 수 있습니다.
      </Notice>
    </div>
  );
}

function AccessRow({ item }: { item: AdminEffectivePermission }) {
  return (
    <tr className="hover:bg-muted/40">
      <Td>
        <ResourceCell type={item.resourceType} id={item.resourceId} name={item.resourceName} />
      </Td>
      <Td>
        {item.access ? (
          <span className="inline-flex items-center gap-1 text-success">
            <ShieldCheck className="size-3.5" />
            허용
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-destructive">
            <ShieldX className="size-3.5" />
            차단
          </span>
        )}
      </Td>
      <Td className="text-muted-foreground">
        <span title={item.sourceDetail}>{SOURCE_LABEL[item.source]}</span>
      </Td>
      <Td>
        {!item.access ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : item.canDownload ? (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <ShieldCheck className="size-3.5" />
            허용
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-destructive">
            <ShieldX className="size-3.5" />
            금지
          </span>
        )}
      </Td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Activity                                                              */
/* ------------------------------------------------------------------ */

function ActivityTab({ workspace, member }: { workspace: Workspace; member: AdminUser }) {
  const { data, isLoading, isError } = useAdminAuditLogs(workspace.workspaceId, {
    actorUserId: member.userId,
  });
  const rows = data ?? [];

  return (
    <Card className="overflow-hidden">
      {isLoading ? (
        <StatusText>불러오는 중…</StatusText>
      ) : isError ? (
        <StatusText>활동 이력을 불러올 수 없습니다.</StatusText>
      ) : rows.length === 0 ? (
        <StatusText>기록된 활동이 없습니다.</StatusText>
      ) : (
        <Table>
          <THead>
            <Th>시각</Th>
            <Th>작업</Th>
            <Th>리소스</Th>
            <Th>결과</Th>
          </THead>
          <tbody className="divide-y divide-border">
            {rows.map((log) => (
              <tr key={log.logId} className="hover:bg-muted/40">
                <Td className="whitespace-nowrap text-muted-foreground">{formatDateTime(log.createAt)}</Td>
                <Td className="text-foreground">{ACTION_LABEL[log.action] ?? log.action}</Td>
                <Td>
                  <ResourceCell type={log.resourceType} id={log.resourceId} name={null} />
                </Td>
                <Td>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      log.result === 'ALLOWED' ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {log.result === 'ALLOWED' ? <ShieldCheck className="size-3.5" /> : <ShieldX className="size-3.5" />}
                    {log.result === 'ALLOWED' ? '허용' : '거부'}
                    {log.viaAdmin && (
                      <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        관리자 특권
                      </span>
                    )}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
