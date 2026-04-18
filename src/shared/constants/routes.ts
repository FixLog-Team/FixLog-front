export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DOCUMENT_DETAIL: '/documents/:documentId',
  DOCUMENT_HISTORY: '/documents/:documentId/history',
  SEARCH: '/search',
} as const;

export function documentDetailPath(documentId: string) {
  return `/documents/${documentId}`;
}
