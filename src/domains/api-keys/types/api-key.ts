/**
 * 사용자 AI API Key 타입. 서버 UserApiKeyDto / ApiKeyRequest 대응 (FRONTEND_API_GUIDE 13장).
 * 원문 키는 절대 내려오지 않고 마지막 4자리(maskedKey)만 표시된다.
 */
export interface ApiKey {
  keyId: string;
  provider: string;
  /** 예: "****1234" */
  maskedKey: string;
  createAt: string | null;
  updateAt: string | null;
}

/** 같은 provider 로 다시 등록하면 서버가 교체한다. */
export interface RegisterApiKeyBody {
  provider: string;
  apiKey: string;
}
