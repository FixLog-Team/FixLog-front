import type { Block, PartialBlock } from '@blocknote/core';

/**
 * 문서 임시 저장(draft). 서버에 draft 쓰기 API 가 없어 브라우저 localStorage 에 보관한다.
 * - 문서당 1개만 유지(같은 키 overwrite → 최근 임시 저장본만 남음).
 * - 실제 저장(PUT) 시 제거한다. 재진입 시 draft 가 있으면 그 내용으로 복원한다.
 * - 저장 위치가 브라우저라 기기/브라우저 간 공유되지 않는다(임시 보관 용도).
 */
export interface DocumentDraft {
  title: string;
  blocks: Block[] | PartialBlock[];
  /** 임시 저장 시각(ISO-8601). */
  savedAt: string;
}

const keyOf = (documentId: string) => `fixlog:doc-draft:${documentId}`;

/** 임시 저장(덮어쓰기). 용량 초과·프라이빗 모드 등 실패는 무시한다. */
export function saveDraft(
  documentId: string,
  draft: { title: string; blocks: Block[] | PartialBlock[] }
): void {
  try {
    const payload: DocumentDraft = { ...draft, savedAt: new Date().toISOString() };
    localStorage.setItem(keyOf(documentId), JSON.stringify(payload));
  } catch {
    /* 저장 실패(용량/프라이빗 모드)는 조용히 무시 */
  }
}

/** 임시 저장본 조회. 없거나 손상됐으면 null. */
export function loadDraft(documentId: string): DocumentDraft | null {
  try {
    const raw = localStorage.getItem(keyOf(documentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DocumentDraft;
    if (!parsed || !Array.isArray(parsed.blocks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 임시 저장본 삭제(실제 저장 완료 등). */
export function clearDraft(documentId: string): void {
  try {
    localStorage.removeItem(keyOf(documentId));
  } catch {
    /* 무시 */
  }
}
