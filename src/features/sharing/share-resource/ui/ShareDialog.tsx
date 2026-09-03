import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils/index';
import type { PermissionLevel, ResourceKind } from '@/domains/permissions';
import {
  useResourcePermissions,
  useShareResource,
  useRevokeShare,
} from '@/features/sharing/share-resource/hooks/use-resource-permissions';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ResourceKind;
  id: string;
  name: string;
}

const LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: 'VIEWER', label: '뷰어 (조회)' },
  { value: 'EDITOR', label: '편집자 (조회·편집)' },
  { value: 'OWNER', label: '소유자 (전체)' },
];

/**
 * 공유 다이얼로그(문서/폴더 공통). 현재 공유 대상 목록 + 이메일로 새 공유 부여.
 * 소유자만 공유를 볼/설정할 수 있어, 권한이 없으면 목록 조회가 실패하고 안내 문구를 보인다.
 */
export function ShareDialog({ open, onOpenChange, kind, id, name }: ShareDialogProps) {
  // Hooks
  const permissions = useResourcePermissions(kind, id, open);
  const share = useShareResource(kind, id);
  const revoke = useRevokeShare(kind, id);

  // State
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<PermissionLevel>('VIEWER');
  const [canDownload, setCanDownload] = useState(true);

  // Effects — 열릴 때 입력 초기화
  useEffect(() => {
    if (open) {
      setEmail('');
      setLevel('VIEWER');
      setCanDownload(true);
    }
  }, [open]);

  // Functions
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    try {
      await share.mutateAsync({ email: target, level, canDownload });
      setEmail('');
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const items = permissions.data ?? [];

  // Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>공유</DialogTitle>
          <DialogDescription className="truncate">
            {kind === 'folder' ? '폴더' : '문서'} · {name}
          </DialogDescription>
        </DialogHeader>

        {/* 공유 추가 폼 */}
        <form onSubmit={handleShare} className="mt-2 space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="공유할 사용자 이메일"
          />
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PermissionLevel)}
              className="h-9 flex-1 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
              />
              다운로드 허용
            </label>
            <Button type="submit" disabled={!email.trim() || share.isPending}>
              {share.isPending ? '공유 중…' : '공유'}
            </Button>
          </div>
          {share.isError && (
            <p className="text-xs text-destructive">
              공유에 실패했습니다. 대상이 같은 워크스페이스 구성원인지, 본인이
              소유자인지 확인하세요.
            </p>
          )}
        </form>

        {/* 현재 공유 대상 */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            공유 대상
          </div>
          {permissions.isLoading ? (
            <p className="py-2 text-sm text-muted-foreground">불러오는 중…</p>
          ) : permissions.isError ? (
            <p className="py-2 text-sm text-muted-foreground">
              공유 목록을 볼 수 없습니다. 소유자만 공유를 설정할 수 있습니다.
            </p>
          ) : items.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              아직 공유된 대상이 없습니다.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((p) => (
                <li
                  key={p.permissionId}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {p.principalName}
                    {p.principalType === 'GROUP' && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (그룹)
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                    )}
                  >
                    {p.level}
                    {!p.canDownload && ' · 반출금지'}
                  </span>
                  <button
                    type="button"
                    onClick={() => revoke.mutate(p.permissionId)}
                    aria-label={`${p.principalName} 공유 회수`}
                    disabled={revoke.isPending}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
