/**
 * 행 액션(⋮ 메뉴)이 다루는 대상. 폴더/문서를 정규화한 형태.
 * - folder: 이름 변경 시 서버 계약상 parentId 를 함께 보내야 하므로 포함한다.
 * - document: 이동/삭제/이름변경/복제에 id·name 만 있으면 된다.
 */
export type ActionTarget =
  | { kind: 'folder'; id: string; name: string; parentId: string | null }
  | { kind: 'document'; id: string; name: string };
