/**
 * ⚠️ 임시(테스트 전용): 권한별 계정 전환용 로컬 계정 목록.
 * 각 token 은 로컬 서버 JWT_SECRET 으로 서명된 로컬 전용 토큰(30일)이며, 절대 배포/원격에 쓰지 않는다.
 * 만료되면 scratchpad 의 mint-accounts.mjs 로 재발급해 갱신한다.
 */
export interface DevAccount {
  key: string;
  name: string;
  email: string;
  /** 표시용 역할 설명. */
  role: string;
  token: string;
}

export const DEV_ACCOUNTS: DevAccount[] = [
  {
    key: 'hong',
    name: '홍길동',
    email: 'hong@fixlog.dev',
    role: '관리자 (데모 팀)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJpYXQiOjE3ODc1NzMxNTIsImV4cCI6MTc5MDE2NTE1Mn0.RLR-DgVyiIpTwndH5LkWu69S0swFrguMwGKOkgeEkiI',
  },
  {
    key: 'jang',
    name: '장인성',
    email: 'jdits1019@gmail.com',
    role: '구성원 (데모 팀)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZjJjMGYwMC03MDAzLTQ3OWItOWM2MC0wODAwYzU4MDQ3OWYiLCJpYXQiOjE3ODc1NzMxNTIsImV4cCI6MTc5MDE2NTE1Mn0.B2wgUZGMAxgiWHYvyP7rNc2BNrr3_tc-CiKPLXkzCIg',
  },
];
