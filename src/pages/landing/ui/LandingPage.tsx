import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Search,
  FileText,
  History,
  Lock,
} from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/constants/routes";

const NAV_LINKS = ["제품", "작동 방식", "보안"];

const FEATURES = [
  {
    icon: Search,
    title: "의미 기반 검색",
    description:
      "정확한 키워드가 아니라 의미로 문서를 찾습니다. 자연어로 물어보면 알맞은 답을 드려요.",
  },
  {
    icon: FileText,
    title: "AI 요약",
    description:
      "긴 문서를 한 번의 클릭으로 명확한 요약·핵심 결정·할 일로 정리합니다.",
  },
  {
    icon: History,
    title: "버전 기록",
    description:
      "모든 편집이 저장됩니다. 지난 버전을 확인하고 원하는 시점으로 복원할 수 있어요.",
  },
  {
    icon: Lock,
    title: "온프레미스",
    description:
      "전용 환경에서 구동됩니다. 데이터는 전용 환경 안에 그대로 머뭅니다.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors hover:text-foreground"
              >
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.LOGIN}>로그인</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to={ROUTES.WORKSPACE}>FixLog 시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          온프레미스 AI 문서 플랫폼
        </span>
        <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-6xl">
          회사 문서를 더 빠르게 찾고 이해하세요.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          FixLog는 팀이 내부 지식을 작성·정리·검색·요약하도록 돕는 온프레미스 AI 문서 플랫폼입니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to={ROUTES.WORKSPACE}>
              FixLog 시작하기
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="rounded-full"
          >
            <Link to={ROUTES.DOCUMENTS}>데모 보기</Link>
          </Button>
        </div>

        {/* Product preview */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="ml-3 text-xs text-muted-foreground">
              acme.fixlog.internal
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted px-4 py-3">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                결제 오류 처리 관련 문서 찾기
              </span>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              FixLog가 관련성 높은 문서 2건을 찾았습니다
            </p>
            <div className="mt-3 space-y-2">
              {[
                "결제 오류 처리 가이드",
                "운영 장애 회고",
              ].map((title) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          당신의 지식을 이해하기 시작하세요.
        </h2>
        <div className="mt-6">
          <Button asChild size="lg" className="rounded-full">
            <Link to={ROUTES.WORKSPACE}>
              FixLog 시작하기
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <Logo />
          <span>© 2026 FixLog</span>
        </div>
      </footer>
    </div>
  );
}
