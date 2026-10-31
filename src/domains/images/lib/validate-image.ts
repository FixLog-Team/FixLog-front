/** 서버가 허용하는 이미지 MIME 타입. 업로드 전 클라이언트에서 1차 검증한다. */
export const IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

/** 서버 업로드 최대 크기(10MB). */
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/**
 * 이미지 업로드 전 클라이언트 검증.
 * 서버 왕복 없이 잘못된 파일을 걸러 사용자에게 즉시 안내한다.
 * 통과하면 null, 문제가 있으면 안내 메시지를 반환한다.
 */
export function validateImageFile(file: File): string | null {
  if (!file || file.size === 0) {
    return '빈 파일은 업로드할 수 없어요.';
  }
  if (!IMAGE_ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_TYPES)[number])) {
    return 'JPG, PNG, GIF, WebP, SVG 이미지만 업로드할 수 있어요.';
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return '이미지는 10MB 이하만 업로드할 수 있어요.';
  }
  return null;
}
