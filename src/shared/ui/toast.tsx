import { useEffect, useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';

/**
 * 경량 Toast. 모듈 레벨 스토어 + 루트에 한 번 렌더한 <Toaster/> 로 동작한다.
 * 라우터 밖(App)에서 렌더하므로 페이지 이동 후에도 토스트가 유지된다.
 * 사용: toast.success('...'), toast.error('...'), toast.show('...')
 */
type ToastVariant = 'default' | 'success' | 'error';
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const AUTO_DISMISS_MS = 3500;
let seq = 0;
let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(message: string, variant: ToastVariant) {
  const id = ++seq;
  items = [...items, { id, message, variant }];
  emit();
  setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
}

export const toast = {
  show: (message: string) => push(message, 'default'),
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
};

/** 앱 루트에 한 번 렌더한다(App.tsx). 상단 중앙에 토스트를 쌓아 보여준다. */
export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg',
            t.variant === 'success'
              ? 'border-success/40 bg-card text-foreground'
              : t.variant === 'error'
                ? 'border-destructive/40 bg-card text-foreground'
                : 'border-border bg-card text-foreground'
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.variant === 'success' ? (
              <Check className="size-4 text-success" />
            ) : t.variant === 'error' ? (
              <X className="size-4 text-destructive" />
            ) : (
              <Info className="size-4 text-primary" />
            )}
          </span>
          <span className="min-w-0 flex-1 text-sm leading-relaxed">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="닫기"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
