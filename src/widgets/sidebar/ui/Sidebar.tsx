import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Users,
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
import { tokenStorage } from "@/shared/lib/auth/token-storage";
import { DEV_ACCOUNTS } from "@/shared/lib/auth/dev-accounts";
import { MemberManageDialog } from "@/features/workspaces/manage-members/ui/MemberManageDialog";

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: ROUTES.WORKSPACE, icon: Home },
  { label: "AI Search", to: ROUTES.SEARCH, icon: Sparkles },
  { label: "Documents", to: ROUTES.DOCUMENTS, icon: Folder },
  { label: "휴지통", to: ROUTES.TRASH, icon: Trash2 },
  // TODO: Recent/Favorites 기능 연동 전까지 임시 비활성화
  // { label: 'Recent', to: `${ROUTES.DOCUMENTS}?view=recent`, icon: Clock },
  // { label: 'Favorites', to: `${ROUTES.DOCUMENTS}?view=favorites`, icon: Star },
  { label: "Settings", to: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  // Hooks
  const location = useLocation();
  const { folders } = useRootFolders(true);
  const { data: session } = useSession();
  const { data: conversationPage } = useConversations(5);
  const conversations = conversationPage?.items ?? [];
  const { data: workspaces } = useWorkspaces();

  // State
  const [manageOpen, setManageOpen] = useState(false);

  // Variables
  const currentWorkspaceId = workspaceStorage.get();
  const currentWorkspace =
    workspaces?.find((w) => w.workspaceId === currentWorkspaceId) ??
    workspaces?.find((w) => w.personal) ??
    workspaces?.[0];
  // 관리 버튼: 팀(비개인) 워크스페이스의 관리자에게만 노출.
  const canManage =
    !!currentWorkspace &&
    !currentWorkspace.personal &&
    currentWorkspace.role === "ADMIN";

  // Functions
  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  // 워크스페이스 전환: 스코프가 전면적으로 바뀌므로 하드 리로드로 전체 재조회.
  const switchWorkspace = (workspaceId: string) => {
    if (workspaceId === currentWorkspace?.workspaceId) return;
    workspaceStorage.set(workspaceId);
    window.location.href = ROUTES.WORKSPACE;
  };

  const handleCreateWorkspace = async () => {
    const name = window.prompt("워크스페이스 이름", "새 워크스페이스");
    if (!name) return;
    try {
      const created = await workspacesApi.create({ workspaceName: name });
      switchWorkspace(created.workspaceId);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  // ⚠️ 임시(테스트용): 권한별 계정 전환. 토큰 교체 후 워크스페이스 선택을 비우고 하드 리로드.
  const switchAccount = (token: string) => {
    tokenStorage.save(token, token);
    workspaceStorage.clear();
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
                  {ws.personal ? "개인" : ws.role === "ADMIN" ? "관리자" : "구성원"}
                </span>
              </span>
              {ws.workspaceId === currentWorkspace?.workspaceId && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleCreateWorkspace}>
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

        {/* 관리 — 팀 워크스페이스 관리자에게만 노출(Settings 아래) */}
        {canManage && (
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Users className="size-[18px] shrink-0" />
            <span>관리</span>
          </button>
        )}
      </nav>

      {/* Folders */}
      <div className="flex min-h-0 flex-1 flex-col px-2">
        <div className="flex items-center justify-between px-2.5 pb-1 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Folders
          </span>
          <Link
            to={ROUTES.DOCUMENTS}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Manage folders"
          >
            <Plus className="size-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {folders.map((folder) => (
            <Link
              key={folder.folderId}
              to={ROUTES.DOCUMENTS}
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

      {/* 멤버 관리 팝업(관리자) */}
      {currentWorkspace && (
        <MemberManageDialog
          open={manageOpen}
          onOpenChange={setManageOpen}
          workspaceId={currentWorkspace.workspaceId}
          workspaceName={currentWorkspace.workspaceName}
        />
      )}
    </aside>
  );
}
