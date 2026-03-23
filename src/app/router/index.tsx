import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('@/pages/document-list/ui/document-list-page').then((m) => ({ Component: m.DocumentListPage })),
  },
  {
    path: '/documents/:documentId',
    lazy: () => import('@/pages/document-editor/ui/document-editor-page').then((m) => ({ Component: m.DocumentEditorPage })),
  },
  {
    path: '/documents/:documentId/history',
    lazy: () => import('@/pages/document-history/ui/document-history-page').then((m) => ({ Component: m.DocumentHistoryPage })),
  },
  {
    path: '/search',
    lazy: () => import('@/pages/search/ui/search-page').then((m) => ({ Component: m.SearchPage })),
  },
  {
    path: '/login',
    lazy: () => import('@/pages/login/ui/login-page').then((m) => ({ Component: m.LoginPage })),
  },
]);
