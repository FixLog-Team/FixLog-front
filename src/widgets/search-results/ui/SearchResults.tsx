import { useNavigate } from 'react-router-dom';
import { FileText, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { documentDetailPath } from '@/shared/constants/routes';
import { useImageObjectUrl } from '@/domains/images';
import type { AskReference } from '@/domains/ai';

interface SearchResultsProps {
  items: AskReference[];
}

/**
 * AI 답변 근거 문서(references) 목록. 카드 클릭 시 실제 문서로 이동.
 *
 * 근거는 문서 본문에서 올 수도, 문서에 첨부된 이미지를 분석한 결과에서 올 수도 있다.
 * 이미지에서 온 발췌는 문서를 열어도 그 문장이 본문에 없으므로 출처를 분명히 표시한다.
 */
export function SearchResults({ items }: SearchResultsProps) {
  // Hooks
  const navigate = useNavigate();

  // Render
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((ref) => {
        const isImage = ref.source === 'image';

        return (
          // 같은 문서가 본문·이미지 근거로 함께 걸릴 수 있어 문서 id 만으로는 키가 겹친다
          <Card key={`${ref.documentId}:${ref.source ?? 'text'}:${ref.imageId ?? ''}`} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {isImage ? (
                    <ImageIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 pt-1.5">
                  <h3 className="min-w-0 truncate font-semibold text-foreground">{ref.title}</h3>
                  {isImage && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      첨부 이미지{ref.imageName ? ` · ${ref.imageName}` : ''}에서 찾음
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="match" className="shrink-0">
                {Math.round(ref.score * 100)}% match
              </Badge>
            </div>

            {isImage && ref.imageId && <EvidenceThumbnail imageId={ref.imageId} alt={ref.imageName} />}

            <p className="mt-3 text-sm leading-relaxed text-foreground">{ref.excerpt}</p>

            <div className="mt-4 flex items-center justify-end border-t border-border pt-3">
              <button
                onClick={() => navigate(documentDetailPath(ref.documentId))}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                문서 열기
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * 근거가 된 이미지 미리보기.
 *
 * 못 불러오면 아무것도 그리지 않는다. 깨진 이미지 자리를 남기느니 비우는 편이 낫고,
 * 출처는 이미 카드 머리말에 글로 적혀 있다.
 */
function EvidenceThumbnail({ imageId, alt }: { imageId: string; alt?: string | null }) {
  // Hooks
  const objectUrl = useImageObjectUrl(imageId);

  // Render
  if (!objectUrl) return null;

  return (
    <img
      src={objectUrl}
      alt={alt ?? '근거 이미지'}
      loading="lazy"
      className="mt-3 max-h-56 w-full rounded-lg border border-border object-contain"
    />
  );
}
