import { useCallback, useEffect, useRef, useState } from "react";

import { useAppDispatch } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";

interface AutoLogoutOptions {
  timeout: number;
  warningTime?: number;
  checkInterval?: number;
}

const LAST_ACTIVITY_KEY = "lastActivity";

export function useAutoLogout({
  timeout,
  warningTime = Math.min(60 * 1000, timeout * 0.2),
  checkInterval = 10 * 1000,
}: AutoLogoutOptions) {
  const dispatch = useAppDispatch();

  const lastActivityRef = useRef(Date.now());
  const lastMouseMoveRef = useRef(0);
  const logoutStartedRef = useRef(false);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [endTime, setEndTime] = useState(Date.now() + timeout);

  // ---------------------------------------------
  // Очистка таймеров
  // ---------------------------------------------

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current !== null) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (logoutTimerRef.current !== null) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // ---------------------------------------------
  // Logout
  // ---------------------------------------------

  const performLogout = useCallback(() => {
    if (logoutStartedRef.current) {
      return;
    }

    logoutStartedRef.current = true;

    clearTimers();
    setShowModal(false);

    // Единый logout для Exit и автоматического выхода
    void dispatch(logout());
  }, [dispatch, clearTimers]);

  const handleLogout = performLogout;

  // ---------------------------------------------
  // Планирование предупреждения и logout
  // ---------------------------------------------

  const scheduleTimers = useCallback(
    (lastActivity: number) => {
      clearTimers();

      const now = Date.now();
      const deadline = lastActivity + timeout;

      lastActivityRef.current = lastActivity;
      setEndTime(deadline);

      const remaining = deadline - now;

      if (remaining <= 0) {
        performLogout();
        return;
      }

      const effectiveWarningTime = Math.min(warningTime, timeout * 0.2);
      const warningDelay = Math.max(0, remaining - effectiveWarningTime);

      setShowModal(remaining <= effectiveWarningTime);

      if (remaining > effectiveWarningTime) {
        warningTimerRef.current = setTimeout(() => {
          setShowModal(true);
        }, warningDelay);
      }

      logoutTimerRef.current = setTimeout(() => {
        performLogout();
      }, remaining);
    },
    [timeout, warningTime, clearTimers, performLogout],
  );

  // ---------------------------------------------
  // Активность пользователя
  // ---------------------------------------------

  const resetTimer = useCallback(() => {
    if (logoutStartedRef.current) {
      return;
    }

    const now = Date.now();

    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

    scheduleTimers(now);
  }, [scheduleTimers]);

  // ---------------------------------------------
  // Effects
  // ---------------------------------------------

  useEffect(() => {
    logoutStartedRef.current = false;

    // При первом запуске учитываем сохранённую
    // активность из других вкладок.
    const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

    const now = Date.now();

    const initialActivity =
      Number.isFinite(storedActivity) &&
      storedActivity > 0 &&
      storedActivity <= now
        ? storedActivity
        : now;

    scheduleTimers(initialActivity);

    // -------------------------------------------
    // События активности
    // -------------------------------------------

    const handleActivity = () => {
      resetTimer();
    };

    const handleMouseMove = () => {
      const now = Date.now();

      if (now - lastMouseMoveRef.current < 1000) {
        return;
      }

      lastMouseMoveRef.current = now;
      resetTimer();
    };

    const events = ["keydown", "mousedown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    window.addEventListener("mousemove", handleMouseMove);

    // -------------------------------------------
    // Проверка после сна компьютера
    // -------------------------------------------

    const checkSleep = setInterval(() => {
      if (logoutStartedRef.current) {
        return;
      }

      const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      const latestActivity = Math.max(
        lastActivityRef.current,
        Number.isFinite(storedActivity) ? storedActivity : 0,
      );

      if (Date.now() - latestActivity >= timeout) {
        performLogout();
      } else if (latestActivity > lastActivityRef.current) {
        scheduleTimers(latestActivity);
      }
    }, checkInterval);

    // -------------------------------------------
    // Возвращение на вкладку
    // -------------------------------------------

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      const latestActivity = Math.max(
        lastActivityRef.current,
        Number.isFinite(storedActivity) ? storedActivity : 0,
      );

      if (Date.now() - latestActivity >= timeout) {
        performLogout();
      } else {
        scheduleTimers(latestActivity);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // -------------------------------------------
    // Синхронизация вкладок
    // -------------------------------------------

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        const activity = Number(event.newValue);

        if (Number.isFinite(activity) && activity > lastActivityRef.current) {
          scheduleTimers(activity);
        }
      }
    };

    // -------------------------------------------
    // Cleanup
    // -------------------------------------------

    return () => {
      clearTimers();
      clearInterval(checkSleep);

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      window.removeEventListener("mousemove", handleMouseMove);

      document.removeEventListener("visibilitychange", handleVisibility);

      window.removeEventListener("storage", handleStorage);
    };
  }, [
    timeout,
    checkInterval,
    resetTimer,
    scheduleTimers,
    performLogout,
    clearTimers,
  ]);

  return {
    showModal,
    endTime,
    warningTime: Math.min(warningTime, timeout * 0.2),
    handleLogout,
  };
}
