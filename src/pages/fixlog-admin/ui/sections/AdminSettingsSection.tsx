import { useEffect, useState } from 'react';
import { FileText, Folder, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils/index';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { useSecurityPolicy, useUpdateSecurityPolicy } from '@/domains/workspaces';
import type { Workspace, SecurityPolicyUpdateBody } from '@/domains/workspaces';
import { useAdminStats } from '@/domains/admin';
import { SectionTitle, StatusText, selectClass } from '@/pages/fixlog-admin/ui/shared';

/** Settings — 서버가 제공하는 워크스페이스 보안 정책(편집)과 문서·폴더 현황. */
export function AdminSettingsSection({ workspace }: { workspace: Workspace }) {
  return (
    <div>
      <SectionTitle
        title="설정"
        description="워크스페이스 보안 정책은 개별 권한과 관리자 특권보다 우선 적용됩니다."
      />
      <div className="space-y-6">
        <SecurityPolicyForm workspaceId={workspace.workspaceId} />
        <StatsPanel workspaceId={workspace.workspaceId} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security policy                                                       */
/* ------------------------------------------------------------------ */

function SecurityPolicyForm({ workspaceId }: { workspaceId: string }) {
  // Hooks
  const { data, isLoading, isError } = useSecurityPolicy(workspaceId);
  const update = useUpdateSecurityPolicy(workspaceId);

  // State
  const [form, setForm] = useState<SecurityPolicyUpdateBody>({});
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // Effects — 서버 값이 오면 폼 초기화
  useEffect(() => {
    if (data) {
      setForm({
        allowSharing: data.allowSharing,
        allowDownload: data.allowDownload,
        auditRetentionDays: data.auditRetentionDays,
        trashRetentionDays: data.trashRetentionDays,
      });
    }
  }, [data]);

  // Variables
  const dirty =
    !!data &&
    (form.allowSharing !== data.allowSharing ||
      form.allowDownload !== data.allowDownload ||
      form.auditRetentionDays !== data.auditRetentionDays ||
      form.trashRetentionDays !== data.trashRetentionDays);

  // Functions
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await update.mutateAsync(form);
      setMessage({ tone: 'ok', text: '보안 정책을 저장했습니다.' });
    } catch (error) {
      setMessage({ tone: 'error', text: getApiErrorMessage(error, '보안 정책 저장에 실패했습니다.') });
    }
  };

  if (isLoading) return <StatusText>불러오는 중…</StatusText>;
  if (isError || !data) return <StatusText>보안 정책을 불러올 수 없습니다.</StatusText>;

  return (
    <Card className="p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        보안 정책
      </h3>
      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <Toggle
          label="공유 허용"
          hint="끄면 개별 권한과 무관하게 새 공유가 금지됩니다."
          checked={form.allowSharing ?? false}
          onChange={(v) => setForm((f) => ({ ...f, allowSharing: v }))}
        />
        <Toggle
          label="다운로드 허용"
          hint="끄면 다운로드 권한이 있어도 PDF 반출이 금지됩니다."
          checked={form.allowDownload ?? false}
          onChange={(v) => setForm((f) => ({ ...f, allowDownload: v }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="감사 로그 보관(일)"
            value={form.auditRetentionDays ?? 0}
            onChange={(v) => setForm((f) => ({ ...f, auditRetentionDays: v }))}
          />
          <NumberField
            label="휴지통 보관(일)"
            value={form.trashRetentionDays ?? 0}
            onChange={(v) => setForm((f) => ({ ...f, trashRetentionDays: v }))}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!dirty || update.isPending}>
            {update.isPending ? '저장 중…' : '저장'}
          </Button>
          {message && (
            <span className={cn('text-sm', message.tone === 'ok' ? 'text-success' : 'text-destructive')} role="status">
              {message.text}
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(selectClass, 'h-9')}
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                                 */
/* ------------------------------------------------------------------ */

function StatsPanel({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading, isError } = useAdminStats(workspaceId);

  if (isLoading) return <StatusText>불러오는 중…</StatusText>;
  if (isError || !data) return <StatusText>현황을 불러올 수 없습니다.</StatusText>;

  const byUser = Object.entries(data.documentCountByUser).sort((a, b) => b[1] - a[1]);
  const max = byUser[0]?.[1] ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="문서" value={data.documentCount} />
        <StatCard icon={Folder} label="폴더" value={data.folderCount} />
        <StatCard icon={FileText} label="휴지통 문서" value={data.trashedDocumentCount} muted />
        <StatCard icon={Folder} label="휴지통 폴더" value={data.trashedFolderCount} muted />
      </div>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground">작성자별 문서 수</h3>
        {byUser.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">문서가 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {byUser.map(([name, count]) => (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate text-foreground">{name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${max > 0 ? Math.max(4, (count / max) * 100) : 0}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className={cn('size-4', muted ? 'text-muted-foreground' : 'text-primary')} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value.toLocaleString()}</p>
    </Card>
  );
}
