/**
 * BlockNote(웹 에디터) 블록 포맷 ↔ Editor.js(서버가 허용/추출하는) 블록 포맷 변환기.
 *
 * 서버(FixLog-Server ai_save)의 blocks 검증/추출은 Editor.js 스키마만 이해한다
 * (허용 type: paragraph/header/list/code/image/table, 텍스트는 data.text/items/code).
 * 웹 에디터는 BlockNote 스키마(type: heading/bulletListItem/codeBlock…, 텍스트는 content[].text)를 쓴다.
 * 이 불일치로 BlockNote 문서를 그대로 저장하면 서버가 400(허용되지 않는 block type) 또는 plainText 빈 값을 낸다.
 *
 * 그래서 **저장 시 BlockNote → Editor.js**, **조회 시 Editor.js → BlockNote** 로 변환한다.
 * (안드로이드 앱의 BlockFormatConverter.kt 와 동일한 알고리즘)
 *
 * 설계 원칙
 * - 포맷 자동 감지: 이미 대상 포맷인 블록은 그대로 통과(기존 BlockNote 저장 문서 보호 + 이중 변환 방지).
 * - table/image 는 type 이름이 동일하고 서버 검증도 통과하므로 원본 그대로 통과.
 * - 실패 시 입력을 그대로 반환(변환기 버그가 저장/조회를 죽이지 않도록).
 *
 * 손실(lossy): Editor.js 허용 type 이 좁아 checkListItem→bullet, quote→paragraph, 리스트 중첩 평탄화,
 * 링크 URL·글자색은 왕복 시 소실. 인라인 서식(bold/italic/underline/strike/code)은 HTML 태그로 보존.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const LIST_UNORDERED = new Set(['bulletListItem', 'checkListItem']);
const STYLE_TAGS: Array<[string, string]> = [
  ['bold', 'b'], ['italic', 'i'], ['underline', 'u'], ['strike', 's'], ['code', 'code'],
];
const TAG_TO_STYLE: Record<string, string> = {
  b: 'bold', strong: 'bold', i: 'italic', em: 'italic',
  u: 'underline', s: 'strike', strike: 'strike', del: 'strike', code: 'code',
};

// ---------------- 포맷 감지 ----------------
const isEditorJsBlock = (b: any): boolean =>
  b != null && 'data' in b && !('content' in b);
const isBlockNoteBlock = (b: any): boolean =>
  b != null && !('data' in b) && ('content' in b || 'props' in b);

// ---------------- 인라인 변환 ----------------
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unescapeHtml = (s: string): string =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function inlineToHtml(content: any): string {
  if (!Array.isArray(content)) return '';
  let sb = '';
  for (const n of content) {
    if (n?.type === 'text') {
      const styles = n.styles || {};
      let open = '', close = '';
      for (const [style, tag] of STYLE_TAGS) {
        if (styles[style]) { open += `<${tag}>`; close = `</${tag}>${close}`; }
      }
      sb += open + escapeHtml(String(n.text ?? '')) + close;
    } else if (n?.type === 'link') {
      sb += escapeHtml(inlineToPlain(n.content));
    }
  }
  return sb;
}

function inlineToPlain(content: any): string {
  if (!Array.isArray(content)) return '';
  let sb = '';
  for (const n of content) {
    if (n?.type === 'text') sb += String(n.text ?? '');
    else if (n?.type === 'link') sb += inlineToPlain(n.content);
  }
  return sb;
}

function htmlToInline(html: string): any[] {
  const result: any[] = [];
  if (!html) return result;
  const active = new Set<string>();
  let buf = '';
  const flush = () => {
    if (!buf) return;
    const styles: Record<string, boolean> = {};
    for (const s of active) styles[s] = true;
    result.push({ type: 'text', text: unescapeHtml(buf), styles });
    buf = '';
  };
  let i = 0;
  while (i < html.length) {
    const ch = html[i];
    if (ch === '<') {
      const end = html.indexOf('>', i);
      if (end < 0) { buf += ch; i++; continue; }
      const raw = html.slice(i + 1, end).trim();
      flush();
      const closing = raw.startsWith('/');
      const name = (closing ? raw.slice(1) : raw).match(/^[a-zA-Z]*/)![0].toLowerCase();
      const style = TAG_TO_STYLE[name];
      if (style) { if (closing) active.delete(style); else active.add(style); }
      i = end + 1;
    } else {
      buf += ch; i++;
    }
  }
  flush();
  return result;
}

