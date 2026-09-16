import { useMemo } from 'react';
import { useWorkspaceMembers } from '@/domains/workspaces/hooks/use-workspace-members';
import { useSession } from '@/domains/auth';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';

/**
 * 리소스 소유자(userId)를 표시용 이름으로 변환하는 리졸버를 반환한다.
 * 문서/폴더의 createUser 는 userId(UUID)이므로, 현재 워크스페이스 구성원 목록으로 이름을 찾는다.
 * (GET /workspaces/{id}/members 는 구성원이면 조회 가능)
 * 개인 워크스페이스 등 구성원 목록이 없을 때도 본인 리소스는 세션 정보로 표시된다.
 */
export function useOwnerName() {
  const workspaceId = workspaceStorage.get();
  const { data: session } = useSession();
  const { data: members } = useWorkspaceMembers(workspaceId ?? '', !!workspaceId);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members ?? []) {
      map.set(m.userId, m.userName || m.email);
    }
    // 구성원 목록이 없어도(개인 워크스페이스 등) 본인 리소스는 표시되도록 세션 사용자 보강.
    if (session?.userId) {
      map.set(session.userId, session.userName || session.email || '나');
    }
    return map;
  }, [members, session?.userId, session?.userName, session?.email]);

  /** 소유자 userId → 표시 이름. 알 수 없으면 '—'. */
  return (ownerId: string | null | undefined): string => {
    if (!ownerId) return '—';
    return nameById.get(ownerId) ?? '—';
  };
}
