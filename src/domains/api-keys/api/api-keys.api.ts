import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { ApiKey, RegisterApiKeyBody } from '@/domains/api-keys/types/api-key';

/**
 * 사용자 AI API Key API (FRONTEND_API_GUIDE 13장).
 *   GET    /api/users/me/ai-keys          → list (마스킹된 목록)
 *   POST   /api/users/me/ai-keys          → register ({ provider, apiKey }, 같은 provider 는 교체)
 *   DELETE /api/users/me/ai-keys/{keyId}  → remove
 */
const PATH = '/api/users/me/ai-keys';

export const apiKeysApi = {
  async list(): Promise<ApiKey[]> {
    const res = await http.get<ApiResponse<ApiKey[]>>(PATH);
    return unwrap(res);
  },

  async register(body: RegisterApiKeyBody): Promise<void> {
    const res = await http.post<ApiResponse<unknown>>(PATH, body);
    ensureSuccess(res);
  },

  async remove(keyId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(`${PATH}/${keyId}`);
    ensureSuccess(res);
  },
};
