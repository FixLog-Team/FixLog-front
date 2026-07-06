import type { ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';

interface AppShellProps {
  /** main 영역 상단 고정 헤더 (선택) */
  header?: ReactNode;
  children: ReactNode;
}

/** 앱 공통 셸 — 좌측 v0 사이드바 + 우측 메인 영역 */
export function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
