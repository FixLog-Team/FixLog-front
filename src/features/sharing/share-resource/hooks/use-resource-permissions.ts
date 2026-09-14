import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/domains/permissions';
import type { ResourceKind, ShareBody } from '@/domains/permissions';

const permissionsKey = (kind: ResourceKind, id: string) =>
  ['permissions', kind, id] as const;

/**
 * 리소스(문서/폴더)의 공유 권한 목록 조회. 공유 설정 권한이 없으면 서버가 403 을 주므로
 * retry 하지 않고 에러를 그대로 노출한다(다이얼로그에서 안내 문구로 처리).
 */
export function useResourcePermissions(
  kind: ResourceKind,
  id: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: permissionsKey(kind, id),
    queryFn: () => permissionsApi.list(kind, id),
    enabled: enabled && !!id,
    retry: false,
  });
}

/** 공유(권한 부여). 성공 시 권한 목록을 갱신한다. */
export function useShareResource(kind: ResourceKind, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ShareBody) => permissionsApi.share(kind, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKey(kind, id) });
    },
  });
}

/**
 * 내가 이 리소스에 대해 갖는 유효 권한(출처 포함). 다운로드/편집 버튼 노출 판단용.
 * 접근 불가여도 서버가 access=false 로 내려주므로 retry 하지 않는다.
 */
export function useMyPermission(kind: ResourceKind, id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['my-permission', kind, id] as const,
    queryFn: () => permissionsApi.myPermission(kind, id),
    enabled: enabled && !!id,
    retry: false,
  });
}

/** 공유 회수. 성공 시 권한 목록을 갱신한다. */
export function useRevokeShare(kind: ResourceKind, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) =>
      permissionsApi.revoke(kind, id, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionsKey(kind, id) });
    },
  });
}
