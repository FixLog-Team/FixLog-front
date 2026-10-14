import { imagesApi } from '@/domains/images/api/images.api';

/**
 * 문서에 저장되는 이미지 주소에서 imageId 를 뽑는다.
 *
 * 서버가 만들어 주는 주소는 절대 경로(`https://.../fixlog/api/images/{uuid}`)지만,
 * 저장된 문서에는 상대 경로가 들어있을 수도 있어 둘 다 받는다.
 * (서버 DocumentImageReferenceExtractor 와 같은 형태를 본다)
 */
const IMAGE_URL = /\/api\/images\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

export function extractImageId(url: string): string | null {
  return IMAGE_URL.exec(url)?.[1] ?? null;
}

/**
 * 인증이 필요한 이미지 주소를 화면에 그릴 수 있는 object URL 로 바꿔주는 리졸버.
 *
 * 에디터는 이미지를 그릴 때마다 이 함수를 부르므로 같은 주소는 한 번만 받아 캐시한다.
 * 캐시하지 않으면 렌더마다 네트워크 요청과 object URL 이 쌓여 메모리가 샌다.
 *
 * 에디터를 떠날 때 {@link dispose} 로 만들어 둔 object URL 을 모두 해제해야 한다.
 */
export function createAuthedImageResolver() {
  // 같은 주소에 요청이 겹쳐도 한 번만 받도록 Promise 자체를 캐시한다
  const inflight = new Map<string, Promise<string>>();
  const createdUrls: string[] = [];

  async function load(url: string, imageId: string): Promise<string> {
    try {
      const blob = await imagesApi.getBlob(imageId);
      const objectUrl = URL.createObjectURL(blob);
      createdUrls.push(objectUrl);
      return objectUrl;
    } catch {
      // 원래 주소를 그대로 돌려준다. 이미지는 안 보여도 문서에 저장된 값은 건드리지 않는다.
      inflight.delete(url);
      return url;
    }
  }

  return {
    resolve(url: string): Promise<string> {
      const imageId = extractImageId(url);
      // 외부 URL 이미지는 인증이 필요 없으므로 그대로 둔다
      if (!imageId) return Promise.resolve(url);

      const cached = inflight.get(url);
      if (cached) return cached;

      const pending = load(url, imageId);
      inflight.set(url, pending);
      return pending;
    },

    dispose() {
      createdUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      createdUrls.length = 0;
      inflight.clear();
    },
  };
}
