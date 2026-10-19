import { http, unwrap } from '@/shared/lib/http/client';
import type { ApiResponse } from '@/shared/types';
import type { ImageUploadDto } from '@/domains/images/types/image';

/**
 * 이미지 API.
 *
 *   POST /api/images/upload        → upload (multipart, 폼 필드명 "file")
 *   GET  /api/images/{imageId}     → 원본 (서버가 권한 확인 후 만료 있는 서명 URL 로 302)
 *
 * NOTE: 조회 엔드포인트는 Authorization 헤더가 필요하다. 브라우저는 `<img src>` 요청에
 * 헤더를 싣지 않으므로 주소를 그대로 꽂으면 401 이 난다. blob 으로 받아 object URL 로 바꿔 쓴다.
 */
const PATH = '/api/images';

export const imagesApi = {
  /** 이미지를 올리고 문서에 넣을 조회 주소를 받는다. */
  async upload(file: File): Promise<ImageUploadDto> {
    const form = new FormData();
    form.append('file', file);

    // Content-Type 을 반드시 지워야 한다. 클라이언트 기본값(application/json)이 남아 있으면
    // axios 가 FormData 를 JSON 으로 직렬화해버려 파일이 조용히 사라진다
    // (defaults/index.js: isFormData && hasJSONContentType → JSON.stringify(formDataToJSON(data))).
    // 지우고 나면 브라우저가 boundary 를 포함한 multipart/form-data 로 채운다.
    const res = await http.post<ApiResponse<ImageUploadDto>>(`${PATH}/upload`, form, {
      headers: { 'Content-Type': undefined },
    });
    return unwrap(res);
  },

  /** 이미지 원본을 blob 으로 받는다. */
  async getBlob(imageId: string): Promise<Blob> {
    const res = await http.get<Blob>(`${PATH}/${imageId}`, { responseType: 'blob' });
    return res.data;
  },
};
