import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

/** 타이틀 중심 앱 페이지(Home / AI Search / Settings) 상단 헤더 */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      {action}
    </header>
  );
}
