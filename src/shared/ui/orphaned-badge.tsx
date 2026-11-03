import { FolderX } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';

/**
 * 고아 항목 표시.
 *
 * 원래 상위 폴더에 접근 권한이 없어, 서버가 접근 가능한 가장 가까운 조상 목록으로
 * 끌어올려 보여주는 항목(FolderDto/DocumentDto 의 orphaned=true)에 붙인다.
 * 지금 보이는 위치가 원래 위치가 아니라는 점을 사용자가 알 수 있어야 한다.
 */
export function OrphanedBadge({ className }: { className?: string }) {
  return (
    <span
      title="원래 상위 폴더에 접근 권한이 없어 이 위치에 표시되고 있어요. 실제 위치는 다릅니다."
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground',
        className
      )}
    >
      <FolderX className="size-3" />
      접근 불가 폴더에 있음
    </span>
  );
}
