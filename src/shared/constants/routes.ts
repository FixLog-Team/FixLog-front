export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  LOGIN_CALLBACK: '/login/callback',
  WORKSPACE: '/workspace',
  DOCUMENTS: '/documents',
  DOCUMENT_EDITOR: '/documents/:documentId',
  DOCUMENT_HISTORY: '/documents/:documentId/history',
  SEARCH: '/search',
  SEARCH_CONVERSATION: '/search/:conversationId',
  SETTINGS: '/settings',
} as const;

export const documentDetailPath = (documentId: string) =>
  `/documents/${documentId}`;

export const documentHistoryPath = (documentId: string) =>
  `/documents/${documentId}/history`;

export const searchConversationPath = (conversationId: string) =>
  `/search/${conversationId}`;
