import { Link } from 'react-router-dom';
import { koDate, koDateTime } from '@/shared/lib/date/format';
import { FileText, Folder, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';
import { documentDetailPath } from '@/shared/constants/routes';
import type { WorkspaceRole } from '@/domains/workspaces';
import type { AdminPermissionType, AdminResourceType, AdminUserStatus, AuditAction } from '@/domains/admin';

/* ------------------------------------------------------------------ */
/* 라벨                                                                  */
/* ------------------------------------------------------------------ */

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '구성원',
};

/**
 * 역할 변경 시 고를 수 있는 옵션.
 * 소유자(OWNER)는 워크스페이스를 만든 유저만 가질 수 있으므로, 이미 소유자인 사람(=생성자)만 OWNER 를 유지한다.
 * 초대로 합류한 나머지 구성원은 최대 관리자(ADMIN)까지만 승격할 수 있다.
 */
export function assignableRoles(currentRole: WorkspaceRole): WorkspaceRole[] {
  return currentRole === 'OWNER' ? ['OWNER'] : ['ADMIN', 'MEMBER'];
}

/** 소유자 행은 역할을 바꿀 수 없다(소유권은 생성자 고정). */
export function isRoleLocked(currentRole: WorkspaceRole): boolean {
  return currentRole === 'OWNER';
}

export const ACTION_LABEL: Record<AuditAction, string> = {
  // 접근
  VIEW: '열람',
  DOWNLOAD: '다운로드',
  EDIT: '편집',
  DELETE: '삭제',
  SHARE: '공유',
  RESTORE: '복원',
  // 권한 변경
  PERMISSION_GRANT: '권한 부여',
  PERMISSION_REVOKE: '권한 회수',
  ROLE_CHANGE: '역할 변경',
  MEMBER_INVITE: '멤버 초대',
  MEMBER_REMOVE: '멤버 제거',
  GROUP_MEMBER_CHANGE: '그룹 구성원 변경',
  ACCESS_POLICY_CHANGE: '접근 정책 변경',
};

/** 권한 타입(ALLOW/DENY)을 화면 용어로 표시한다. */
export const PERMISSION_TYPE_LABEL: Record<AdminPermissionType, string> = {
  ALLOW: '허용',
  DENY: '차단',
};

/** 계정 상태(서버 UserStatus) 표시 라벨. */
export const USER_STATUS_LABEL: Record<AdminUserStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  BANNED: '차단',
  WITHDRAW: '탈퇴',
};

/* ------------------------------------------------------------------ */
/* 포맷                                                                  */
/* ------------------------------------------------------------------ */

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return koDateTime(date);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return koDate(date);
}

/* ------------------------------------------------------------------ */
/* 공용 조각                                                             */
/* ------------------------------------------------------------------ */

export const selectClass =
  'h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50';

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** 서버 미지원·제약 안내. 기획서 대비 빠진 기능을 화면에서 바로 알 수 있게 한다. */
export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
        tone === 'warn'
          ? 'border-warning/40 bg-warning/10 text-foreground'
          : 'border-border bg-muted/50 text-muted-foreground'
      )}
    >
      <Info className={cn('mt-0.5 size-3.5 shrink-0', tone === 'warn' ? 'text-warning' : 'text-muted-foreground')} />
      <div>{children}</div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-2.5 text-left font-medium', className)}>{children}</th>;
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-2.5 align-middle', className)}>{children}</td>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

export function StatusText({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

export function ResourceCell({
  type,
  id,
  name,
}: {
  type: AdminResourceType | null;
  id: string | null;
  name: string | null;
}) {
  // 권한 변경 로그 등 리소스가 없는 경우 방어(널 슬라이스 방지).
  if (!id) return <span className="text-muted-foreground">—</span>;
  const label = name ?? `${id.slice(0, 8)}…`;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {type === 'FOLDER' ? (
        <Folder className="size-4 shrink-0 text-primary" />
      ) : (
        <FileText className="size-4 shrink-0 text-muted-foreground" />
      )}
      {type === 'DOCUMENT' ? (
        <Link to={documentDetailPath(id)} className="truncate text-foreground hover:underline" title={id}>
          {label}
        </Link>
      ) : (
        <span className="truncate text-foreground" title={id}>
          {label}
        </span>
      )}
    </span>
  );
}

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-medium',
        role === 'OWNER'
          ? 'bg-warning/15 text-warning'
          : role === 'ADMIN'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
