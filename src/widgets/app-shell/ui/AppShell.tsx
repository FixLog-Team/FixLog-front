import type { ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';

interface AppShellProps {
  /** main 영역 상단 고정 헤더 (선택) */
  header?: ReactNode;
  /** true(기본): 콘텐츠 영역이 세로 스크롤. false: 자식이 직접 레이아웃/스크롤 관리 */
  scroll?: boolean;
  children: ReactNode;
}

/** 앱 공통 셸 — 좌측 v0 사이드바 + 우측 메인 영역 */
export function AppShell({ header, scroll = true, children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <div
          className={
            scroll
              ? 'min-h-0 flex-1 overflow-y-auto'
              : 'flex min-h-0 flex-1 overflow-hidden'
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
