import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils/index';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        // 상태 배지: dot + 텍스트
        published: 'text-[#12a150]',
        'in-review': 'text-[#b8860b]',
        draft: 'text-muted-foreground',
        // 태그 pill
        tag: 'bg-muted px-2 py-0.5 text-muted-foreground',
        // 검색 매치
        match: 'text-primary',
      },
    },
    defaultVariants: {
      variant: 'tag',
    },
  }
);

const DOT_COLOR: Record<string, string> = {
  published: 'bg-[#12a150]',
  'in-review': 'bg-[#f5a524]',
  draft: 'bg-muted-foreground',
  match: 'bg-primary',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  const showDot = variant && variant !== 'tag';

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', DOT_COLOR[variant])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
