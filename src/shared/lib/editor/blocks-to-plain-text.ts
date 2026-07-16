/**
 * BlockNote 블록 트리에서 평문(plain text)을 추출한다.
 *
 * AI 요약(POST /ai/summarize)은 content 로 "원문 텍스트"를 직접 받으므로,
 * 서버의 plainText 추출에 의존하지 않고 클라이언트에서 본문 텍스트를 만들어 보낸다.
 * 추출 규칙은 서버 DocumentTextExtractor(BlockNote 지원판)와 동일하게 맞춘다:
 *   - inline content 배열의 text 노드를 이어붙여 한 줄로
 *   - table content(rows[].cells[])는 셀 텍스트를 공백으로 이어 한 줄로
 *   - children 은 재귀적으로 순회
 */

type InlineNode = { type?: string; text?: string };
type TableContent = { rows?: { cells?: unknown[] }[] };
type LooseBlock = {
  content?: InlineNode[] | TableContent;
  children?: LooseBlock[];
};

function inlineText(nodes: InlineNode[]): string {
  return nodes.map((n) => (typeof n?.text === 'string' ? n.text : '')).join('');
}

export function blocksToPlainText(blocks: readonly unknown[]): string {
  const lines: string[] = [];

  const walk = (bs: readonly unknown[]): void => {
    for (const raw of bs) {
      const b = raw as LooseBlock;
      const content = b.content;

      if (Array.isArray(content)) {
        const line = inlineText(content);
        if (line) lines.push(line);
      } else if (content && Array.isArray((content as TableContent).rows)) {
        for (const row of (content as TableContent).rows ?? []) {
          const cells = row?.cells;
          if (!Array.isArray(cells)) continue;
          const parts = cells.map((cell) =>
            Array.isArray(cell)
              ? inlineText(cell as InlineNode[])
              : String((cell as InlineNode)?.text ?? '')
          );
          lines.push(parts.join(' '));
        }
      }

      if (Array.isArray(b.children) && b.children.length) walk(b.children);
    }
  };

  walk(blocks);
  return lines.join('\n').trim();
}
