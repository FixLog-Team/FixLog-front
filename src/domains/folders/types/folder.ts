import type { DocumentDto } from '@/domains/documents/types/document';

/**
 * 폴더 도메인 타입. 서버 DTO(안드로이드 FolderDto/FolderContentsDto/FolderTreeDto)와 1:1 대응.
 * NOTE: 서버에 workspace 개념이 없어 과거 workspaceId 필드는 제거됨(사용자 소유권 기반).
 */

/** 서버 FolderDto. */
export interface FolderItem {
  folderId: string;
  parentId: string | null;
  folderName: string;
  ordinal: number | null;
  createUser: string | null;
  createTime: string | null; // ISO-8601
  updateUser: string | null;
  updateTime: string | null; // ISO-8601
}

/** 폴더 콘텐츠(하위 폴더 + 문서). 서버 FolderContentsDto 대응. */
export interface FolderContents {
  folders: FolderItem[];
  documents: DocumentDto[];
}

/** 사이드바/이동 대상 선택용 폴더 트리 노드. 서버 FolderTreeDto 대응. */
export interface FolderTreeNode {
  folderId: string;
  parentId: string | null;
  folderName: string;
  ordinal: number | null;
  /** 직속 문서 수(하위 폴더 문서 미포함). */
  documentCount: number;
  children: FolderTreeNode[];
}

/** breadcrumb/경로 표시용 최소 폴더 정보. */
export interface FolderPathItem {
  folderId: string;
  folderName: string;
}

/** POST /api/folders 요청 바디. 루트 직속이면 parentId=null. */
export interface CreateFolderBody {
  parentId: string | null;
  folderName: string;
}

/** PUT /api/folders/{id} 요청 바디(이름 변경). 서버 FolderRequest 계약 { parentId, folderName }. */
export interface UpdateFolderBody {
  parentId: string | null;
  folderName: string;
}

/** PATCH /api/folders/{id}/move 요청 바디. 루트로 이동 시 parentId=null. */
export interface MoveFolderBody {
  parentId: string | null;
}
