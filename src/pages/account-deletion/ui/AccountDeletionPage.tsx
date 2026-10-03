import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/logo';
import { ROUTES } from '@/shared/constants/routes';

/**
 * 계정 및 데이터 삭제 안내(공개 페이지).
 *
 * Google Play 데이터 보안 양식의 "계정 삭제 URL" 요건 충족용. 다음을 반드시 포함해야 한다.
 *  1) 스토어 등록정보에 표시되는 앱/개발자 이름
 *  2) 삭제를 요청하기 위한 눈에 띄는 단계 안내
 *  3) 삭제/보관되는 데이터 유형 및 보관 기간
 *
 * 로그인 없이 접근 가능해야 하므로 router 의 public 라우트로 등록한다(RequireAuth 가드 밖).
 */
const SUPPORT_EMAIL = 'fixlog.ssu@gmail.com';

export function AccountDeletionPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to={ROUTES.LANDING}>
            <Logo />
          </Link>
          <Link
            to={ROUTES.PRIVACY}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            개인정보처리방침
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          계정 및 데이터 삭제 요청
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          최종 업데이트: 2026년 10월 4일
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">앱 이름:</span> FixLog
          </p>
          <p className="mt-1">
            <span className="text-foreground">개발자:</span> 장인성
          </p>
        </div>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              삭제 요청 방법
            </h2>
            <p className="mt-3 text-muted-foreground">
              FixLog 계정과 관련 데이터의 삭제를 원하시는 경우, 아래 절차에 따라
              요청해 주세요.
            </p>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted-foreground">
              <li>
                아래 이메일 주소로 삭제 요청 메일을 보냅니다.
                <div className="mt-2">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=%5BFixLog%20%EA%B3%84%EC%A0%95%20%EC%82%AD%EC%A0%9C%20%EC%9A%94%EC%B2%AD%5D`}
                    className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {SUPPORT_EMAIL} 로 삭제 요청하기
                  </a>
                </div>
              </li>
              <li>
                메일 제목: <span className="text-foreground">[FixLog 계정 삭제 요청]</span>
              </li>
              <li>
                메일 본문에{' '}
                <span className="text-foreground">
                  가입하신 Google 계정 이메일 주소
                </span>
                를 기재해 주세요. (본인 확인 목적)
              </li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              요청 접수 후 영업일 기준 14일 이내에 처리되며, 완료 시 등록된
              이메일로 안내해 드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              삭제되는 데이터
            </h2>
            <p className="mt-3 text-muted-foreground">
              계정 삭제 요청 시 다음 데이터가 영구적으로 삭제됩니다.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>계정 정보(이메일, 이름 등 프로필 정보)</li>
              <li>이용자가 작성한 문서·노트 및 폴더</li>
              <li>AI 요약·검색 관련 이용 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              보관되는 데이터 및 보관 기간
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                삭제 요청 후 별도로 보관되는 데이터는 없습니다. 모든 개인 데이터는
                삭제 요청 처리 시 지체 없이 파기됩니다.
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <Logo />
          <span>© 2026 FixLog</span>
        </div>
      </footer>
    </div>
  );
}
