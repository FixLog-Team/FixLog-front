/**
 * 일괄 작업(문서+폴더 혼합) 도메인 타입. 서버 /api/bulk 와 1:1.
 * 모든 작업은 문서/폴더 id 목록을 함께 받아 한 번에 처리하고,
 * 부분 성공(일부만 성공/일부 실패) 결과를 돌려준다.
 */

/** 실패한 항목 하나. */
export interface BulkFailure {
  id: string;
  reason: string;
}

/** 일괄 작업 결과(부분 성공 포함). 서버 BulkOperationResultDto 대응. */
export interface BulkOperationResult {
  totalRequested: number;
  succeededCount: number;
  failedCount: number;
  succeededIds: string[];
  failures: BulkFailure[];
}

/** 선택된 대상(문서 + 폴더 id 목록). */
export interface BulkTargets {
  documentIds: string[];
  folderIds: string[];
}

/** 일괄 이동 요청. targetFolderId=null 이면 루트로 이동. */
export interface BulkMoveBody extends BulkTargets {
  targetFolderId: string | null;
}

/** 일괄 다운로드 한도(서버 검증값과 동일). */
export const BULK_DOWNLOAD_MAX_DOCUMENTS = 100;
export const BULK_DOWNLOAD_MAX_FOLDERS = 50;
