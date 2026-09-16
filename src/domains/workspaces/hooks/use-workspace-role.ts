import { useWorkspaces } from '@/domains/workspaces/hooks/use-workspaces';
import { workspaceStorage } from '@/shared/lib/workspace/workspace-storage';

/**
 * 현재 선택된 워크스페이스에서의 내 역할(ADMIN/MEMBER)과 파생 플래그.
 * 역할 기반 UI 게이팅(관리 버튼, 소유자 전용 액션 노출 등)에 사용한다.
 * NOTE: 서버 역할은 ADMIN/MEMBER 뿐이다(문서의 Owner 는 백엔드 미지원).
 */
export function useWorkspaceRole() {
  const { data: workspaces } = useWorkspaces();
  const currentId = workspaceStorage.get();
  const workspace =
    workspaces?.find((w) => w.workspaceId === currentId) ??
    workspaces?.find((w) => w.personal) ??
    workspaces?.[0];

  const role = workspace?.role;
  return {
    workspace,
    role,
    // OWNER 는 ADMIN 권한을 포함하므로 관리자 판정에 함께 통과시킨다.
    isAdmin: role === 'ADMIN' || role === 'OWNER',
    isOwner: role === 'OWNER',
    isPersonal: workspace?.personal ?? false,
  };
}
