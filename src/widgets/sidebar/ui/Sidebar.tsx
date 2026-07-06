import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Folder,
  Clock,
  Star,
  Settings,
  Hash,
  Plus,
  ChevronsUpDown,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { LAYOUT } from '@/shared/constants/layout';
import { cn } from '@/shared/lib/utils/index';
import { Avatar } from '@/shared/ui/avatar';
import { CURRENT_USER, CURRENT_WORKSPACE } from '@/domains/user/lib/mock-data/current-user';
import { DEMO_FOLDERS } from '@/domains/folders/lib/mock-data/folders';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: ROUTES.WORKSPACE, icon: Home },
  { label: 'AI Search', to: ROUTES.SEARCH, icon: Sparkles },
  { label: 'Documents', to: ROUTES.DOCUMENTS, icon: Folder },
  { label: 'Recent', to: `${ROUTES.DOCUMENTS}?view=recent`, icon: Clock },
  { label: 'Favorites', to: `${ROUTES.DOCUMENTS}?view=favorites`, icon: Star },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  // Hooks
  const location = useLocation();

  // Functions
  const isActive = (to: string) => {
    const [path] = to.split('?');
    return location.pathname === path;
  };

  // Render
  return (
    <aside
      style={{ width: LAYOUT.SIDEBAR_WIDTH }}
      className="flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Workspace switcher */}
      <button className="flex items-center gap-2.5 px-4 py-4 text-left transition-colors hover:bg-muted">
        <Avatar name={CURRENT_WORKSPACE.name} size="md" className="rounded-lg bg-primary" />
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
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="New folder"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {DEMO_FOLDERS.map((folder) => (
            <Link
              key={folder.id}
              to={ROUTES.DOCUMENTS}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Hash className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{folder.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User profile */}
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
