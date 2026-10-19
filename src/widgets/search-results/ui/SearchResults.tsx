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
 * 같은 문서에서 본문+이미지가 함께 검색되면 하나의 카드로 합쳐져 내려온다(source: 'mixed').
 */
export function SearchResults({ items }: SearchResultsProps) {
  // Hooks
  const navigate = useNavigate();

  // Render
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((ref) => {
        const hasImage = ref.source === 'image' || ref.source === 'mixed';
        const isImageOnly = ref.source === 'image';
        // images 배열이 있으면 그것을 쓰고, 없으면 단일 imageId 로 폴백
        const imageList = ref.images?.length
          ? ref.images
          : ref.imageId
            ? [{ imageId: ref.imageId, imageName: ref.imageName }]
            : [];

        return (
          <Card key={ref.documentId} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {isImageOnly ? (
                    <ImageIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 pt-1.5">
                  <h3 className="min-w-0 truncate font-semibold text-foreground">{ref.title}</h3>
                  {hasImage && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      첨부 이미지 포함
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="match" className="shrink-0">
                {Math.round(ref.score * 100)}% match
              </Badge>
            </div>

            {imageList.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {imageList.map((img) => (
                  <EvidenceThumbnail key={img.imageId} imageId={img.imageId} alt={img.imageName} />
                ))}
              </div>
            )}

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
