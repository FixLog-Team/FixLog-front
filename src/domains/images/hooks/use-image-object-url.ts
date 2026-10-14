import { useEffect, useState } from 'react';
import { imagesApi } from '@/domains/images/api/images.api';

/**
 * 인증이 필요한 이미지를 받아 `<img src>` 에 꽂을 수 있는 object URL 로 바꾼다.
 *
 * imageId 가 없으면 아무것도 받지 않는다. 언마운트·이미지 변경 시 object URL 을 해제해
 * blob 이 메모리에 남지 않게 한다.
 *
 * 실패해도 throw 하지 않고 null 을 유지한다. 썸네일은 부가 정보라서, 못 불러왔다고
 * 근거 표시 자체가 사라지면 안 되기 때문이다.
 */
export function useImageObjectUrl(imageId: string | null | undefined): string | null {
  // Hooks
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let created: string | null = null;

    imagesApi
      .getBlob(imageId)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(null);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
      setObjectUrl(null);
    };
  }, [imageId]);

  // Render
  return objectUrl;
}
