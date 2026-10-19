import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import type { Block, PartialBlock } from '@blocknote/core';
import { createAuthedImageResolver, imagesApi } from '@/domains/images';

export interface DocumentEditorHandle {
  /** 현재 에디터 본문 블록. 저장/AI요약 시 페이지가 읽어간다. */
  getBlocks: () => Block[];
}

interface DocumentEditorProps {
  /** 서버 blocks(JSON 문자열)를 파싱한 BlockNote 블록 배열. 빈 문서면 undefined. */
  initialBlocks?: PartialBlock[];
  /** false 면 읽기 전용. 과거 버전 미리보기처럼 내용을 보여주기만 할 때 쓴다. */
  editable?: boolean;
}

/**
 * BlockNote 기반 문서 본문 에디터.
 * 헤더/저장/AI요약 등 컨트롤은 페이지(DocumentEditorPage)가 소유하며,
 * 이 위젯은 본문 렌더링과 현재 블록 노출(getBlocks)만 담당한다.
 * (initialContent 는 마운트 시 1회만 반영 → 페이지가 로딩 완료 후 key={documentId} 로 마운트)
 */
export const DocumentEditor = forwardRef<
  DocumentEditorHandle,
  DocumentEditorProps
>(function DocumentEditor({ initialBlocks, editable = true }, ref) {
  // 에디터 수명과 함께 가야 object URL 을 떠날 때 한 번에 해제할 수 있다
  const imageResolver = useMemo(() => createAuthedImageResolver(), []);
  useEffect(() => () => imageResolver.dispose(), [imageResolver]);

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    /**
     * 이미지 삽입(드래그·붙여넣기·슬래시 메뉴) 시 호출된다.
     * 문서에는 만료되지 않고 권한 검사를 거치는 조회 주소를 저장한다.
     * 서명 URL 을 저장하면 만료 후 문서가 깨지고 권한 검사도 우회된다.
     */
    uploadFile: async (file: File) => {
      const { url } = await imagesApi.upload(file);
      return url;
    },
    /**
     * 저장된 주소를 화면에 그릴 수 있는 주소로 바꾼다.
     * 조회 엔드포인트가 Authorization 헤더를 요구해 `<img src>` 로는 401 이 나기 때문이다.
     */
    resolveFileUrl: imageResolver.resolve,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({ getBlocks: () => editor.document }), [
    editor,
  ]);

  // BlockNote 사이드 메뉴(+ / 드래그 핸들)는 hover 한 블록에 붙어 스크롤 시 그대로 따라다녀
  // 어색하게 남는다. 스크롤 중에는 숨기고(is-scrolling), 다음 마우스 이동(hover) 때 다시 보이게 한다.
  const hideSideMenuWhileScrolling = () =>
    scrollRef.current?.classList.add('is-scrolling');
  const restoreSideMenuOnMove = () =>
    scrollRef.current?.classList.remove('is-scrolling');

  return (
    <div
      ref={scrollRef}
      onScroll={hideSideMenuWhileScrolling}
      onMouseMove={restoreSideMenuOnMove}
      className="h-full overflow-y-auto bg-card [&.is-scrolling_.bn-side-menu]:!hidden [&_.bn-editor]:mx-auto [&_.bn-editor]:max-w-4xl [&_.bn-editor]:px-24 [&_.bn-editor]:py-12"
    >
      <BlockNoteView editor={editor} theme="light" editable={editable} />
    </div>
  );
});
