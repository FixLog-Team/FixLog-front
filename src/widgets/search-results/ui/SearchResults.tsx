import { useNavigate } from 'react-router-dom';
import { FileText, ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { documentDetailPath } from '@/shared/constants/routes';
import type { DemoDocument } from '@/domains/documents/lib/mock-data/demo-documents';

export interface SearchResultItem {
  doc: DemoDocument;
  match: number;
}

interface SearchResultsProps {
  items: SearchResultItem[];
}

export function SearchResults({ items }: SearchResultsProps) {
  // Hooks
  const navigate = useNavigate();

  // Render
  if (items.length === 0) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="text-sm font-medium text-foreground">No results found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different term, or ask FixLog in AI Search.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(({ doc, match }) => (
        <Card key={doc.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">
                  {doc.title}
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  {doc.folderPath}
                </p>
              </div>
            </div>
            <Badge variant="match" className="shrink-0">
              {match}% match
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {doc.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1">
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Avatar name={doc.owner} size="sm" />
              <span>
                {doc.owner} · Updated {doc.updatedLabel}
              </span>
            </span>
            <button
              onClick={() => navigate(documentDetailPath(doc.id))}
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
