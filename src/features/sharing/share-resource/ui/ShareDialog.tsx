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
import type { ResourceKind } from '@/domains/permissions';
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
  /**
   * 공유 부여/회수 권한 여부. 소유자(생성자) 또는 해당 워크스페이스 관리자만 true.
   * false 면 공유 추가 폼과 회수 버튼을 숨겨(읽기 전용) 비소유자가 공유를 취소하지 못하게 한다.
   */
  canManage: boolean;
}

/**
 * 공유 다이얼로그(문서/폴더 공통). 현재 공유 대상 목록 + 이메일로 새 공유 부여.
 * 권한 모델(최신): ALLOW(허용) 하나로 통일 + canDownload. 접근을 막으려면 공유를 취소한다(DENY 폐기).
 * 소유자·Admin 만 공유를 관리할 수 있어(canManage), 그 외에는 폼·회수 버튼을 숨긴다.
 */
export function ShareDialog({ open, onOpenChange, kind, id, name, canManage }: ShareDialogProps) {
  // Hooks
  const permissions = useResourcePermissions(kind, id, open);
  const share = useShareResource(kind, id);
  const revoke = useRevokeShare(kind, id);

  // State
  const [email, setEmail] = useState('');
  const [canDownload, setCanDownload] = useState(true);

  // Effects — 열릴 때 입력 초기화
  useEffect(() => {
    if (open) {
      setEmail('');
      setCanDownload(true);
    }
  }, [open]);

  // Functions
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    try {
      await share.mutateAsync({
        email: target,
        permissionType: 'ALLOW',
        canDownload,
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

        {/* 공유 추가 폼 — 소유자·관리자만 */}
        {canManage && (
        <form onSubmit={handleShare} className="mt-2 space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="공유할 사용자 이메일"
          />
          <div className="flex items-center gap-2">
            <label className="flex flex-1 items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">
            공유하면 조회 권한이 부여됩니다. 접근을 막으려면 공유 대상에서 제거하세요.
          </p>
          {share.isError && (
            <p className="text-xs text-destructive">
              공유에 실패했습니다. 대상이 같은 워크스페이스 구성원인지, 본인이
              소유자 또는 관리자인지 확인하세요.
            </p>
          )}
        </form>
        )}

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
                  <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                    허용
                    {!p.canDownload && ' · 반출금지'}
                  </span>
                  {/* 회수는 소유자·관리자만 */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => revoke.mutate(p.permissionId)}
                      aria-label={`${p.principalName} 공유 회수`}
                      disabled={revoke.isPending}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!canManage && !permissions.isError && (
            <p className="mt-2 text-xs text-muted-foreground">
              공유 추가·회수는 소유자 또는 관리자만 할 수 있어요.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
