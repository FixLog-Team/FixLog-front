import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  FileText,
  History,
  Lock,
} from 'lucide-react';
import { Logo } from '@/shared/ui/logo';
import { Button } from '@/shared/ui/button';
import { ROUTES } from '@/shared/constants/routes';

const NAV_LINKS = ['Product', 'How it works', 'Security'];

const FEATURES = [
  {
    icon: Search,
    title: 'Semantic search',
    description:
      'Find documents by meaning, not exact keywords. Ask in plain language and get the right answer.',
  },
  {
    icon: FileText,
    title: 'AI summaries',
    description:
      'Turn long documents into clear summaries, key decisions, and action items in one click.',
  },
  {
    icon: History,
    title: 'Version history',
    description:
      'Every edit is saved. Review past versions and restore any point in a document’s history.',
  },
  {
    icon: Lock,
    title: 'On-premise & private',
    description:
      'Runs in your own dedicated environment. Your knowledge never leaves your infrastructure.',
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
              <a key={link} href="#" className="transition-colors hover:text-foreground">
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.LOGIN}>Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to={ROUTES.WORKSPACE}>Try FixLog</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          On-premise AI document workspace
        </span>
        <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-6xl">
          Find and understand your company documents faster.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          FixLog is an on-premise AI document workspace that helps teams write,
          organize, search, and summarize internal knowledge.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to={ROUTES.WORKSPACE}>
              Try FixLog
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="rounded-full">
            <Link to={ROUTES.DOCUMENTS}>View Demo</Link>
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
                Find documents related to payment error handling
              </span>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              FixLog found 2 highly relevant documents
            </p>
            <div className="mt-3 space-y-2">
              {['Payment Error Handling Guide', 'Production Incident Retrospective'].map(
                (title) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {title}
                    </span>
                  </div>
                )
              )}
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
          Start understanding your knowledge.
        </h2>
        <div className="mt-6">
          <Button asChild size="lg" className="rounded-full">
            <Link to={ROUTES.WORKSPACE}>
              Try FixLog
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