// ---------------- 블록 빌더 ----------------
const defaultProps = () => ({ textColor: 'default', backgroundColor: 'default', textAlignment: 'left' });
const textNode = (text: string) => ({ type: 'text', text, styles: {} });
const newId = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `bn-${Math.random().toString(36).slice(2)}`);
const bnBlock = (type: string, content: any[], props: any) =>
  ({ id: newId(), type, props, content, children: [] });

function appendListItem(block: any, items: string[]): void {
  items.push(inlineToHtml(block?.content));
  const children = block?.children;
  if (Array.isArray(children)) {
    for (const c of children) {
      const t = c?.type;
      if (LIST_UNORDERED.has(t) || t === 'numberedListItem') appendListItem(c, items);
      else items.push(inlineToHtml(c?.content));
    }
  }
}

// ---------------- BlockNote → Editor.js (저장) ----------------
export function blockNoteToEditorJs(blocks: unknown): unknown[] {
  if (!Array.isArray(blocks)) return blocks as unknown[];
  try {
    const out: any[] = [];
    let i = 0;
    while (i < blocks.length) {
      const b: any = blocks[i];
      if (b == null) { i++; continue; }
      if (isEditorJsBlock(b)) { out.push(b); i++; continue; }
      const type = b.type;
      if (LIST_UNORDERED.has(type)) {
        const items: string[] = [];
        while (i < blocks.length && LIST_UNORDERED.has((blocks[i] as any)?.type)) {
          appendListItem(blocks[i], items); i++;
        }
        out.push({ type: 'list', data: { style: 'unordered', items } });
      } else if (type === 'numberedListItem') {
        const items: string[] = [];
        while (i < blocks.length && (blocks[i] as any)?.type === 'numberedListItem') {
          appendListItem(blocks[i], items); i++;
        }
        out.push({ type: 'list', data: { style: 'ordered', items } });
      } else if (type === 'heading') {
        out.push({ type: 'header', data: { text: inlineToHtml(b.content), level: b.props?.level ?? 1 } });
        i++;
      } else if (type === 'codeBlock') {
        out.push({ type: 'code', data: { code: inlineToPlain(b.content), language: b.props?.language ?? '' } });
        i++;
      } else if (type === 'table' || type === 'image') {
        out.push(b); i++;
      } else {
        out.push({ type: 'paragraph', data: { text: inlineToHtml(b.content) } });
        i++;
      }
    }
    return out;
  } catch {
    return blocks;
  }
}

// ---------------- Editor.js → BlockNote (조회) ----------------
export function editorJsToBlockNote(blocks: unknown): unknown[] {
  if (!Array.isArray(blocks)) return blocks as unknown[];
  try {
    const out: any[] = [];
    for (const b of blocks as any[]) {
      if (b == null) continue;
      if (isBlockNoteBlock(b)) { out.push(b); continue; }
      const data = b.data || {};
      switch (b.type) {
        case 'header':
          out.push(bnBlock('heading', htmlToInline(String(data.text ?? '')),
            { ...defaultProps(), level: data.level ?? 1 }));
          break;
        case 'paragraph':
          out.push(bnBlock('paragraph', htmlToInline(String(data.text ?? '')), defaultProps()));
          break;
        case 'list': {
          const bnType = data.style === 'ordered' ? 'numberedListItem' : 'bulletListItem';
          const items: any[] = Array.isArray(data.items) ? data.items : [];
          for (const item of items) out.push(bnBlock(bnType, htmlToInline(String(item ?? '')), defaultProps()));
          break;
        }
        case 'code':
          out.push(bnBlock('codeBlock', [textNode(String(data.code ?? ''))],
            { language: String(data.language ?? '') }));
          break;
        case 'table':
        case 'image':
          out.push(b);
          break;
        default:
          out.push(bnBlock('paragraph', htmlToInline(String(data.text ?? '')), defaultProps()));
      }
    }
    return out;
  } catch {
    return blocks;
  }
}
