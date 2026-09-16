import { useEffect, useState } from 'react';
import { UserPlus, UserMinus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Avatar } from '@/shared/ui/avatar';
import type { WorkspaceRole } from '@/domains/workspaces';
import {
  useWorkspaceMembers,
  useInviteMember,
  useChangeMemberRole,
  useRemoveMember,
} from '@/domains/workspaces';

interface MemberManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

/**
 * 워크스페이스 멤버 관리 팝업(관리자 전용). 구성원 목록 + 우측 상단 추가/제거,
 * 각 행 우측 select(스피너)로 역할 변경. (FRONTEND_API_GUIDE 8장)
 */
export function MemberManageDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
}: MemberManageDialogProps) {
  // Hooks
  const { data, isLoading } = useWorkspaceMembers(workspaceId, open);
  const invite = useInviteMember(workspaceId);
  const changeRole = useChangeMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  // State
  const [addMode, setAddMode] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Effects — 열릴 때 모드/입력 초기화
  useEffect(() => {
    if (open) {
      setAddMode(false);
      setRemoveMode(false);
      setInviteEmail('');
    }
  }, [open]);

  // Variables
  const members = data ?? [];

  // Functions
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      await invite.mutateAsync(email);
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* 헤더 — 제목/설명 줄 아래에 추가/제거 버튼 줄을 두어 우상단 닫기(X) 버튼과 겹치지 않게 한다 */}
        <div>
          <div className="min-w-0 pr-8">
            <DialogTitle>멤버 관리</DialogTitle>
            <DialogDescription className="truncate">
              {workspaceName}
            </DialogDescription>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant={addMode ? 'default' : 'secondary'}
              onClick={() => {
                setAddMode((v) => !v);
                setRemoveMode(false);
              }}
            >
              <UserPlus />
              추가
            </Button>
            <Button
              size="sm"
              variant={removeMode ? 'default' : 'secondary'}
              onClick={() => {
                setRemoveMode((v) => !v);
                setAddMode(false);
              }}
            >
              <UserMinus />
              제거
            </Button>
          </div>
        </div>

        {/* 초대 폼(추가 모드) */}
        {addMode && (
          <form onSubmit={handleInvite} className="mt-3 flex items-center gap-2">
            <Input
              type="email"
              autoFocus
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="가입된 사용자 이메일"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inviteEmail.trim() || invite.isPending}
            >
              {invite.isPending ? '초대 중…' : '초대'}
            </Button>
          </form>
        )}
        {addMode && invite.isError && (
          <p className="mt-1 text-xs text-destructive">
            초대에 실패했습니다. 가입된 사용자인지, 이미 구성원은 아닌지
            확인하세요.
          </p>
        )}

        {/* 멤버 목록 */}
        <div className="mt-4">
          {isLoading ? (
            <p className="py-2 text-sm text-muted-foreground">불러오는 중…</p>
          ) : members.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              구성원이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li key={m.userId} className="flex items-center gap-3 py-2.5">
                  <Avatar name={m.userName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {m.userName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  </span>
                  <select
                    value={m.role}
                    disabled={changeRole.isPending}
                    onChange={(e) =>
                      changeRole.mutate({
                        userId: m.userId,
                        role: e.target.value as WorkspaceRole,
                      })
                    }
                    aria-label={`${m.userName} 역할`}
                    className="h-8 shrink-0 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="OWNER">소유자</option>
                    <option value="ADMIN">관리자</option>
                    <option value="MEMBER">구성원</option>
                  </select>
                  {removeMode && (
                    <button
                      type="button"
                      onClick={() => removeMember.mutate(m.userId)}
                      disabled={removeMember.isPending}
                      aria-label={`${m.userName} 제거`}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {changeRole.isError && (
            <p className="mt-2 text-xs text-destructive">
              역할 변경에 실패했습니다. 마지막 관리자는 변경할 수 없습니다.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
