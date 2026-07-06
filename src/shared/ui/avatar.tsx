import { cn } from '@/shared/lib/utils/index';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-base',
};

/** 이름 이니셜 2글자 원형 아바타 */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background',
        SIZE[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
