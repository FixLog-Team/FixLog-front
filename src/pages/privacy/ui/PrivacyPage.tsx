import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/logo';
import { ROUTES } from '@/shared/constants/routes';

/**
 * 개인정보처리방침(공개 페이지).
 *
 * Google Play 데이터 보안(Data safety) 양식 및 OAuth 동의 화면에 제출하는 공개 URL.
 * 로그인 없이 접근 가능해야 하므로 router 의 public 라우트로 등록한다(RequireAuth 가드 밖).
 */
export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to={ROUTES.LANDING}>
            <Logo />
          </Link>
          <Link
            to={ROUTES.ACCOUNT_DELETION}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            계정 삭제 안내
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          최종 업데이트: 2026년 10월 4일
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground">
          <section>
            <p className="text-muted-foreground">
              FixLog(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게
              생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본
              방침은 서비스가 어떤 정보를 수집하고 어떻게 이용·보관·보호하는지를
              설명합니다.
            </p>
            <ul className="mt-4 space-y-1 text-muted-foreground">
              <li>
                <span className="text-foreground">서비스명:</span> FixLog
              </li>
              <li>
                <span className="text-foreground">운영자:</span> 장인성
              </li>
              <li>
                <span className="text-foreground">문의:</span>{' '}
                <a
                  href="mailto:fixlog.ssu@gmail.com"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  fixlog.ssu@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. 수집하는 개인정보 항목
            </h2>
            <p className="mt-3 text-muted-foreground">
              서비스는 다음과 같은 정보를 수집합니다.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">계정 정보:</span> Google
                계정으로 로그인 시 이메일 주소, 이름(프로필 정보)
              </li>
              <li>
                <span className="text-foreground">이용자 콘텐츠:</span> 이용자가
                작성·저장한 문서, 노트, 폴더 등 서비스 내 생성 데이터
              </li>
              <li>
                <span className="text-foreground">AI 기능 이용 데이터:</span> AI
                요약·검색 사용 시 입력한 질문 및 대상 문서 내용
              </li>
              <li>
                <span className="text-foreground">인증 정보:</span> 로그인
                유지를 위한 인증 토큰
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. 개인정보의 이용 목적
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>회원 식별 및 로그인 등 계정 관리</li>
              <li>문서 작성·저장·검색·요약 등 서비스 핵심 기능 제공</li>
              <li>서비스 운영·개선 및 오류 대응</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. 개인정보의 제3자 제공 및 처리 위탁
            </h2>
            <p className="mt-3 text-muted-foreground">
              서비스는 이용자의 개인정보를 이용자의 동의 없이 외부에 판매하거나
              제공하지 않습니다. 다만 서비스 제공을 위해 아래와 같이 외부 서비스가
              이용되거나 데이터가 처리될 수 있습니다.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Google 로그인(OAuth):</span>{' '}
                인증 목적의 계정 정보 확인
              </li>
              <li>
                <span className="text-foreground">
                  AI 요약·검색(OpenAI, Google Gemini):
                </span>{' '}
                AI 요약 및 검색 기능 제공을 위해, 이용자가 입력한 질문과 대상
                문서의 내용이 OpenAI 및 Google의 생성형 AI API로 전송되어
                처리됩니다. 해당 데이터는 AI 응답 생성 목적에 한해 처리됩니다.
              </li>
              <li>
                <span className="text-foreground">의미 기반 검색(자체 보관):</span>{' '}
                검색을 위한 문서 임베딩(벡터) 데이터는 서비스 자체 데이터베이스
                (pgvector)에 저장·관리되며 외부로 제공되지 않습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. 개인정보의 보유 및 파기
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                이용자의 개인정보는 회원 탈퇴 또는 삭제 요청 시 지체 없이
                파기합니다.
              </li>
              <li>
                별도로 보관하는 데이터는 없으며, 삭제 요청 시 모든 개인 데이터가
                즉시 파기됩니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. 개인정보의 안전성 확보 조치
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                모든 데이터는 전송 구간에서 HTTPS(TLS)로 암호화되어 전송됩니다.
              </li>
              <li>
                인증 토큰 등 민감 정보는 기기에서 암호화하여 저장합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. 이용자의 권리 및 계정 삭제
            </h2>
            <p className="mt-3 text-muted-foreground">
              이용자는 언제든지 자신의 개인정보 열람·정정·삭제를 요청할 수
              있습니다. 계정 및 관련 데이터의 삭제 절차는 아래 페이지에서
              확인하실 수 있습니다.
            </p>
            <Link
              to={ROUTES.ACCOUNT_DELETION}
              className="mt-4 inline-block rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              계정 및 데이터 삭제 요청 →
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. 방침의 변경
            </h2>
            <p className="mt-3 text-muted-foreground">
              본 개인정보처리방침은 법령 또는 서비스 정책 변경에 따라 수정될 수
              있으며, 변경 시 본 페이지를 통해 공지합니다.
            </p>
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
