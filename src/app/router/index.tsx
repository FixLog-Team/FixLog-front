import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    lazy: () => import('@/pages/document-list/ui/document-list-page').then((m) => ({ Component: m.DocumentListPage })),
  },
  {
    path: ROUTES.DOCUMENT_EDITOR,
    lazy: () => import('@/pages/document-editor/ui/document-editor-page').then((m) => ({ Component: m.DocumentEditorPage })),
  },
  {
    path: ROUTES.DOCUMENT_HISTORY,
    lazy: () => import('@/pages/document-history/ui/document-history-page').then((m) => ({ Component: m.DocumentHistoryPage })),
  },
  {
    path: ROUTES.SEARCH,
    lazy: () => import('@/pages/search/ui/search-page').then((m) => ({ Component: m.SearchPage })),
  },
  {
    path: ROUTES.LOGIN,
    lazy: () => import('@/pages/login/ui/login-page').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: ROUTES.LOGIN_CALLBACK,
    lazy: () => import('@/pages/login/ui/login-callback-page').then((m) => ({ Component: m.LoginCallbackPage })),
  },
]);
