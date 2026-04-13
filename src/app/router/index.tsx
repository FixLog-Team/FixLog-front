import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('@/pages/document-list/ui/DocumentListPage').then((m) => ({ Component: m.DocumentListPage })),
  },
  {
    path: '/documents/:documentId',
    lazy: () => import('@/pages/document-detail/ui/DocumentDetailPage').then((m) => ({ Component: m.DocumentDetailPage })),
  },
  {
    path: '/documents/:documentId/history',
    lazy: () => import('@/pages/document-history/ui/DocumentHistoryPage').then((m) => ({ Component: m.DocumentHistoryPage })),
  },
  {
    path: '/search',
    lazy: () => import('@/pages/search/ui/SearchPage').then((m) => ({ Component: m.SearchPage })),
  },
  {
    path: '/login',
    lazy: () => import('@/pages/login/ui/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
]);
