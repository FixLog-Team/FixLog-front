import { http, unwrap, ensureSuccess } from '@/shared/lib/http/client';
import type { ApiResponse, PageResponse } from '@/shared/types';
import {
  normalizeResourceAccessError,
  ResourceAccessDeniedError,
} from '@/shared/lib/http/resource-access-error';
import {
  blockNoteToEditorJs,
  editorJsToBlockNote,
} from '@/shared/lib/editor/block-format-converter';
import type {
  DocumentDto,
  DocumentDuplicateDto,
  DocumentHistoryDto,
  DocumentHistoryDetailDto,
  CreateDocumentBody,
  SaveDocumentBody,
  MoveDocumentBody,
  RenameDocumentBody,
  ListDocumentsParams,
  ResourcePermissionDto,
} from '@/domains/documents/types/document';

/**
 * 서버 문서(document) API. 안드로이드 DocumentApi 와 1:1 대응.
 *
 *   POST   /api/documents                        → create
 *   GET    /api/documents?folderId&page&size     → list
 *   GET    /api/documents/{id}                   → getDocument
 *   PUT    /api/documents/{id}                   → saveContent
 *   PATCH  /api/documents/{id}/title             → updateTitle
 *   PATCH  /api/documents/{id}/move              → move
 *   POST   /api/documents/{id}/duplicate         → duplicate
 *   DELETE /api/documents/{id}                   → remove
 *   GET    /api/documents/{id}/save-state        → getSaveState
 *   GET    /api/documents/{id}/download          → downloadPdf (application/pdf)
 *   GET    /api/documents/{id}/history           → listHistory
 *   GET    /api/documents/{id}/history/{hid}     → getHistoryVersion
 *   POST   /api/documents/{id}/history/{hid}/restore → restoreHistory
 */
const PATH = '/api/documents';

