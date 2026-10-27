import { useNavigate } from 'react-router-dom';
import { FileText, ArrowUpRight } from 'lucide-react';
import { documentDetailPath } from '@/shared/constants/routes';
import { useRelatedDocuments } from '@/domains/documents';

interface RelatedDocumentsProps {
  documentId: string;
}

/**
 * 문서 본문 아래 "연관 문서" 목록.
 *
 * 서버가 이 문서의 임베딩으로 이웃을 찾아 돌려준다. 유사도가 낮은 문서는 서버에서 이미
 * 걸러지므로, 비어 있으면 아무것도 그리지 않는다 — 억지로 채운 목록을 보여주느니
 * 섹션 자체를 숨기는 편이 낫다.
 *
 * 불러오기에 실패해도 조용히 숨긴다. 본문을 읽는 데 지장이 없는 부가 정보라
 * 오류 문구로 화면을 어지럽힐 이유가 없다.
 */
export function RelatedDocuments({ documentId }: RelatedDocumentsProps) {
  // Hooks
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRelatedDocuments(documentId);

  // Render
  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-4xl px-24 pb-16">
        <Heading />
        <p className="mt-3 text-sm text-muted-foreground">연관 문서를 찾는 중…</p>
      </section>
    );
  }

  if (isError || !data || data.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-24 pb-16">
      <Heading />
      <ul className="mt-3 space-y-2">
        {data.map((doc) => (
          <li key={doc.documentId}>
            <button
              type="button"
              onClick={() => navigate(documentDetailPath(doc.documentId))}
              className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileText className="size-3.5 text-muted-foreground" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <span className="min-w-0 truncate">{doc.title}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                {/* 발췌는 연관도가 가장 높았던 대목이라, 왜 이 문서가 걸렸는지 짐작하게 해준다 */}
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                  {doc.excerpt}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Heading() {
  return (
    <h2 className="border-t border-border pt-6 text-sm font-semibold text-muted-foreground">
      연관 문서
    </h2>
  );
}
