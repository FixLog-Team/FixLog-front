import type { FolderItem } from '@/domains/folders/types/folder';
import type { DocumentDto } from '@/domains/documents/types/document';

/**
 * GET /search/title 응답 result.
 * 폴더 이름 + 문서 제목 통합 키워드 검색 결과(본문은 검색하지 않음).
 * 권한 필터가 서버에서 적용되어 접근 불가 항목은 포함되지 않는다.
 * (목록 조회와 동일하게 documents[].createUserName / createUserPictureUrl 은 null)
 */
export interface TitleSearchResult {
  folders: FolderItem[];
  documents: DocumentDto[];
}

export interface TitleSearchParams {
  /** 검색 키워드(대소문자 무시 부분 일치). 생략 시 전체 반환. */
  q?: string;
  /** 지정 시 해당 폴더의 서브트리 전체로 범위 제한. 생략 시 워크스페이스 전체. */
  folderId?: string | null;
}
