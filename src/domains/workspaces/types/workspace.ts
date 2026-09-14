/**
 * 워크스페이스 도메인 타입. 서버 WorkspaceDto 와 1:1 (FRONTEND_API_GUIDE 8장).
 */

// OWNER 는 ADMIN 권한을 모두 포함하는 최상위(임시 3단계 역할).
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

/** GET /api/workspaces 응답 요소. */
export interface Workspace {
  workspaceId: string;
  workspaceName: string;
  /** 개인 워크스페이스 여부(가입 시 자동 생성, 항상 본인이 ADMIN). */
  personal: boolean;
  role: WorkspaceRole;
  createAt: string | null;
}

/** POST /api/workspaces 요청 바디. */
export interface CreateWorkspaceBody {
  workspaceName: string;
}

/** GET /api/workspaces/{id}/members 응답 요소 (FRONTEND_API_GUIDE 8장). */
export interface WorkspaceMember {
  userId: string;
  userName: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string | null;
}

/** GET /api/workspaces/{id}/security-policy 응답 (FRONTEND_API_GUIDE 15장). */
export interface SecurityPolicy {
  workspaceId: string;
  /** 공유 허용 여부. false 면 개별 권한과 무관하게 공유 불가. */
  allowSharing: boolean;
  /** 다운로드 허용 여부. false 면 canDownload 권한이 있어도 반출 불가. */
  allowDownload: boolean;
  /** 다운로드 PDF 에 사용자 워터마크 각인. */
  enforceWatermark: boolean;
  auditRetentionDays: number;
  trashRetentionDays: number;
}

/** PATCH /api/workspaces/{id}/security-policy 요청 바디(관리자). 넘긴 필드만 바뀐다. */
export type SecurityPolicyUpdateBody = Partial<Omit<SecurityPolicy, 'workspaceId'>>;

