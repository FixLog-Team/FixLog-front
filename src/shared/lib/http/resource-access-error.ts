import axios from 'axios';

/**
 * 리소스를 쓸 수 없을 때의 공통 상위 오류.
 * "없음(404)"과 "권한 없음(403)"을 구분하되, 재시도 차단처럼 둘을 함께 다뤄야 하는
 * 곳에서는 이 타입 하나로 판정한다.
 */
export class ResourceUnavailableError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

/** 현재 사용자가 접근할 수 없는 리소스(403, 또는 유효 권한 access=false). */
export class ResourceAccessDeniedError extends ResourceUnavailableError {
  constructor() {
    super('리소스에 접근할 수 없습니다.', 'ResourceAccessDeniedError');
  }
}

/** 존재하지 않거나 삭제된 리소스(404). */
export class ResourceNotFoundError extends ResourceUnavailableError {
  constructor() {
    super('리소스를 찾을 수 없습니다.', 'ResourceNotFoundError');
  }
}

/**
 * 403/404 를 각각의 오류로 바꾼다.
 * 404 는 삭제·부재를 뜻하므로 "접근 권한 없음"과 구분해 안내할 수 있게 분리한다.
 */
export function normalizeResourceAccessError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) throw new ResourceNotFoundError();
    if (status === 403) throw new ResourceAccessDeniedError();
  }

  throw error;
}

/** 접근 권한이 없어 막힌 경우(403 / access=false). */
export function isResourceAccessDeniedError(
  error: unknown,
): error is ResourceAccessDeniedError {
  return error instanceof ResourceAccessDeniedError;
}

/** 없거나 삭제된 리소스(404). */
export function isResourceNotFoundError(
  error: unknown,
): error is ResourceNotFoundError {
  return error instanceof ResourceNotFoundError;
}

/** 없음·권한없음 어느 쪽이든 리소스를 쓸 수 없는 경우(재시도해도 소용없는 상태). */
export function isResourceUnavailableError(
  error: unknown,
): error is ResourceUnavailableError {
  return error instanceof ResourceUnavailableError;
}
