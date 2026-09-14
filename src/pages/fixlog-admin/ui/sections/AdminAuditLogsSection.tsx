import { useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils/index';
import type { Workspace } from '@/domains/workspaces';
import { useWorkspaceMembers } from '@/domains/workspaces';
import { useAdminAuditLogs } from '@/domains/admin';
import type { AuditAction, AuditLogFilter, AuditResult } from '@/domains/admin';
import {
  ACTION_LABEL,
  formatDateTime,
  selectClass,
  SectionTitle,
  Notice,
  Table,
  THead,
  Th,
  Td,
  StatusText,
  ResourceCell,
} from '@/pages/fixlog-admin/ui/shared';

/** Audit Logs — 접근·관리 이력. 사용자/행위/결과/기간 필터. */
export function AdminAuditLogsSection({ workspace }: { workspace: Workspace }) {
  // State — 입력 중 값과 적용된 필터를 분리해 타이핑마다 재조회하지 않는다
  const [draft, setDraft] = useState<AuditLogFilter>({});
  const [filter, setFilter] = useState<AuditLogFilter>({});

  // Hooks
  const { data: members } = useWorkspaceMembers(workspace.workspaceId, true);
  const { data, isLoading, isError } = useAdminAuditLogs(workspace.workspaceId, filter);
  const rows = data ?? [];

  // Functions
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({
      ...draft,
      // <input type="datetime-local"> 값(로컬 시간) → ISO 로 변환해 서버(ISO_DATE_TIME) 에 맞춘다
      from: draft.from ? new Date(draft.from).toISOString() : undefined,
      to: draft.to ? new Date(draft.to).toISOString() : undefined,
    });
  };
  const reset = () => {
    setDraft({});
    setFilter({});
  };

  return (
    <div>
      <SectionTitle title="감사 로그" description="문서·폴더 접근 판정(허용/거부)과 공유·복원 등 관리 작업 이력입니다." />

      <div className="space-y-4">
        <Card className="p-4">
          <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
            <FilterField label="사용자">
              <select
                value={draft.actorUserId ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, actorUserId: e.target.value || undefined }))}
                className={selectClass}
              >
                <option value="">전체</option>
                {(members ?? []).map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userName}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="작업">
              <select
                value={draft.action ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, action: (e.target.value || undefined) as AuditAction | undefined }))
                }
                className={selectClass}
              >
                <option value="">전체</option>
                {(Object.keys(ACTION_LABEL) as AuditAction[]).map((a) => (
                  <option key={a} value={a}>
                    {ACTION_LABEL[a]}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="결과">
              <select
                value={draft.result ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, result: (e.target.value || undefined) as AuditResult | undefined }))
                }
                className={selectClass}
              >
                <option value="">전체</option>
                <option value="ALLOWED">허용</option>
                <option value="DENIED">거부</option>
              </select>
            </FilterField>
            <FilterField label="시작">
              <input
                type="datetime-local"
                value={draft.from ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value || undefined }))}
                className={selectClass}
              />
            </FilterField>
            <FilterField label="종료">
              <input
                type="datetime-local"
                value={draft.to ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value || undefined }))}
                className={selectClass}
              />
            </FilterField>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                조회
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                초기화
              </Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden">
          {isLoading ? (
            <StatusText>불러오는 중…</StatusText>
          ) : isError ? (
            <StatusText>감사 로그를 불러올 수 없습니다.</StatusText>
          ) : rows.length === 0 ? (
            <StatusText>조건에 맞는 기록이 없습니다.</StatusText>
          ) : (
            <Table>
              <THead>
                <Th>시각</Th>
                <Th>사용자</Th>
                <Th>작업</Th>
                <Th>리소스</Th>
                <Th>결과</Th>
                <Th>상세</Th>
              </THead>
              <tbody className="divide-y divide-border">
                {rows.map((log) => (
                  <tr key={log.logId} className="hover:bg-muted/40">
                    <Td className="whitespace-nowrap text-muted-foreground">{formatDateTime(log.createAt)}</Td>
                    <Td className="text-foreground">{log.actorName ?? log.actorUserId}</Td>
                    <Td className="text-foreground">{ACTION_LABEL[log.action] ?? log.action}</Td>
                    <Td>
                      {log.permissionChange ? (
                        <span className="text-foreground">
                          {log.targetName ?? '—'}
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {log.targetPrincipalType === 'GROUP' ? '그룹' : '대상'}
                          </span>
                        </span>
                      ) : (
                        <ResourceCell type={log.resourceType} id={log.resourceId} name={null} />
                      )}
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          log.result === 'ALLOWED' ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {log.result === 'ALLOWED' ? (
                          <ShieldCheck className="size-3.5" />
                        ) : (
                          <ShieldX className="size-3.5" />
                        )}
                        {log.result === 'ALLOWED' ? '허용' : '거부'}
                      </span>
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {log.permissionChange
                        ? (log.detail ?? '—')
                        : log.viaAdmin
                          ? '관리자 특권으로 접근'
                          : '—'}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Notice>
          서버 감사 로그는 접근 판정(열람·다운로드·편집·삭제·공유·복원)만 기록합니다. 기획서의 Detail(권한 변경 내용
          &quot;John → Deny&quot;, 편집 내용, 검색어)과 검색 행위 기록은 서버 미지원입니다. 리소스 이름은 로그에 없어 ID 로
          표시되며, 문서는 클릭해 이동할 수 있습니다.
        </Notice>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
