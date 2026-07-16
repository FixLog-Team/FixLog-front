import { useNavigate } from 'react-router-dom';
import { FileText, ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { documentDetailPath } from '@/shared/constants/routes';
import type { AskReference } from '@/domains/ai';

interface SearchResultsProps {
  items: AskReference[];
}

/** AI 답변 근거 문서(references) 목록. 카드 클릭 시 실제 문서로 이동. */
export function SearchResults({ items }: SearchResultsProps) {
  // Hooks
  const navigate = useNavigate();

  // Render
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((ref) => (
        <Card key={ref.documentId} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="size-4 text-muted-foreground" />
              </span>
              <h3 className="min-w-0 truncate pt-1.5 font-semibold text-foreground">
                {ref.title}
              </h3>
            </div>
            <Badge variant="match" className="shrink-0">
              {Math.round(ref.score * 100)}% match
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {ref.excerpt}
          </p>

          <div className="mt-4 flex items-center justify-end border-t border-border pt-3">
            <button
              onClick={() => navigate(documentDetailPath(ref.documentId))}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Open document
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
