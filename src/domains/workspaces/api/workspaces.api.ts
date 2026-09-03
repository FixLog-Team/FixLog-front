import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import { ensureSuccess } from '@/shared/lib/http/client';
import type {
  Workspace,
  WorkspaceRole,
  CreateWorkspaceBody,
  AiUsageSummary,
  SecurityPolicy,
  WorkspaceMember,
} from '@/domains/workspaces/types/workspace';

/**
 * 워크스페이스 API (FRONTEND_API_GUIDE 8·13·15장).
 *   GET  /api/workspaces                          → list (내가 속한 워크스페이스)
 *   POST /api/workspaces                          → create (만든 사람이 ADMIN)
 *   GET  /api/workspaces/{id}/ai-usage            → AI 사용량 요약
 *   GET  /api/workspaces/{id}/security-policy      → 보안 정책 조회(구성원)
 */
const PATH = '/api/workspaces';

export const workspacesApi = {
  async list(): Promise<Workspace[]> {
    const res = await http.get<ApiResponse<Workspace[]>>(PATH);
    return unwrap(res);
  },

  async create(body: CreateWorkspaceBody): Promise<Workspace> {
    const res = await http.post<ApiResponse<Workspace>>(PATH, body);
    return unwrap(res);
  },

  async getAiUsage(workspaceId: string): Promise<AiUsageSummary> {
    const res = await http.get<ApiResponse<AiUsageSummary>>(
      `${PATH}/${workspaceId}/ai-usage`
    );
    return unwrap(res);
  },

  async getSecurityPolicy(workspaceId: string): Promise<SecurityPolicy> {
    const res = await http.get<ApiResponse<SecurityPolicy>>(
      `${PATH}/${workspaceId}/security-policy`
    );
    return unwrap(res);
  },

  // --- 멤버 관리(관리자) ---

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const res = await http.get<ApiResponse<WorkspaceMember[]>>(
      `${PATH}/${workspaceId}/members`
    );
    return unwrap(res);
  },

  /** 이미 가입한 사용자를 이메일로 초대. 관리자만. */
  async invite(workspaceId: string, email: string): Promise<WorkspaceMember> {
    const res = await http.post<ApiResponse<WorkspaceMember>>(
      `${PATH}/${workspaceId}/members`,
      { email }
    );
    return unwrap(res);
  },

  /** 구성원 역할 변경. 관리자만. 마지막 관리자는 강등 불가. */
  async changeRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    const res = await http.patch<ApiResponse<WorkspaceMember>>(
      `${PATH}/${workspaceId}/members/${userId}`,
      { role }
    );
    return unwrap(res);
  },

  /** 구성원 제거. 관리자만. 마지막 관리자는 제거 불가. */
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(
      `${PATH}/${workspaceId}/members/${userId}`
    );
    ensureSuccess(res);
  },
};
