import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type {
  TitleSearchResult,
  TitleSearchParams,
} from '@/domains/search/types/search';

/**
 * 검색 API.
 *   GET /search/title?q=&folderId=  → 폴더명 + 문서 제목 통합 검색(권한 필터 서버 적용)
 *
 * NOTE: 의미 기반 검색(POST /search)은 AI 도메인(ai.api)에서 다룬다.
 * 경로에 /api 접두사가 없다(서버 SearchController @RequestMapping("/search")).
 */
const PATH = '/search';

export const searchApi = {
  /** 제목 검색. folderId 를 주면 그 폴더 서브트리로 범위를 좁힌다. */
  async searchTitle({ q, folderId }: TitleSearchParams = {}): Promise<TitleSearchResult> {
    const res = await http.get<ApiResponse<TitleSearchResult>>(`${PATH}/title`, {
      params: {
        ...(q ? { q } : {}),
        ...(folderId ? { folderId } : {}),
      },
    });
    return unwrap(res);
  },
};
