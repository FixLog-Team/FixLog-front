import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Folder,
  // Clock, // TODO: Recent 재활성화 시 복구
  // Star,  // TODO: Favorites 재활성화 시 복구
  Settings,
  Hash,
  Plus,
  ChevronsUpDown,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { LAYOUT } from '@/shared/constants/layout';
import { cn } from '@/shared/lib/utils/index';
import { Avatar } from '@/shared/ui/avatar';
import {
  CURRENT_USER,
  CURRENT_WORKSPACE,
} from '@/domains/user/lib/mock-data/current-user';
import { useRootFolders } from '@/domains/folders/hooks/use-root-folders';
import { useCreateFolder } from '@/features/folders/create-folder/hooks/use-create-folder';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: ROUTES.WORKSPACE, icon: Home },
  { label: 'AI Search', to: ROUTES.SEARCH, icon: Sparkles },
  { label: 'Documents', to: ROUTES.DOCUMENTS, icon: Folder },
  // TODO: Recent/Favorites 기능 연동 전까지 임시 비활성화
  // { label: 'Recent', to: `${ROUTES.DOCUMENTS}?view=recent`, icon: Clock },
  // { label: 'Favorites', to: `${ROUTES.DOCUMENTS}?view=favorites`, icon: Star },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { folders } = useRootFolders(true);
  const createFolder = useCreateFolder();

  // Functions
  const isActive = (to: string) => {
    const [path] = to.split('?');
    return location.pathname === path;
  };

  // 폴더 생성 팝업 → 생성에 성공했을 때만 Documents 로 이동하고 사이드바 목록을 갱신한다.
  const handleCreateFolder = async () => {
    const folderName = window.prompt('폴더 이름을 입력하세요', 'New Folder');
    if (!folderName) return; // 취소 시 아무 것도 하지 않음(이동 X)
    try {
      await createFolder.mutateAsync({ parentId: null, folderName });
      // 사이드바 목록은 useCreateFolder 의 folders.all invalidate 로 자동 갱신된다.
      navigate(ROUTES.DOCUMENTS);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  // Render
  return (
    <aside
      style={{ width: LAYOUT.SIDEBAR_WIDTH }}
      className="flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Workspace switcher (서버에 workspace 개념 없음 → 표시용) */}
      <button className="flex items-center gap-2.5 px-4 py-4 text-left transition-colors hover:bg-muted">
        <Avatar
          name={CURRENT_WORKSPACE.name}
          size="md"
          className="rounded-lg bg-primary"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {CURRENT_WORKSPACE.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {CURRENT_WORKSPACE.company}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 pb-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Folders */}
      <div className="flex min-h-0 flex-1 flex-col px-2">
        <div className="flex items-center justify-between px-2.5 pb-1 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Folders
          </span>
          <button
            type="button"
            onClick={handleCreateFolder}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Create folder"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {folders.map((folder) => (
            <Link
              key={folder.folderId}
              to={ROUTES.DOCUMENTS}
              state={{
                folderPath: [
                  { folderId: folder.folderId, folderName: folder.folderName },
                ],
              }}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Hash className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{folder.folderName}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User profile (서버 /users/me 미연동 → 표시용) */}
      <div className="flex items-center gap-2.5 border-t border-sidebar-border px-4 py-3">
        <Avatar name={CURRENT_USER.name} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {CURRENT_USER.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {CURRENT_USER.email}
          </span>
        </span>
      </div>
    </aside>
  );
}
