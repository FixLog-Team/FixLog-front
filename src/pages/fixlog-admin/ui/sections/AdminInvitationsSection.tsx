import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils/index';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { useWorkspaceMembers } from '@/domains/workspaces';
import type { Workspace } from '@/domains/workspaces';
import {
  useAdminInvitations,
  useAdminInvite,
  useAdminCancelInvitation,
} from '@/domains/admin';
import type { AdminWorkspaceRole, Invitation, InvitationStatus } from '@/domains/admin';
import {
  ROLE_LABEL,
  formatDateTime,
  selectClass,
  SectionTitle,
  Notice,
  Table,
  THead,
  Th,
  Td,
  StatusText,
  RoleBadge,
} from '@/pages/fixlog-admin/ui/shared';

/** 초대 상태 배지 색상/문구. */
const STATUS_META: Record<InvitationStatus, { label: string; className: string }> = {
  PENDING: { label: '대기 중', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ACCEPTED: { label: '수락됨', className: 'bg-success/10 text-success' },
  DECLINED: { label: '거절됨', className: 'bg-muted text-muted-foreground' },
  EXPIRED: { label: '만료됨', className: 'bg-destructive/10 text-destructive' },
};

/**
 * Invitations — 이메일 + Workspace Role 로 초대한다(관리자 콘솔 초대 API).
 * POST/GET/DELETE .../admin/invitations 로 초대 발송·대기 목록·취소를 관리한다.
 * 서버가 이메일로 토큰을 보내고, 수신자는 링크로 수락/거절한다(미가입 이메일도 초대 가능).
 */
export function AdminInvitationsSection({ workspace }: { workspace: Workspace }) {
  // Hooks
  const workspaceId = workspace.workspaceId;
  const invitations = useAdminInvitations(workspaceId);
  const invite = useAdminInvite(workspaceId);
  const cancel = useAdminCancelInvitation(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId, true);

  // State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminWorkspaceRole>('MEMBER');
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // Variables
  const rows = [...(invitations.data ?? [])].sort((a, b) =>
    (b.createAt ?? '').localeCompare(a.createAt ?? '')
  );
  const recent = [...(members ?? [])]
    .sort((a, b) => (b.joinedAt ?? '').localeCompare(a.joinedAt ?? ''))
    .slice(0, 10);

  // Functions
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    setMessage(null);
    try {
      await invite.mutateAsync({ email: target, role });
      setEmail('');
      setRole('MEMBER');
      setMessage({ tone: 'ok', text: `${target}에게 ${ROLE_LABEL[role]} 초대를 보냈습니다.` });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getApiErrorMessage(error, '초대에 실패했습니다. 이메일과 권한을 확인하세요.'),
      });
    }
  };

  const handleCancel = async (invitation: Invitation) => {
    try {
      await cancel.mutateAsync(invitation.id);
    } catch (error) {
      setMessage({ tone: 'error', text: getApiErrorMessage(error, '초대 취소에 실패했습니다.') });
    }
  };

  return (
    <div>
      <SectionTitle title="초대" description="이메일과 역할로 멤버를 초대하고, 대기 중 초대를 관리합니다." />

      <Card className="p-5">
        <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1 text-xs text-muted-foreground">
            이메일
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="초대할 이메일"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            워크스페이스 역할
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminWorkspaceRole)}
              className={cn(selectClass, 'h-10')}
            >
              <option value="MEMBER">{ROLE_LABEL.MEMBER}</option>
              <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
            </select>
          </label>
          <Button type="submit" disabled={!email.trim() || invite.isPending}>
            <UserPlus />
            {invite.isPending ? '초대 중…' : '초대'}
          </Button>
        </form>
        {message && (
          <p className={cn('mt-3 text-sm', message.tone === 'ok' ? 'text-success' : 'text-destructive')} role="status">
            {message.text}
          </p>
        )}
      </Card>

      <div className="mt-4 space-y-4">
        {/* 초대 목록 (대기/수락/거절/만료) */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-sm font-medium text-foreground">초대 목록</div>
          {invitations.isLoading ? (
            <StatusText>불러오는 중…</StatusText>
          ) : invitations.isError ? (
            <StatusText>초대 목록을 불러올 수 없습니다. (관리자만 조회 가능)</StatusText>
          ) : rows.length === 0 ? (
            <StatusText>보낸 초대가 없습니다.</StatusText>
          ) : (
            <Table>
              <THead>
                <Th>이메일</Th>
                <Th>역할</Th>
                <Th>상태</Th>
                <Th>만료</Th>
                <Th>보낸 사람</Th>
                <Th className="text-right">&nbsp;</Th>
              </THead>
              <tbody className="divide-y divide-border">
                {rows.map((inv) => {
                  const meta = STATUS_META[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-muted/40">
                      <Td className="text-foreground">{inv.email}</Td>
                      <Td>
                        <RoleBadge role={inv.role} />
                      </Td>
                      <Td>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', meta.className)}>
                          {meta.label}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap text-muted-foreground">{formatDateTime(inv.expiresAt)}</Td>
                      <Td className="text-muted-foreground">{inv.invitedByName ?? '—'}</Td>
                      <Td className="text-right">
                        {inv.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(inv)}
                            disabled={cancel.isPending}
                            aria-label={`${inv.email} 초대 취소`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-3.5" />
                            취소
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>

        <Notice>
          초대를 보내면 서버가 이메일로 토큰 링크를 전송합니다. 수신자가 링크로 수락하면 구성원이 됩니다.
          대기 중(PENDING) 초대만 취소할 수 있습니다.
        </Notice>

        {/* 최근 합류한 멤버 */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-sm font-medium text-foreground">최근 합류한 멤버</div>
          {!members ? (
            <StatusText>불러오는 중…</StatusText>
          ) : recent.length === 0 ? (
            <StatusText>멤버가 없습니다.</StatusText>
          ) : (
            <Table>
              <THead>
                <Th>이름</Th>
                <Th>이메일</Th>
                <Th>역할</Th>
                <Th>가입일</Th>
              </THead>
              <tbody className="divide-y divide-border">
                {recent.map((m) => (
                  <tr key={m.userId}>
                    <Td className="text-foreground">{m.userName}</Td>
                    <Td className="text-muted-foreground">{m.email}</Td>
                    <Td>
                      <RoleBadge role={m.role} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{formatDateTime(m.joinedAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
