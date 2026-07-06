import { BookText } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';

interface LogoProps {
  withWordmark?: boolean;
  className?: string;
}

/** FixLog 로고 — 파란 rounded-square 아이콘 + 워드마크 */
export function Logo({ withWordmark = true, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BookText className="size-4" />
      </span>
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          FixLog
        </span>
      )}
    </span>
  );
}
