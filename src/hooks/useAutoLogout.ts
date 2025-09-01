import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, selectIsAuthenticated } from "../features/auth/authSlice";

export const IDLE_TIMEOUT = 30 * 60 * 1000; 
export const WARNING_TIME = 1 * 60 * 1000; // предупреждение за минуту

let globalResetTimer: (() => void) | null = null;
let globalClearTimers: (() => void) | null = null;

export function useAutoLogout() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const endTimeRef = useRef<number>(Date.now() + IDLE_TIMEOUT);

  const [showWarning, setShowWarning] = useState(false);
  const [endTime, setEndTime] = useState<number>(endTimeRef.current);

  const clearTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }, []);

  //обновляет время до логаута, очищает таймеры.
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    clearTimers();

    const now = Date.now();
    const newEnd = now + IDLE_TIMEOUT;

    endTimeRef.current = newEnd;
    setEndTime(newEnd);
    setShowWarning(false);

    // показать модалку за WARNING_TIME до конца
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_TIMEOUT - WARNING_TIME);

    // авто-логаут
    logoutTimeoutRef.current = setTimeout(() => {
      dispatch(logout());
      window.location.href = "/login";
    }, IDLE_TIMEOUT);
  }, [dispatch, isAuthenticated, clearTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      setEndTime(0);
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    const handleActivity = () => {
       resetTimer();
       setShowWarning(false);  // при активности сразу убираем модалку
    };

    activityEvents.forEach((e) => window.addEventListener(e, handleActivity));
    resetTimer();

    // пробрасываем наружу ссылки
    globalResetTimer = resetTimer;
    globalClearTimers = clearTimers;

    return () => {
      clearTimers();
      activityEvents.forEach((e) => window.removeEventListener(e, handleActivity));
      globalResetTimer = null;
      globalClearTimers = null;
    };
  }, [resetTimer, clearTimers, isAuthenticated]);

  return {
    showWarning,
    endTime,
    warningTime: WARNING_TIME,
  };
}

// для apiFetch
export function resetAutoLogoutTimer() {
  if (globalResetTimer) globalResetTimer();
}

// для кнопки "Выйти"
export function clearAutoLogoutTimers() {
  if (globalClearTimers) globalClearTimers();
}