export const documentsApi = {
  /** 새 문서 생성. 루트 직속이면 folderId=null. */
  async create(body: CreateDocumentBody): Promise<DocumentDto> {
    const res = await http.post<ApiResponse<DocumentDto>>(PATH, body);
    return unwrap(res);
  },

  /** 문서 목록(페이지네이션). folderId 미지정 시 전체(updateTime DESC). */
  async list({ folderId, page = 0, size = 20 }: ListDocumentsParams = {}): Promise<
    PageResponse<DocumentDto>
  > {
    const res = await http.get<ApiResponse<PageResponse<DocumentDto>>>(PATH, {
      params: {
        page,
        size,
        ...(folderId ? { folderId } : {}),
      },
    });
    return unwrap(res);
  },

  /** 현재 사용자의 문서 유효 권한 조회. */
  async getMyPermission(documentId: string): Promise<ResourcePermissionDto> {
    try {
      const res = await http.get<ApiResponse<ResourcePermissionDto>>(
        `${PATH}/${documentId}/my-permission`
      );
      return unwrap(res);
    } catch (error) {
      return normalizeResourceAccessError(error);
    }
  },

  /**
   * 문서 상세(본문 blocks 포함).
   * 직접 URL 진입에서도 본문 요청 전에 유효 권한을 확인한다.
   */
  async getDocument(documentId: string): Promise<DocumentDto> {
    const permission = await documentsApi.getMyPermission(documentId);
    if (!permission.access) {
      throw new ResourceAccessDeniedError();
    }

    const res = await http.get<ApiResponse<DocumentDto>>(`${PATH}/${documentId}`);
    const dto = unwrap(res);
    if (dto.blocks) {
      try {
        const parsed = JSON.parse(dto.blocks);
        if (Array.isArray(parsed)) {
          return { ...dto, blocks: JSON.stringify(editorJsToBlockNote(parsed)) };
        }
      } catch {
        /* 파싱 불가 시 원본 유지 */
      }
    }
    return dto;
  },

  /**
   * 문서 제목 + 본문(blocks) 저장. 클라이언트(BlockNote) → 서버(Editor.js) 포맷으로 변환해 전송한다.
   */
  async saveContent(documentId: string, body: SaveDocumentBody): Promise<DocumentDto> {
    const blocks = Array.isArray(body.blocks) ? blockNoteToEditorJs(body.blocks) : body.blocks;
    const res = await http.put<ApiResponse<DocumentDto>>(`${PATH}/${documentId}`, { ...body, blocks });
    return unwrap(res);
  },

  /** 문서 제목만 변경. */
  async updateTitle(documentId: string, body: RenameDocumentBody): Promise<DocumentDto> {
    const res = await http.patch<ApiResponse<DocumentDto>>(`${PATH}/${documentId}/title`, body);
    return unwrap(res);
  },

  /** 문서를 다른 폴더로 이동. 루트로 이동 시 folderId=null. */
  async move(documentId: string, body: MoveDocumentBody): Promise<DocumentDto> {
    const res = await http.patch<ApiResponse<DocumentDto>>(`${PATH}/${documentId}/move`, body);
    return unwrap(res);
  },

  /** 문서 복제. */
  async duplicate(documentId: string): Promise<DocumentDuplicateDto> {
    const res = await http.post<ApiResponse<DocumentDuplicateDto>>(`${PATH}/${documentId}/duplicate`);
    return unwrap(res);
  },

  /** 문서 삭제. */
  async remove(documentId: string): Promise<void> {
    const res = await http.delete<ApiResponse<unknown>>(`${PATH}/${documentId}`);
    ensureSuccess(res);
  },

  /** 저장 상태 조회. result 스키마가 명세에 없어 raw 로 반환. */
  async getSaveState(documentId: string): Promise<unknown> {
    const res = await http.get<ApiResponse<unknown>>(`${PATH}/${documentId}/save-state`);
    return unwrap(res);
  },

  /** 문서 PDF 다운로드. 공통 JSON 래퍼가 아니라 application/pdf 바이너리(Blob). */
  async downloadPdf(documentId: string): Promise<Blob> {
    const res = await http.get<Blob>(`${PATH}/${documentId}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * 문서 버전 히스토리 목록(최신순). 현재 본문은 포함되지 않고 지나간 버전만 반환된다.
   * 서버가 문서당 보존 개수를 제한하므로(기본 50) 한 번에 받아 페이지네이션 없이 표시한다.
   */
  async listHistory(
    documentId: string,
    { page = 0, size = 50 }: { page?: number; size?: number } = {}
  ): Promise<PageResponse<DocumentHistoryDto>> {
    const res = await http.get<ApiResponse<PageResponse<DocumentHistoryDto>>>(
      `${PATH}/${documentId}/history`,
      { params: { page, size } }
    );
    return unwrap(res);
  },

  /** 특정 버전 상세(본문 포함). 서버 Editor.js blocks 를 BlockNote 로 변환해 반환. */
  async getHistoryVersion(
    documentId: string,
    historyId: string
  ): Promise<DocumentHistoryDetailDto> {
    const res = await http.get<ApiResponse<DocumentHistoryDetailDto>>(
      `${PATH}/${documentId}/history/${historyId}`
    );
    const dto = unwrap(res);
    if (dto.blocks) {
      try {
        const parsed = JSON.parse(dto.blocks);
        if (Array.isArray(parsed)) {
          return { ...dto, blocks: JSON.stringify(editorJsToBlockNote(parsed)) };
        }
      } catch {
        /* 파싱 불가 시 원본 유지 */
      }
    }
    return dto;
  },

  /**
   * 특정 버전으로 문서를 되돌린다. 복원 직전 내용도 서버가 히스토리에 남기므로
   * 잘못 복원해도 다시 되돌릴 수 있다. 복원된 문서 전체를 반환한다.
   */
  async restoreHistory(documentId: string, historyId: string): Promise<DocumentDto> {
    const res = await http.post<ApiResponse<DocumentDto>>(
      `${PATH}/${documentId}/history/${historyId}/restore`
    );
    return unwrap(res);
  },
};
