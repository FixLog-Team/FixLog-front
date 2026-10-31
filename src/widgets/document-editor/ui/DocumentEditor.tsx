import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type ReactNode } from 'react';
import {
  useCreateBlockNote,
  useEditorChange,
  FilePanelController,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import type { Block, PartialBlock } from '@blocknote/core';
import { createAuthedImageResolver, imagesApi, validateImageFile } from '@/domains/images';
import { toast } from '@/shared/ui/toast';
import { getApiErrorMessage } from '@/shared/lib/http/error-message';
import { ImageFilePanel } from '@/widgets/document-editor/ui/ImageFilePanel';

export interface DocumentEditorHandle {
  /** 현재 에디터 본문 블록. 저장/AI요약 시 페이지가 읽어간다. */
  getBlocks: () => Block[];
}

interface DocumentEditorProps {
  /** 서버 blocks(JSON 문자열)를 파싱한 BlockNote 블록 배열. 빈 문서면 undefined. */
  initialBlocks?: PartialBlock[];
  /** false 면 읽기 전용. 과거 버전 미리보기처럼 내용을 보여주기만 할 때 쓴다. */
  editable?: boolean;
  /**
   * 본문 아래에 이어 붙일 내용(연관 문서 등).
   * 스크롤 컨테이너를 이 위젯이 쥐고 있어, 밖에 두면 본문과 함께 스크롤되지 않고
   * 화면 하단에 고정돼 보인다. 그래서 슬롯으로 받아 안쪽에 그린다.
   */
  footer?: ReactNode;
  /**
   * 본문이 바뀔 때마다 현재 블록을 알려준다(선택).
   * 페이지가 변경 여부/최신 본문을 추적해 이탈 시 임시 저장하는 데 쓴다.
   */
  onChange?: (blocks: Block[]) => void;
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
>(function DocumentEditor({ initialBlocks, editable = true, footer, onChange }, ref) {
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
      // 형식·용량은 보내기 전에 거른다(서버 왕복 없이 즉시 안내).
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
      try {
        const { url } = await imagesApi.upload(file);
        return url;
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, '이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.')
        );
        throw error;
      }
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

  // 본문 변경 구독. 페이지가 변경 여부/최신 본문을 추적해 이탈 시 임시 저장한다.
  useEditorChange(() => onChange?.(editor.document), editor);

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
      <BlockNoteView
        editor={editor}
        theme="light"
        editable={editable}
        filePanel={false}
      >
        {/* 기본 파일 패널 대신 프로젝트 UI 에 맞춘 이미지 업로드/URL 패널 사용 */}
        <FilePanelController filePanel={ImageFilePanel} />
      </BlockNoteView>
      {footer}
    </div>
  );
});
