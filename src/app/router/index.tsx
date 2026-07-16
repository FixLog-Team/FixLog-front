import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { RequireAuth } from '@/app/router/require-auth';

export const router = createBrowserRouter([
  // 공개 라우트
  {
    path: ROUTES.LANDING,
    lazy: () =>
      import('@/pages/landing/ui/LandingPage').then((m) => ({
        Component: m.LandingPage,
      })),
  },
  {
    path: ROUTES.LOGIN,
    lazy: () =>
      import('@/pages/login/ui/LoginPage').then((m) => ({
        Component: m.LoginPage,
      })),
  },
  {
    path: ROUTES.LOGIN_CALLBACK,
    lazy: () =>
      import('@/pages/login/ui/LoginCallbackPage').then((m) => ({
        Component: m.LoginCallbackPage,
      })),
  },
  // 인증 필요 라우트 (RequireAuth 가드 하위)
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.WORKSPACE,
        lazy: () =>
          import('@/pages/workspace-home/ui/WorkspaceHomePage').then((m) => ({
            Component: m.WorkspaceHomePage,
          })),
      },
      {
        path: ROUTES.DOCUMENTS,
        lazy: () =>
          import('@/pages/document-list/ui/DocumentListPage').then((m) => ({
            Component: m.DocumentListPage,
          })),
      },
      {
        path: ROUTES.DOCUMENT_EDITOR,
        lazy: () =>
          import('@/pages/document-editor/ui/DocumentEditorPage').then((m) => ({
            Component: m.DocumentEditorPage,
          })),
      },
      {
        path: ROUTES.DOCUMENT_HISTORY,
        lazy: () =>
          import('@/pages/document-history/ui/DocumentHistoryPage').then((m) => ({
            Component: m.DocumentHistoryPage,
          })),
      },
      {
        path: ROUTES.SEARCH,
        lazy: () =>
          import('@/pages/search/ui/SearchPage').then((m) => ({
            Component: m.SearchPage,
          })),
      },
      {
        path: ROUTES.SETTINGS,
        lazy: () =>
          import('@/pages/settings/ui/SettingsPage').then((m) => ({
            Component: m.SettingsPage,
          })),
      },
    ],
  },
]);
