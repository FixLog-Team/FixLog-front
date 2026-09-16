import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Sparkles,
  Folder,
  // Clock, // TODO: Recent 재활성화 시 복구
  // Star,  // TODO: Favorites 재활성화 시 복구
  Settings,
  Hash,
  Plus,
  MessageSquare,
  ChevronsUpDown,
  Check,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import { searchConversationPath } from "@/shared/constants/routes";
import { LAYOUT } from "@/shared/constants/layout";
import { cn } from "@/shared/lib/utils/index";
import { Avatar } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { useRootFolders } from "@/domains/folders/hooks/use-root-folders";
import { useSession } from "@/domains/auth";
import { useConversations } from "@/domains/ai/hooks/use-conversations";
import { useWorkspaces, workspacesApi } from "@/domains/workspaces";
import { workspaceStorage } from "@/shared/lib/workspace/workspace-storage";
import { tokenStorage, decodeUserId } from "@/shared/lib/auth/token-storage";
import { DEV_ACCOUNTS } from "@/shared/lib/auth/dev-accounts";
import { NameInputDialog } from "@/shared/ui/name-input-dialog";
import { getApiErrorMessage } from "@/shared/lib/http/error-message";
import { CreateFolderDialog } from "@/features/folders/create-folder/ui/CreateFolderDialog";

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: "홈", to: ROUTES.WORKSPACE, icon: Home },
  { label: "AI 검색", to: ROUTES.SEARCH, icon: Sparkles },
  { label: "문서", to: ROUTES.DOCUMENTS, icon: Folder },
  { label: "휴지통", to: ROUTES.TRASH, icon: Trash2 },
  // TODO: Recent/Favorites 기능 연동 전까지 임시 비활성화
  // { label: 'Recent', to: `${ROUTES.DOCUMENTS}?view=recent`, icon: Clock },
  // { label: 'Favorites', to: `${ROUTES.DOCUMENTS}?view=favorites`, icon: Star },
  { label: "설정", to: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { folders } = useRootFolders(true);
  const { data: session } = useSession();
  const { data: conversationPage } = useConversations(5);
  const conversations = conversationPage?.items ?? [];
  const { data: workspaces } = useWorkspaces();

  // State — 팝업(폴더 생성 / 워크스페이스 생성)
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);

  // Variables
  const currentWorkspaceId = workspaceStorage.get();
  const currentWorkspace =
    workspaces?.find((w) => w.workspaceId === currentWorkspaceId) ??
    workspaces?.find((w) => w.personal) ??
    workspaces?.[0];
  // FixLog Admin 링크: 팀(비개인) 워크스페이스의 관리자에게만 노출.
  const canManage =
    !!currentWorkspace &&
    !currentWorkspace.personal &&
    (currentWorkspace.role === "ADMIN" || currentWorkspace.role === "OWNER");

  // Effects
  // 워크스페이스 목록이 오면 (1) 현재 선택을 이 계정의 "마지막 접속 워크스페이스"로 기록하고,
  // (2) 선택이 이 계정에서 접근 불가한 값(삭제/권한 회수)이면 비우고 재로드해 개인 스코프로 되돌린다.
  useEffect(() => {
    const userId = session?.userId;
    if (!userId || !workspaces) return;
    const stored = workspaceStorage.get();
    if (!stored) return;
    if (workspaces.some((w) => w.workspaceId === stored)) {
      workspaceStorage.setLastForUser(userId, stored);
    } else {
      workspaceStorage.clear();
      window.location.href = ROUTES.WORKSPACE;
    }
  }, [session?.userId, workspaces]);

  // Functions
  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  // 워크스페이스 전환: 스코프가 전면적으로 바뀌므로 하드 리로드로 전체 재조회.
  const switchWorkspace = (workspaceId: string) => {
    if (workspaceId === currentWorkspace?.workspaceId) return;
    workspaceStorage.set(workspaceId);
    // 이 계정의 "마지막 접속 워크스페이스"로 즉시 기록(재로드 후 복원용).
    if (session?.userId) workspaceStorage.setLastForUser(session.userId, workspaceId);
    window.location.href = ROUTES.WORKSPACE;
  };

  // 워크스페이스 생성 팝업 제출 → 성공 시 새 워크스페이스로 전환(하드 리로드).
  const handleCreateWorkspace = async (name: string) => {
    setIsCreatingWorkspace(true);
    setCreateWorkspaceError(null);
    try {
      const created = await workspacesApi.create({ workspaceName: name });
      setCreateWorkspaceOpen(false);
      switchWorkspace(created.workspaceId);
    } catch (error) {
      setCreateWorkspaceError(getApiErrorMessage(error, "워크스페이스 생성에 실패했습니다."));
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  // ⚠️ 임시(테스트용): 권한별 계정 전환. 토큰 교체 후, 그 계정이 마지막으로 보던 워크스페이스로 복원한다.
  const switchAccount = (token: string) => {
    tokenStorage.save(token, token);
    // 새 계정의 마지막 워크스페이스로 복원(없으면 개인 워크스페이스). 이전 계정 선택이 새 계정으로 새지 않게 한다.
    const nextUserId = decodeUserId(token);
    const last = nextUserId ? workspaceStorage.getLastForUser(nextUserId) : null;
    if (last) workspaceStorage.set(last);
    else workspaceStorage.clear();
    window.location.href = ROUTES.WORKSPACE;
  };

  // Render
  return (
    <aside
      style={{ width: LAYOUT.SIDEBAR_WIDTH }}
      className="flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Workspace switcher — 실제 워크스페이스 목록/전환/생성 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2.5 px-4 py-4 text-left transition-colors hover:bg-muted">
            <Avatar
              name={currentWorkspace?.workspaceName ?? "FixLog"}
              size="md"
              className="rounded-lg bg-primary"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {currentWorkspace?.workspaceName ?? "FixLog"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {currentWorkspace
                  ? currentWorkspace.personal
                    ? "개인 워크스페이스"
                    : currentWorkspace.role === "OWNER"
                      ? "소유자"
                      : currentWorkspace.role === "ADMIN"
                        ? "관리자"
                        : "구성원"
                  : " "}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          {(workspaces ?? []).map((ws) => (
            <DropdownMenuItem
              key={ws.workspaceId}
              onSelect={() => switchWorkspace(ws.workspaceId)}
            >
              <span className="min-w-0 flex-1 truncate">
                {ws.workspaceName}
                <span className="ml-1 text-xs text-muted-foreground">
                  {ws.personal ? "개인" : ws.role === "OWNER" ? "소유자" : ws.role === "ADMIN" ? "관리자" : "구성원"}
                </span>
              </span>
              {ws.workspaceId === currentWorkspace?.workspaceId && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateWorkspaceOpen(true)}>
            <Plus />
            새 워크스페이스
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 pb-2">
        {NAV_ITEMS.map((item) => (
          <div key={item.label}>
            <Link
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>

            {/* AI Search 하위 — 최근 대화방 5개 */}
            {item.to === ROUTES.SEARCH && conversations.length > 0 && (
              <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2 pt-0.5">
                {conversations.map((conv) => (
                  <Link
                    key={conv.conversationId}
                    to={searchConversationPath(conv.conversationId)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      location.pathname === searchConversationPath(conv.conversationId)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <MessageSquare className="size-3.5 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* FixLog Admin — 팀 워크스페이스 관리자에게만 노출(Settings 아래). 멤버 관리 팝업 기능을 흡수했다. */}
        {canManage && (
          <Link
            to={ROUTES.ADMIN}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              location.pathname.startsWith(ROUTES.ADMIN)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            <LayoutDashboard className="size-[18px] shrink-0" />
            <span>관리자 콘솔</span>
          </Link>
        )}
      </nav>

      {/* Folders */}
      <div className="flex min-h-0 flex-1 flex-col px-2">
        <div className="flex items-center justify-between px-2.5 pb-1 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            폴더
          </span>
          {/* 폴더 생성 팝업(백업본 기능 복구). 성공 시에만 새 폴더로 이동한다. */}
          <button
            type="button"
            onClick={() => setCreateFolderOpen(true)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="폴더 생성"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {folders.map((folder) => (
            <Link
              key={folder.folderId}
              to={ROUTES.DOCUMENTS}
              // Documents 페이지가 이 경로를 읽어 해당 폴더를 연다(백업본 기능 복구).
              state={{
                folderPath: [{ folderId: folder.folderId, folderName: folder.folderName }],
              }}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Hash className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{folder.folderName}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User profile — ⚠️ 임시(테스트용) 권한별 계정 전환 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2.5 border-t border-sidebar-border px-4 py-3 text-left transition-colors hover:bg-muted">
            <Avatar name={session?.userName ?? ""} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {session?.userName ?? "로그인 필요"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {session?.email ?? ""}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-60">
          <span className="block px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            테스트 계정 전환
          </span>
          {DEV_ACCOUNTS.map((acc) => (
            <DropdownMenuItem
              key={acc.key}
              onSelect={() => switchAccount(acc.token)}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">
                  {acc.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {acc.role}
                  </span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {acc.email}
                </span>
              </span>
              {session?.email === acc.email && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* 팝업들 */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={null}
        onCreated={(folder) =>
          navigate(ROUTES.DOCUMENTS, {
            state: { folderPath: [{ folderId: folder.folderId, folderName: folder.folderName }] },
          })
        }
      />
      <NameInputDialog
        open={createWorkspaceOpen}
        onOpenChange={(o) => {
          if (!o) setCreateWorkspaceError(null);
          setCreateWorkspaceOpen(o);
        }}
        title="새 워크스페이스"
        description="팀 워크스페이스를 만듭니다. 만든 사람이 소유자가 됩니다."
        placeholder="워크스페이스 이름"
        defaultValue="새 워크스페이스"
        isPending={isCreatingWorkspace}
        errorMessage={createWorkspaceError}
        onSubmit={handleCreateWorkspace}
      />
    </aside>
  );
}
