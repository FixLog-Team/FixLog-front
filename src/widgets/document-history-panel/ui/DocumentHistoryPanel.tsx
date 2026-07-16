import { RotateCcw, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';

export interface DocumentVersion {
  id: string;
  timestampLabel: string;
  author: string;
  summary: string;
  isCurrent?: boolean;
}

interface DocumentHistoryPanelProps {
  versions: DocumentVersion[];
  onRestore?: (versionId: string) => void;
}

export function DocumentHistoryPanel({
  versions,
  onRestore,
}: DocumentHistoryPanelProps) {
  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <Card
          key={version.id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-4 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {version.timestampLabel}
                </span>
                {version.isCurrent && (
                  <Badge variant="published">Current</Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {version.summary}
              </p>
              <span className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
                <Avatar name={version.author} size="sm" />
                {version.author}
              </span>
            </div>
          </div>

          {!version.isCurrent && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRestore?.(version.id)}
            >
              <RotateCcw />
              Restore
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
