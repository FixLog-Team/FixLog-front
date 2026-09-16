import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils/index';
import { Card } from '@/shared/ui/card';
import { adminPath } from '@/shared/constants/routes';
import { useSession } from '@/domains/auth/hooks/use-session';
import type { Workspace } from '@/domains/workspaces';
import { useAdminUsers } from '@/domains/admin';
import {
  USER_STATUS_LABEL,
  formatDate,
  formatDateTime,
  SectionTitle,
  Notice,
  Table,
  THead,
  Th,
  Td,
  StatusText,
  RoleBadge,
} from '@/pages/fixlog-admin/ui/shared';

/**
 * Users — 구성원 상세 목록(GET /admin/users). 행을 클릭하면 상세 페이지로 이동한다.
 * 역할 변경·구성원 제거는 상세 페이지에서 한다(목록은 읽기 전용).
 */
export function AdminUsersSection({ workspace }: { workspace: Workspace }) {
  // Hooks
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data, isLoading, isError } = useAdminUsers(workspace.workspaceId);

  // Variables
  const users = data ?? [];

  return (
    <div>
      <SectionTitle title="구성원" description="워크스페이스 구성원 상세 목록입니다. 행을 클릭하면 상세 페이지로 이동합니다." />

      <Card className="overflow-hidden">
        {isLoading ? (
          <StatusText>불러오는 중…</StatusText>
        ) : isError ? (
          <StatusText>구성원 목록을 불러올 수 없습니다. (관리자만 조회 가능)</StatusText>
        ) : users.length === 0 ? (
          <StatusText>구성원이 없습니다.</StatusText>
        ) : (
          <Table>
            <THead>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>역할</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th>마지막 로그인</Th>
            </THead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelf = u.userId === session?.userId;
                const goDetail = () => navigate(adminPath('users', u.userId));
                return (
                  <tr
                    key={u.userId}
                    onClick={goDetail}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goDetail();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${u.userName} 상세 보기`}
                    className="cursor-pointer transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none"
                  >
                    <Td>
                      <span className="font-medium text-foreground">{u.userName}</span>
                      {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(나)</span>}
                    </Td>
                    <Td className="text-muted-foreground">{u.email}</Td>
                    <Td>
                      <RoleBadge role={u.role} />
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-medium',
                          u.userStatus === 'ACTIVE'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {USER_STATUS_LABEL[u.userStatus]}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{formatDate(u.joinedAt)}</Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '기록 없음'}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <div className="mt-4">
        <Notice>
          역할 변경과 구성원 제거는 각 구성원의 <b>상세 페이지</b>에서 합니다. 소유자는 워크스페이스 생성자만 가질 수 있어,
          초대된 구성원은 최대 관리자까지만 승격됩니다.
        </Notice>
      </div>
    </div>
  );
}
