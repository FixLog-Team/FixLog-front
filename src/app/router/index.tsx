import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    lazy: () => import('@/pages/document-list/ui/DocumentListPage').then((m) => ({ Component: m.DocumentListPage })),
  },
  {
    path: ROUTES.DOCUMENT_EDITOR,
    lazy: () => import('@/pages/document-editor/ui/DocumentEditorPage').then((m) => ({ Component: m.DocumentEditorPage })),
  },
  {
    path: ROUTES.DOCUMENT_HISTORY,
    lazy: () => import('@/pages/document-history/ui/DocumentHistoryPage').then((m) => ({ Component: m.DocumentHistoryPage })),
  },
  {
    path: ROUTES.SEARCH,
    lazy: () => import('@/pages/search/ui/SearchPage').then((m) => ({ Component: m.SearchPage })),
  },
  {
    path: ROUTES.LOGIN,
    lazy: () => import('@/pages/login/ui/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: ROUTES.LOGIN_CALLBACK,
    lazy: () => import('@/pages/login/ui/LoginCallbackPage').then((m) => ({ Component: m.LoginCallbackPage })),
  },
]);
