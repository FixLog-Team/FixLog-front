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
import type { PermissionType, ResourceKind } from '@/domains/permissions';
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

/** 권한 타입 선택지. 최신 모델은 ALLOW(허용)/DENY(차단) 이진값이다. */
const PERMISSION_TYPES: { value: PermissionType; label: string }[] = [
  { value: 'ALLOW', label: '허용 (조회)' },
  { value: 'DENY', label: '차단 (접근 거부)' },
];

/**
 * 공유 다이얼로그(문서/폴더 공통). 현재 공유 대상 목록 + 이메일로 새 공유 부여.
 * 권한 모델: ALLOW(허용)/DENY(차단) + canDownload. DENY 는 상속된 허용보다 우선해 접근을 막는다.
 * 소유자·Admin 만 공유를 볼/설정할 수 있어, 권한이 없으면 목록 조회가 실패하고 안내 문구를 보인다.
 */
export function ShareDialog({ open, onOpenChange, kind, id, name }: ShareDialogProps) {
  // Hooks
  const permissions = useResourcePermissions(kind, id, open);
  const share = useShareResource(kind, id);
  const revoke = useRevokeShare(kind, id);

  // State
  const [email, setEmail] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('ALLOW');
  const [canDownload, setCanDownload] = useState(true);

  // Effects — 열릴 때 입력 초기화
  useEffect(() => {
    if (open) {
      setEmail('');
      setPermissionType('ALLOW');
      setCanDownload(true);
    }
  }, [open]);

  // Variables
  const isDeny = permissionType === 'DENY';

  // Functions
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    try {
      // 차단(DENY)에는 다운로드 개념이 없으므로 canDownload 는 허용일 때만 의미 있다.
      await share.mutateAsync({
        email: target,
        permissionType,
        canDownload: isDeny ? false : canDownload,
      });
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
              value={permissionType}
              onChange={(e) => setPermissionType(e.target.value as PermissionType)}
              className="h-9 flex-1 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {PERMISSION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground',
                isDeny && 'opacity-40'
              )}
            >
              <input
                type="checkbox"
                checked={canDownload && !isDeny}
                disabled={isDeny}
                onChange={(e) => setCanDownload(e.target.checked)}
              />
              다운로드 허용
            </label>
            <Button type="submit" disabled={!email.trim() || share.isPending}>
              {share.isPending ? '공유 중…' : '공유'}
            </Button>
          </div>
          {isDeny && (
            <p className="text-xs text-muted-foreground">
              차단은 상속으로 열린 접근까지 막습니다. 같은 워크스페이스 구성원에게만 적용됩니다.
            </p>
          )}
          {share.isError && (
            <p className="text-xs text-destructive">
              공유에 실패했습니다. 대상이 같은 워크스페이스 구성원인지, 본인이
              소유자 또는 관리자인지 확인하세요.
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
              공유 목록을 볼 수 없습니다. 소유자·관리자만 공유를 설정할 수 있습니다.
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
                      'shrink-0 rounded-full px-2 py-0.5 text-xs',
                      p.permissionType === 'DENY'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-success/10 text-success'
                    )}
                  >
                    {p.permissionType === 'DENY' ? '차단' : '허용'}
                    {p.permissionType === 'ALLOW' && !p.canDownload && ' · 반출금지'}
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
