/**
 * 휴지통 도메인 타입. 서버 TrashItemDto 와 1:1 (FRONTEND_API_GUIDE 11장).
 * 워크스페이스 스코프이며, 지운 본인과 워크스페이스 관리자만 조회/복원/영구삭제할 수 있다.
 */

export type TrashResourceType = 'FOLDER' | 'DOCUMENT';

/** GET /api/trash 응답 요소. 폴더·문서를 한 목록에 섞어 최근 삭제순으로 준다. */
export interface TrashItem {
  resourceType: TrashResourceType;
  resourceId: string;
  name: string;
  /** 삭제한 사용자 id. */
  deletedBy: string | null;
  deletedAt: string | null;
}
