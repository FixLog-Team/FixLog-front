import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, X } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Avatar } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils/index';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import type { Workspace } from '@/domains/workspaces';
import { useRootFolders, useFolderChildren } from '@/domains/folders';
import type { FolderItem } from '@/domains/folders';
import type { DocumentDto } from '@/domains/documents';
import {
  useAdminUsers,
  useAdminResourcePermissions,
  useAdminGrantPermission,
  useAdminUpdatePermission,
  useAdminDeletePermission,
  useAdminUpdateFolderSettings,
} from '@/domains/admin';
import type {
  AdminPermission,
  AdminPermissionType,
  AdminResourceType,
  AdminUser,
} from '@/domains/admin';
import type { ResourceKind } from '@/domains/permissions';
import {
  PERMISSION_TYPE_LABEL,
  ROLE_LABEL,
  formatDate,
  selectClass,
  SectionTitle,
  Notice,
  Table,
  THead,
  Th,
  Td,
  StatusText,
} from '@/pages/fixlog-admin/ui/shared';

interface Selected {
  kind: ResourceKind;
  id: string;
  name: string;
}

/** Access 셀: ALLOW 는 초록, DENY 는 빨강으로 구분해 표시한다. */
function accessClass(type: AdminPermissionType): string {
  return type === 'DENY' ? 'text-destructive' : 'text-success';
}

/**
 * Permissions — 기획서 3장. 왼쪽 Folders & Documents 트리에서 리소스를 고르고 오른쫙에서 접근권을 관리한다.
 * [Users] 는 User Detail > Access 와 같은 기능이라 그쪽으로 보내고, [Ask AI] 는 서버 미지원으로 비활성.
 */
