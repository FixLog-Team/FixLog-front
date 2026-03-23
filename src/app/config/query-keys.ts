export const QUERY_KEYS = {
  documents: {
    all: ['documents'] as const,
    list: (folderId?: string) => ['documents', 'list', folderId] as const,
    detail: (documentId: string) => ['documents', documentId] as const,
    history: (documentId: string) => ['documents', documentId, 'history'] as const,
    historyDetail: (documentId: string, historyId: string) =>
      ['documents', documentId, 'history', historyId] as const,
    saveState: (documentId: string) => ['documents', documentId, 'save-state'] as const,
  },
  folders: {
    all: ['folders'] as const,
    contents: (folderId: string) => ['folders', folderId, 'contents'] as const,
  },
  auth: {
    session: ['auth', 'session'] as const,
  },
  ai: {
    job: (jobId: string) => ['ai', 'jobs', jobId] as const,
  },
  user: {
    me: ['user', 'me'] as const,
    workspaces: ['user', 'me', 'workspaces'] as const,
  },
  search: {
    results: (query: string) => ['search', query] as const,
  },
} as const;
