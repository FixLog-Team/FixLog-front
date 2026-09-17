import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';

/**
 * AI 응답 등 마크다운 텍스트를 렌더한다.
 * Tailwind typography 플러그인이 없어 요소별 유틸리티 클래스로 스타일을 준다.
 * (**굵게**, 목록, 제목, 코드, 표 등 GFM 지원)
 * remark-cjk-friendly: 한글 등 CJK 문자·문장부호에 붙은 굵게/기울임 강조가
 * CommonMark flanking 규칙 때문에 적용 안 되는 문제를 보정한다.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div
      className="
        text-sm leading-relaxed text-foreground
        [&_p]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
        [&_strong]:font-semibold [&_em]:italic
        [&_h1]:mb-1 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold
        [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold
        [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold
        [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:my-0.5 [&_li>ul]:my-1 [&_li>ol]:my-1
        [&_a]:text-primary [&_a]:underline
        [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]
        [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground
        [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse
        [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left
        [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1
        [&_hr]:my-3 [&_hr]:border-border
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkFriendly]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
