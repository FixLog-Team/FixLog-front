import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Users, KeyRound, UserPlus, ScrollText, Settings2 } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { cn } from '@/shared/lib/utils/index';
import { ROUTES, adminPath } from '@/shared/constants/routes';
import { useWorkspaceRole } from '@/domains/workspaces';
import { AdminUsersSection } from '@/pages/fixlog-admin/ui/sections/AdminUsersSection';
import { AdminUserDetailSection } from '@/pages/fixlog-admin/ui/sections/AdminUserDetailSection';
import { AdminPermissionsSection } from '@/pages/fixlog-admin/ui/sections/AdminPermissionsSection';
import { AdminInvitationsSection } from '@/pages/fixlog-admin/ui/sections/AdminInvitationsSection';
import { AdminAuditLogsSection } from '@/pages/fixlog-admin/ui/sections/AdminAuditLogsSection';
import { AdminSettingsSection } from '@/pages/fixlog-admin/ui/sections/AdminSettingsSection';

const NAV = [
  { to: adminPath('users'), label: '구성원', icon: Users, hint: '멤버 · 역할' },
  { to: adminPath('permissions'), label: '권한', icon: KeyRound, hint: '폴더 · 문서 접근권' },
  { to: adminPath('invitations'), label: '초대', icon: UserPlus, hint: '멤버 초대' },
  { to: adminPath('audit-logs'), label: '감사 로그', icon: ScrollText, hint: '접근 · 관리 이력' },
  { to: adminPath('settings'), label: '설정', icon: Settings2, hint: '보안 정책 · 현황' },
];

/**
 * FixLog Admin (임시 구현) — "최종 FixLog Admin 페이지 기획.md" 2장 구조를 따른다.
 *   Users(List/Detail: Profile·Access·Activity) / Permissions(Folders & Documents·Users·Ask AI)
 *   / Invitations / Audit Logs, 그리고 서버가 제공하는 Settings(보안 정책·현황).
 * 팀 워크스페이스의 ADMIN/OWNER 만 진입 가능하며 그 외는 홈으로 되돌린다(서버도 403 으로 막는다).
 * 권한 모델은 ALLOW/DENY + canDownload 이며, 폴더 상속/기본 접근(base access) 설정과
 * 초대 관리(발송·대기 목록·취소)를 지원한다. (Ask AI 자연어 질의만 서버 미지원.)
 */
export function FixLogAdminPage() {
  // Hooks
  const { workspace, isAdmin, isPersonal } = useWorkspaceRole();

  // Render — 워크스페이스 목록 로딩 전에는 판단을 미룬다
  if (!workspace) {
    return (
      <AppShell header={<PageHeader title="관리자 콘솔" />}>
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">불러오는 중…</p>
      </AppShell>
    );
  }
  if (isPersonal || !isAdmin) {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }

  return (
    <AppShell
      scroll={false}
      header={
        <PageHeader title="관리자 콘솔" />
      }
    >
      <div className="flex min-h-0 flex-1">
        {/* Admin sub-nav */}
        <nav className="flex w-56 shrink-0 flex-col gap-0.5 border-r border-border bg-card p-3">
          {NAV.map(({ to, label, icon: Icon, hint }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2 transition-colors',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-foreground hover:bg-muted'
                )
              }
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-[11px] text-muted-foreground">{hint}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Section */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-6">
            <Routes>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<AdminUsersSection workspace={workspace} />} />
              <Route path="users/:userId" element={<AdminUserDetailSection workspace={workspace} />} />
              <Route path="permissions" element={<AdminPermissionsSection workspace={workspace} />} />
              <Route path="invitations" element={<AdminInvitationsSection workspace={workspace} />} />
              <Route path="audit-logs" element={<AdminAuditLogsSection workspace={workspace} />} />
              <Route path="settings" element={<AdminSettingsSection workspace={workspace} />} />
              <Route path="*" element={<Navigate to="users" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
