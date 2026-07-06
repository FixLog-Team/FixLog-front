import * as React from 'react';
import { cn } from '@/shared/lib/utils/index';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 좌측 아이콘 슬롯 (예: Search, Sparkles) */
  icon?: React.ReactNode;
  /** 우측 액션 슬롯 (예: 전송 버튼) */
  trailing?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, trailing, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-4 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
          className
        )}
      >
        {icon && (
          <span className="shrink-0 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          {...props}
        />
        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
