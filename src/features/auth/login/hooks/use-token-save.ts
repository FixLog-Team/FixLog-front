import { STORAGE_KEYS } from '@/shared/constants/storage-keys';

export function useSaveTokens() {
  return (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  };
}
