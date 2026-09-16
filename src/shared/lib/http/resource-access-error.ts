import axios from 'axios';

/** 리소스가 없거나 현재 사용자가 접근할 수 없을 때 사용하는 공통 오류. */
export class ResourceAccessDeniedError extends Error {
  constructor() {
    super('리소스에 접근할 수 없습니다.');
    this.name = 'ResourceAccessDeniedError';
  }
}

/** 서버 정책상 403/404 모두 접근 불가로 동일하게 취급해 존재 여부를 노출하지 않는다. */
export function normalizeResourceAccessError(error: unknown): never {
  if (
    axios.isAxiosError(error) &&
    (error.response?.status === 403 || error.response?.status === 404)
  ) {
    throw new ResourceAccessDeniedError();
  }

  throw error;
}

export function isResourceAccessDeniedError(
  error: unknown,
): error is ResourceAccessDeniedError {
  return error instanceof ResourceAccessDeniedError;
}
