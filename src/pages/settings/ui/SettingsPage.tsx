import { useState } from 'react';
import { Sparkles, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';
import {
  useWorkspaces,
  useAiUsage,
  useSecurityPolicy,
} from '@/domains/workspaces';
import {
  useApiKeys,
  useRegisterApiKey,
  useDeleteApiKey,
} from '@/domains/api-keys';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
];

export function SettingsPage() {
  // Hooks
  const { data: workspaces } = useWorkspaces();

  // Variables
  const currentId = workspaceStorage.get();
  const currentWorkspace =
    workspaces?.find((w) => w.workspaceId === currentId) ??
    workspaces?.find((w) => w.personal) ??
    workspaces?.[0];
  const workspaceId = currentWorkspace?.workspaceId;

  // Render
  return (
    <AppShell header={<PageHeader title="Workspace Settings" />}>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* 현재 워크스페이스 */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            현재 워크스페이스
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {currentWorkspace?.workspaceName ?? '—'}
            </span>
            {currentWorkspace && (
              <Badge variant="published">
                {currentWorkspace.personal
                  ? '개인'
                  : currentWorkspace.role === 'ADMIN'
                    ? '관리자'
                    : '구성원'}
              </Badge>
            )}
          </div>
        </Card>

        <AiUsageCard workspaceId={workspaceId} />
        <ApiKeysCard />
        <SecurityPolicyCard workspaceId={workspaceId} />
      </div>
    </AppShell>
  );
}

/** 13. AI 사용량 요약. */
function AiUsageCard({ workspaceId }: { workspaceId?: string }) {
  const { data, isLoading, isError } = useAiUsage(workspaceId);

  const limit = data?.freeTokenLimit ?? 0;
  const used = data?.freeTokensUsed ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" />
        AI 사용량 (이번 달)
      </h2>
      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">불러오는 중…</p>
      ) : isError || !data ? (
        <p className="mt-3 text-sm text-muted-foreground">
          사용량을 불러올 수 없습니다.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">무료 토큰</span>
              <span className="text-foreground">
                {used.toLocaleString()} / {limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              남은 토큰 {data.freeTokensRemaining.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-muted-foreground">
              호출 수{' '}
              <span className="text-foreground">{data.totalCalls}</span>
            </span>
            <span className="text-muted-foreground">
              비용{' '}
              <span className="text-foreground">
                ${Number(data.totalCost ?? 0).toFixed(4)}
              </span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            무료 한도 초과 시 무료 모델 호출이 막힙니다. 실패한 호출은 한도를
            깎지 않습니다.
          </p>
        </div>
      )}
    </Card>
  );
}

/** 13. 사용자 AI API Key 관리. */
function ApiKeysCard() {
  const { data, isLoading } = useApiKeys();
  const register = useRegisterApiKey();
  const deleteKey = useDeleteApiKey();

  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');

  const keys = data ?? [];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = apiKey.trim();
    if (!key) return;
    try {
      await register.mutateAsync({ provider, apiKey: key });
      setApiKey('');
    } catch (error) {
      console.error('Failed to register API key:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <KeyRound className="size-4 text-primary" />
        AI API Key
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        직접 등록한 키로 AI 기능을 사용할 수 있습니다. 키 원문은 저장 후 다시
        보이지 않습니다.
      </p>

      {/* 등록 폼 */}
      <form onSubmit={handleRegister} className="mt-4 flex items-center gap-2">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key (sk-...)"
          className="flex-1"
        />
        <Button type="submit" disabled={!apiKey.trim() || register.isPending}>
          {register.isPending ? '등록 중…' : '등록'}
        </Button>
      </form>

      {/* 목록 */}
      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 키가 없습니다. (등록하지 않으면 서비스 기본 키를 사용합니다)
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {keys.map((k) => (
              <li key={k.keyId} className="flex items-center gap-3 py-2.5">
                <span className="w-20 shrink-0 text-sm font-medium capitalize text-foreground">
                  {k.provider}
                </span>
                <span className="flex-1 font-mono text-sm text-muted-foreground">
                  {k.maskedKey}
                </span>
                <button
                  type="button"
                  onClick={() => deleteKey.mutate(k.keyId)}
                  aria-label={`${k.provider} 키 삭제`}
                  disabled={deleteKey.isPending}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/** 15. 보안 정책(제약 확인, 읽기 전용). */
function SecurityPolicyCard({ workspaceId }: { workspaceId?: string }) {
  const { data, isLoading, isError } = useSecurityPolicy(workspaceId);

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        보안 정책
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        이 워크스페이스에 적용된 제약입니다. 정책은 개별 권한·관리자 특권보다
        우선합니다.
      </p>
      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">불러오는 중…</p>
      ) : isError || !data ? (
        <p className="mt-3 text-sm text-muted-foreground">
          보안 정책을 불러올 수 없습니다.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          <PolicyRow label="공유 허용" allowed={data.allowSharing} />
          <PolicyRow label="다운로드 허용" allowed={data.allowDownload} />
          <PolicyRow
            label="다운로드 워터마크"
            allowed={data.enforceWatermark}
            onLabel="적용"
            offLabel="미적용"
          />
          <PolicyValueRow
            label="감사 로그 보관"
            value={`${data.auditRetentionDays}일`}
          />
          <PolicyValueRow
            label="휴지통 보관"
            value={`${data.trashRetentionDays}일`}
          />
        </div>
      )}
    </Card>
  );
}

function PolicyRow({
  label,
  allowed,
  onLabel = '허용',
  offLabel = '금지',
}: {
  label: string;
  allowed: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      {allowed ? (
        <Badge variant="published">{onLabel}</Badge>
      ) : (
        <Badge variant="draft">{offLabel}</Badge>
      )}
    </div>
  );
}

function PolicyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
