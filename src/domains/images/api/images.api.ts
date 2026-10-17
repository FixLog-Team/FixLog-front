import { http } from '@/shared/lib/http/client';

/**
 * 이미지 API.
 *
 *   GET /api/images/{imageId} → 원본 (서버가 권한 확인 후 만료 있는 서명 URL 로 302)
 *
 * NOTE: 이 엔드포인트는 Authorization 헤더가 필요하다. 브라우저는 `<img src>` 요청에
 * 헤더를 싣지 않으므로 주소를 그대로 꽂으면 401 이 난다. blob 으로 받아 object URL 로 바꿔 쓴다.
 */
const PATH = '/api/images';

export const imagesApi = {
  /** 이미지 원본을 blob 으로 받는다. */
  async getBlob(imageId: string): Promise<Blob> {
    const res = await http.get<Blob>(`${PATH}/${imageId}`, { responseType: 'blob' });
    return res.data;
  },
};
