import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";

interface AutoLogoutOptions {
  timeout?: number; // общее время до выхода
  warningTime?: number; // за сколько мс показывать предупреждение
  checkInterval?: number; // проверка сна ПК
}

// берем время из .env (в минутах) и конвертируем в мс
const envTimeoutMinutes = Number(import.meta.env.VITE_AUTOLOGOUT_TIMEOUT) || 30;
const envTimeoutMs = envTimeoutMinutes * 60 * 1000;

export function useAutoLogout({
  timeout = envTimeoutMs,
  warningTime = 60 * 1000,  // за 60 секунд до выхода
  checkInterval = 60 * 1000,
}: AutoLogoutOptions = {}) {
  const dispatch = useAppDispatch();

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // состояние для модалки
  const [showModal, setShowModal] = useState(false);
  const [endTime, setEndTime] = useState(Date.now() + timeout);

  const handleLogout = useCallback(() => {
    setShowModal(false);
    dispatch(logout());
  }, [dispatch]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setEndTime(Date.now() + timeout);

    if (timerRef.current) clearTimeout(timerRef.current);
    setShowModal(false);

    const timeUntilWarning = timeout - warningTime;
    timerRef.current = setTimeout(() => {
      setShowModal(true);
    }, timeUntilWarning);
  }, [timeout, warningTime]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    const checkSleep = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeout) {
        handleLogout();
      }
    }, checkInterval);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(checkSleep);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, handleLogout, checkInterval, timeout]);

  return { showModal, endTime, warningTime, handleLogout };
}