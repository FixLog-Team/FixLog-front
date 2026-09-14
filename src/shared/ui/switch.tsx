import { cn } from '@/shared/lib/utils/index';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** on 상태 색. 기본은 primary, 허용 의미면 success 를 쓴다. */
  tone?: 'primary' | 'success';
  /** off 상태 색. 기본은 muted(회색), 차단 의미면 destructive(빨강)을 쓴다. */
  offTone?: 'muted' | 'destructive';
  'aria-label'?: string;
  className?: string;
}

/** 접근성 있는 토글 스위치(라디스 미설치 환경용 경량 구현). role="switch". */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  tone = 'primary',
  offTone = 'muted',
  className,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? tone === 'success'
            ? 'bg-success'
            : 'bg-primary'
          : offTone === 'destructive'
            ? 'bg-destructive'
            : 'bg-muted-foreground/30',
        className
      )}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
