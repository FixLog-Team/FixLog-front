import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/domains/api-keys/api/api-keys.api';
import type { RegisterApiKeyBody } from '@/domains/api-keys/types/api-key';

const KEY = ['api-keys'] as const;

export function useApiKeys() {
  return useQuery({ queryKey: KEY, queryFn: () => apiKeysApi.list() });
}

export function useRegisterApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterApiKeyBody) => apiKeysApi.register(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => apiKeysApi.remove(keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
