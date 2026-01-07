import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";

interface AutoLogoutOptions {
  timeout?: number; // общее время до выхода
  warningTime?: number; // за сколько мс показывать предупреждение
  checkInterval?: number; // проверка сна ПК
}

// берем время из .env (в минутах) и конвертируем в мс
const envTimeoutMinutes = Number(import.meta.env.VITE_AUTOLOGOUT_TIMEOUT);

const isAutoLogoutEnabled = envTimeoutMinutes > 0;
const envTimeoutMs = isAutoLogoutEnabled
  ? envTimeoutMinutes * 60 * 1000
  : Infinity;


export function useAutoLogout({
  timeout = envTimeoutMs,
  warningTime = 60 * 1000,  // за 60 секунд до выхода
  checkInterval = 60 * 1000,
}: AutoLogoutOptions = {}) {
  if (!isAutoLogoutEnabled) {
  return {
    showModal: false,
    endTime: Infinity,
    warningTime: 0,
    handleLogout: () => {},
  };
}

  const dispatch = useAppDispatch();

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // состояние для модалки
  const [showModal, setShowModal] = useState(false);
  const [endTime, setEndTime] = useState(Date.now() + timeout);

  // ====== Логаут ======
  const handleLogout = useCallback(() => {
    setShowModal(false);
    localStorage.setItem("forceLogout", String(Date.now())); // синхронизируем вкладки
    dispatch(logout());
  }, [dispatch]);

  // ====== Сброс таймера ======
  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setEndTime(now + timeout);

    localStorage.setItem("lastActivity", String(now));

    if (timerRef.current) clearTimeout(timerRef.current);
    setShowModal(false);

    const timeUntilWarning = timeout - warningTime;
    timerRef.current = setTimeout(() => {
      setShowModal(true);
    }, timeUntilWarning);
  }, [timeout, warningTime]);

  // ====== Эффекты ======
  useEffect(() => {
    // события активности
    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // проверка сна
    const checkSleep = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeout) {
        handleLogout();
      }
    }, checkInterval);

    // вкладка ушла в background / проснулась
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const last = Number(localStorage.getItem("lastActivity")) || 0;
        if (Date.now() - last > timeout) {
          handleLogout();
        } else {
          resetTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    

    // синхронизация между вкладками
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "forceLogout") {
        handleLogout();
      }
    };
    window.addEventListener("storage", handleStorage);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(checkSleep);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
    };
  }, [resetTimer, handleLogout, timeout, checkInterval]);

  return { showModal, endTime, warningTime, handleLogout };
}