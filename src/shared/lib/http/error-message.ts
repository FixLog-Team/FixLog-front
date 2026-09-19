import axios from 'axios';

/**
 * API 실패에서 사용자에게 보여줄 메시지를 뽑는다.
 * 서버 BusinessException 은 { code, message } 로 오므로 그 message 를 우선 쓰고,
 * 서버 내부 오류(UNKNOWN)·네트워크 오류처럼 안내가 되지 않는 경우는 fallback 을 쓴다.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    if (data?.message && data.code && data.code !== 'UNKNOWN') return data.message;
  }
  return fallback;
}

/**
 * 권한 부족(403 FORBIDDEN) 응답인지 판별한다.
 * 세션 중 권한이 회수돼 저장·다운로드 등이 거부되는 경우를 구분해 명확히 안내하는 데 쓴다.
 */
export function isForbiddenError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as { code?: string } | undefined;
  return error.response?.status === 403 || data?.code === 'FORBIDDEN';
}
