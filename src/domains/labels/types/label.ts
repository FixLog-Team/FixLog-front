/**
 * 라벨 도메인 타입. 서버 LabelDto / LabelRequest 와 1:1 대응.
 * (FRONTEND_API_GUIDE "12. 라벨 API" — 워크스페이스 단위로 이름을 공유하며, 없는 이름을 붙이면 그때 생성된다.)
 */

/** GET /api/labels, GET /api/documents/{id}/labels 응답 요소. */
export interface LabelDto {
  labelId: string;
  labelName: string;
}

/** POST /api/documents/{id}/labels 요청 바디. */
export interface AddLabelBody {
  labelName: string;
}
