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
  /** 이메일 초대 링크 진입점. 수락/거절 후 홈으로 이동. */
  INVITE: '/invite/:token',
  /** FixLog Admin(임시). 팀 워크스페이스 ADMIN/OWNER 전용. 하위 섹션은 adminPath() 로 만든다. */
  ADMIN: '/admin',
} as const;

export type AdminSection = 'users' | 'permissions' | 'invitations' | 'audit-logs' | 'settings';

/** FixLog Admin 섹션 경로. id 가 있으면 상세(예: users/{userId}). */
export const adminPath = (section: AdminSection, id?: string) =>
  id ? `${ROUTES.ADMIN}/${section}/${id}` : `${ROUTES.ADMIN}/${section}`;

export const documentDetailPath = (documentId: string) =>
  `/documents/${documentId}`;

export const searchConversationPath = (conversationId: string) =>
  `/search/${conversationId}`;

export const invitePath = (token: string) => `/invite/${token}`;
