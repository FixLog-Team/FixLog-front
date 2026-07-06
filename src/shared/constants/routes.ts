export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGIN_CALLBACK: '/login/callback',
  DOCUMENTS: '/documents',
  DOCUMENT_EDITOR: '/documents/:documentId',
  DOCUMENT_HISTORY: '/documents/:documentId/history',
  SEARCH: '/search',
} as const;

export const documentDetailPath = (documentId: string) =>
  `/documents/${documentId}`;
