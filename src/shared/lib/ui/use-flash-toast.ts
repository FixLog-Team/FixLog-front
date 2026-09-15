import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/shared/ui/toast';

/** 다른 페이지에서 navigate state 로 넘기는 1회성 Toast(초대 수락/거절 결과 등). */
export interface FlashToast {
  variant: 'success' | 'error' | 'default';
  message: string;
}

/**
 * 다른 페이지에서 넘긴 1회성 Toast(location.state.flashToast)를 이 화면에서 띄운다.
 * 소비 후 navigation state 를 비워 새로고침/뒤로가기 시 재발생을 막는다.
 * StrictMode(dev)의 effect 이중 실행에도 같은 state 는 한 번만 소비한다(consumed ref).
 */
export function useFlashToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const consumedRef = useRef<unknown>(null);

  useEffect(() => {
    const state = location.state as { flashToast?: FlashToast } | null;
    const flash = state?.flashToast;
    if (!flash) return;
    // 같은 navigation state 객체는 한 번만 소비(이중 실행 방지).
    if (consumedRef.current === state) return;
    consumedRef.current = state;

    if (flash.variant === 'success') toast.success(flash.message);
    else if (flash.variant === 'error') toast.error(flash.message);
    else toast.show(flash.message);

    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);
}