export function AdminPermissionsSection({ workspace }: { workspace: Workspace }) {
  const [selected, setSelected] = useState<Selected | null>(null);

  return (
    <div>
      <SectionTitle
        title="권한"
        description="폴더·문서 단위 접근권을 관리합니다. 폴더 권한은 하위 폴더·문서에 상속됩니다."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_minmax(0,1.6fr)]">
        {/* Left: tree */}
        <Card className="flex max-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            폴더 · 문서
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <RootTree selected={selected} onSelect={setSelected} />
          </div>
        </Card>

        {/* Right: detail */}
        <div className="min-w-0">
          {selected ? (
            <ResourcePermissionPanel
              key={`${selected.kind}-${selected.id}`}
              workspaceId={workspace.workspaceId}
              selected={selected}
              onClear={() => setSelected(null)}
            />
          ) : (
            <Notice>
              왼쪽에서 폴더나 문서를 선택하면 구성원별 접근 권한을 관리할 수 있습니다.
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tree                                                                  */
/* ------------------------------------------------------------------ */

function RootTree({ selected, onSelect }: { selected: Selected | null; onSelect: (s: Selected) => void }) {
  const { folders, documents, isLoaded } = useRootFolders(true);
  if (!isLoaded) return <p className="px-2 py-4 text-sm text-muted-foreground">불러오는 중…</p>;
  if (folders.length === 0 && documents.length === 0) {
    return <p className="px-2 py-4 text-sm text-muted-foreground">폴더·문서가 없습니다.</p>;
  }
  return (
    <ul className="space-y-0.5">
      {folders.map((f) => (
        <FolderNode key={f.folderId} folder={f} depth={0} selected={selected} onSelect={onSelect} />
      ))}
      {documents.map((d) => (
        <DocumentNode key={d.documentId} document={d} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function FolderNode({
  folder,
  depth,
  selected,
  onSelect,
}: {
  folder: FolderItem;
  depth: number;
  selected: Selected | null;
  onSelect: (s: Selected) => void;
}) {
  const [open, setOpen] = useState(false);
  const { childFolders, childDocuments, isLoaded, loadChildren } = useFolderChildren(folder.folderId);
  const isSelected = selected?.kind === 'folder' && selected.id === folder.folderId;

  useEffect(() => {
    if (open) void loadChildren();
  }, [open, loadChildren]);

  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md pr-2 text-sm',
          isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-muted'
        )}
        style={{ paddingLeft: depth * 14 + 4 }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '접기' : '펼치기'}
          className="flex size-6 shrink-0 items-center justify-center text-muted-foreground"
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => onSelect({ kind: 'folder', id: folder.folderId, name: folder.folderName })}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left"
        >
          <Folder className="size-4 shrink-0 text-primary" />
          <span className="truncate">{folder.folderName}</span>
        </button>
      </div>
      {open && (
        <ul className="space-y-0.5">
          {!isLoaded && (
            <li className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: (depth + 1) * 14 + 30 }}>
              불러오는 중…
            </li>
          )}
          {childFolders.map((f) => (
            <FolderNode key={f.folderId} folder={f} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
          {childDocuments.map((d) => (
            <DocumentNode key={d.documentId} document={d} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
          {isLoaded && childFolders.length === 0 && childDocuments.length === 0 && (
            <li className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: (depth + 1) * 14 + 30 }}>
              비어 있음
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

function DocumentNode({
  document,
  depth,
  selected,
  onSelect,
}: {
  document: DocumentDto;
  depth: number;
  selected: Selected | null;
  onSelect: (s: Selected) => void;
}) {
  const isSelected = selected?.kind === 'document' && selected.id === document.documentId;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect({ kind: 'document', id: document.documentId, name: document.title })}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm',
          isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-muted'
        )}
        style={{ paddingLeft: depth * 14 + 30 }}
      >
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{document.title || '제목 없음'}</span>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Resource permission panel                                             */
/* ------------------------------------------------------------------ */

function ResourcePermissionPanel({
  workspaceId,
  selected,
  onClear,
}: {
  workspaceId: string;
  selected: Selected;
  onClear: () => void;
}) {
  // Variables
  const isFolder = selected.kind === 'folder';
  const resourceType: AdminResourceType = isFolder ? 'FOLDER' : 'DOCUMENT';

  // Hooks — 이 리소스의 권한 현황 + 현재 워크스페이스의 모든 구성원.
  const list = useAdminResourcePermissions(workspaceId, resourceType, selected.id, true);
  const membersQuery = useAdminUsers(workspaceId);
  const grant = useAdminGrantPermission(workspaceId);
  const updatePerm = useAdminUpdatePermission(workspaceId);
  const remove = useAdminDeletePermission(workspaceId);

  // Variables
  // 소유자는 목록에서 숨긴다. 관리자는 표시하되 특권이라 라벨만 보이고 조작 컨트롤은 숨긴다.
  const members = (membersQuery.data ?? []).filter((m) => m.role !== 'OWNER');
  const grants = list.data?.permissions ?? [];
  // userId → 이 리소스에 직접 부여된 권한(있으면).
  const grantByUser = new Map(
    grants.filter((g) => g.principalType === 'USER').map((g) => [g.principalId, g])
  );

  // Functions — 공유(직접 ALLOW 권한) 부여/취소. 접근 차단은 DENY 가 아니라 공유 취소(회수)로 한다.
  // (서버가 DENY 를 강제하지 않으므로 접근을 없애려면 직접 권한을 회수해야 한다.)
  const setShared = (member: AdminUser, shared: boolean) => {
    const existing = grantByUser.get(member.userId);
    if (shared) {
      if (existing) {
        // 레거시 DENY 레코드가 남아 있으면 ALLOW 로 정정한다(공유 = 항상 ALLOW).
        if (existing.permissionType !== 'ALLOW') {
          updatePerm.mutate({
            permissionId: existing.permissionId,
            body: { permissionType: 'ALLOW', canDownload: existing.canDownload },
          });
        }
      } else {
        grant.mutate({
          resourceType,
          resourceId: selected.id,
          principalType: 'USER',
          principalId: member.userId,
          permissionType: 'ALLOW',
          canDownload: true,
        });
      }
    } else if (existing) {
      // 공유 취소 = 직접 권한 회수. (상속·기본값으로 열린 접근은 폴더 설정에서 조정)
      remove.mutate(existing.permissionId);
    }
  };

  const setDownload = (g: AdminPermission, canDownload: boolean) => {
    updatePerm.mutate({
      permissionId: g.permissionId,
      body: { permissionType: g.permissionType, canDownload },
    });
  };

  const isBusy = grant.isPending || updatePerm.isPending || remove.isPending;

  // 하단 카드 탭: 구성원 접근 권한(스위치) / 공유 내역(이 리소스의 모든 부여 기록)
  const [tab, setTab] = useState<'members' | 'shares'>('members');

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isFolder ? '폴더' : '문서'}
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
              {isFolder ? <Folder className="size-4 text-primary" /> : <FileText className="size-4 text-muted-foreground" />}
              <span className="truncate">{selected.name || '제목 없음'}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="선택 해제"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Inheritance */}
        <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
          <p className="font-medium text-foreground">상속</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isFolder
              ? '이 폴더에 부여한 권한은 하위 폴더·문서에 상속됩니다. 하위 항목에 직접 부여한 권한이 있으면 그것이 우선합니다.'
              : '상위 폴더에 부여된 권한을 상속받습니다(가까운 폴더 우선). 여기서 직접 부여한 권한이 있으면 그것이 우선합니다.'}
          </p>
        </div>

        {/* Folder settings — 현재 상속/기본 접근 값으로 초기화 (폴더만) */}
        {isFolder && list.data && (
          <FolderSettingsControl
            workspaceId={workspaceId}
            folderId={selected.id}
            current={{ inheritFromParent: list.data.inheritFromParent, baseAccess: list.data.baseAccess }}
          />
        )}
      </Card>

      {/* 구성원별 접근 권한 — 워크스페이스 모든 구성원을 표시하고 스위치로 허용/차단 */}
      <Card className="overflow-hidden">
        <div className="flex gap-1 border-b border-border px-3">
          {(['members', 'shares'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors',
                tab === key
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {key === 'members' ? '구성원 접근 권한' : '공유 내역'}
            </button>
          ))}
        </div>
        {tab === 'members' && (
        <>
        {membersQuery.isLoading || list.isLoading ? (
          <StatusText>불러오는 중…</StatusText>
        ) : membersQuery.isError || list.isError ? (
          <StatusText>권한 정보를 불러올 수 없습니다. (관리자만 조회 가능)</StatusText>
        ) : members.length === 0 ? (
          <StatusText>구성원이 없습니다.</StatusText>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const g = grantByUser.get(m.userId);
              const privileged = m.role === 'ADMIN' || m.role === 'OWNER';
              const shared = g?.permissionType === 'ALLOW';
              return (
                <li key={m.userId} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={m.userName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {m.userName}
                      <span className="ml-1.5 text-xs text-muted-foreground">{ROLE_LABEL[m.role]}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>

                  {/* 특권(소유자·관리자)은 라벨만, 조작 컨트롤은 숨긴다. */}
                  {privileged ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {m.role === 'OWNER' ? '소유자 · 전체 접근' : '관리자 · 전체 접근'}
                    </span>
                  ) : (
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {/* 공유(직접 권한): 켜면 부여(ALLOW), 끄면 공유 취소(회수). */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">공유</span>
                        <span
                          className={cn(
                            'w-14 text-right text-xs',
                            shared ? 'text-success' : 'text-muted-foreground'
                          )}
                        >
                          {shared ? '공유됨' : '공유 안 함'}
                        </span>
                        <Switch
                          checked={shared}
                          tone="success"
                          disabled={isBusy}
                          onCheckedChange={(v) => setShared(m, v)}
                          aria-label={`${m.userName} 공유`}
                        />
                      </div>

                      {/* 다운로드 권한: 공유된 경우에만 조작 가능. */}
                      <div className={cn('flex items-center gap-2', !shared && 'opacity-50')}>
                        <span className="text-xs text-muted-foreground">다운로드</span>
                        <span
                          className={cn(
                            'w-14 text-right text-xs',
                            shared && g?.canDownload ? 'text-success' : 'text-muted-foreground'
                          )}
                        >
                          {shared && g?.canDownload ? '허용' : '금지'}
                        </span>
                        <Switch
                          checked={!!(shared && g?.canDownload)}
                          tone="success"
                          disabled={!shared || !g || isBusy}
                          onCheckedChange={(v) => g && setDownload(g, v)}
                          aria-label={`${m.userName} 다운로드`}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="border-t border-border p-4 text-xs text-muted-foreground">
          <b>공유</b> 스위치로 구성원에게 직접 접근을 부여(ALLOW)하거나 취소(회수)합니다. 접근을 막으려면 공유를 취소하세요.
          다만 <b>상위 폴더 상속</b>이나 <b>기본 접근(baseAccess)</b>으로 열려 있으면 공유를 취소해도 여전히 접근될 수 있으며, 이때는 폴더 설정에서 조정합니다.
          관리자·소유자는 특권으로 항상 전체 접근이라 설정 대상이 아닙니다.
        </p>
        </>
        )}
        {tab === 'shares' && (
          <SharesTab grants={list.data?.permissions ?? []} loading={list.isLoading} error={list.isError} />
        )}
      </Card>
    </div>
  );
}

/**
 * 공유 내역 탭 — 이 리소스에 직접 부여된 모든 권한(구성원·그룹, 허용/차단).
 * 구성원이 다른 구성원에게 공유한 항목도 여기 나타난다. (서버가 부여자 정보를 제공하지 않아 "누가" 공유했는지는 표시 못 함.)
 */
function SharesTab({
  grants,
  loading,
  error,
}: {
  grants: AdminPermission[];
  loading: boolean;
  error: boolean;
}) {
  if (loading) return <StatusText>불러오는 중…</StatusText>;
  if (error) return <StatusText>공유 내역을 불러올 수 없습니다.</StatusText>;
  if (grants.length === 0) return <StatusText>이 리소스에 직접 부여된 공유가 없습니다.</StatusText>;
  return (
    <>
      <Table>
        <THead>
          <Th>대상</Th>
          <Th>권한</Th>
          <Th>다운로드</Th>
          <Th>부여일</Th>
        </THead>
        <tbody className="divide-y divide-border">
          {grants.map((p) => (
            <tr key={p.permissionId} className="hover:bg-muted/40">
              <Td>
                <span className="text-foreground">{p.principalName ?? p.principalId}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {p.principalType === 'GROUP' ? '그룹' : '사용자'}
                </span>
              </Td>
              <Td className={accessClass(p.permissionType)}>{PERMISSION_TYPE_LABEL[p.permissionType]}</Td>
              <Td
                className={
                  p.permissionType === 'DENY'
                    ? 'text-muted-foreground'
                    : p.canDownload
                      ? 'text-success'
                      : 'text-destructive'
                }
              >
                {p.permissionType === 'DENY' ? '—' : p.canDownload ? '허용' : '금지'}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">{formatDate(p.createAt)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="border-t border-border p-4 text-xs text-muted-foreground">
        이 리소스에 직접 부여된 모든 권한입니다 — 구성원이 다른 구성원에게 공유한 항목도 포함됩니다. 서버가 부여자
        정보를 제공하지 않아 &quot;누가&quot; 공유했는지는 표시되지 않습니다.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Folder settings (상속 끊기 / 기본 접근)                                */
/* ------------------------------------------------------------------ */

/**
 * 폴더 상속(inheritFromParent)·기본 접근(baseAccess) 설정.
 * 리소스 권한 조회 응답의 현재값으로 초기화하고, 적용 시 PATCH 로 저장한다.
 */
function FolderSettingsControl({
  workspaceId,
  folderId,
  current,
}: {
  workspaceId: string;
  folderId: string;
  current: { inheritFromParent: boolean | null; baseAccess: AdminPermissionType | null };
}) {
  const update = useAdminUpdateFolderSettings(workspaceId);
  const [inheritFromParent, setInheritFromParent] = useState(current.inheritFromParent ?? true);
  const [baseAccess, setBaseAccess] = useState<AdminPermissionType>(current.baseAccess ?? 'ALLOW');
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 변경 즉시 저장 — PATCH 는 두 필드를 함께 보내야 나머지가 기본값으로 초기화되지 않는다.
  const apply = (nextInherit: boolean, nextBase: AdminPermissionType) => {
    setErrorMessage(null);
    setSaved(false);
    update.mutate(
      { folderId, body: { inheritFromParent: nextInherit, baseAccess: nextBase } },
      {
        onSuccess: () => setSaved(true),
        onError: (error) =>
          setErrorMessage(getApiErrorMessage(error, '폴더 설정 저장에 실패했습니다.')),
      }
    );
  };

  return (
    <div className="mt-3 rounded-lg border border-border px-3 py-2.5 text-sm">
      <p className="font-medium text-foreground">폴더 설정</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={inheritFromParent}
            disabled={update.isPending}
            onChange={(e) => {
              setInheritFromParent(e.target.checked);
              apply(e.target.checked, baseAccess);
            }}
          />
          부모 폴더 권한 상속
        </label>
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          기본 접근
          <select
            value={baseAccess}
            disabled={update.isPending}
            onChange={(e) => {
              const next = e.target.value as AdminPermissionType;
              setBaseAccess(next);
              apply(inheritFromParent, next);
            }}
            className={cn(selectClass, 'h-8')}
            aria-label="기본 접근"
          >
            <option value="ALLOW">ALLOW · 허용</option>
            <option value="DENY">DENY · 차단</option>
          </select>
        </label>
        {update.isPending ? (
          <span className="text-xs text-muted-foreground">저장 중…</span>
        ) : saved ? (
          <span className="text-xs text-success">저장됨</span>
        ) : null}
      </div>
      {errorMessage && (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        변경하면 자동 저장됩니다. 상속을 끄면 상위 폴더 권한을 무시하고, 기본 접근은 직접 권한이 없는 구성원에게 적용됩니다(워크스페이스 기본값과 별개).
      </p>
    </div>
  );
}

