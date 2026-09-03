export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  LOGIN_CALLBACK: '/login/callback',
  WORKSPACE: '/workspace',
  DOCUMENTS: '/documents',
  TRASH: '/trash',
  DOCUMENT_EDITOR: '/documents/:documentId',
  SEARCH: '/search',
  SEARCH_CONVERSATION: '/search/:conversationId',
  SETTINGS: '/settings',
} as const;

export const documentDetailPath = (documentId: string) =>
  `/documents/${documentId}`;

export const searchConversationPath = (conversationId: string) =>
  `/search/${conversationId}`;
