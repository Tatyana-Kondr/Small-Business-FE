import { NavigateFunction } from "react-router-dom";
import { HttpError } from "./handleFetchError";
import { store } from "../redux/store";
import { logout, refresh } from "../features/auth/authSlice";
import { ACCESS_TOKEN_KEY } from "./token";

let _navigate: NavigateFunction | null = null;

// Функция для установки navigate из App
export const setNavigate = (nav: NavigateFunction) => {
  _navigate = nav;
};

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean; // использовать ли accessToken
}

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
  fallbackMessage = "Ein unbekannter Fehler ist aufgetreten."
): Promise<T> {
  const headers = new Headers(options.headers);

  // Если нужен токен
  if (options.auth) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // JSON по умолчанию
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const doFetch = async () => {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // чтобы refreshToken кука ушла
    });

    let responseData: any = {};
    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : {};
    } catch {
      responseData = { message: text };
    }

    if (!response.ok) {
      throw new HttpError(responseData?.message || fallbackMessage, response.status);
    }

    if (response.status === 204) return undefined as unknown as T;
    return responseData as T;
  };

  try {
    return await doFetch();
  } catch (err: any) {
    // проверка на 401/403
    if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
      // не рефрешим сам /login и /refresh
      if (url.endsWith("/login") || url.endsWith("/refresh")) {
        throw err;
      }

      try {
        // если уже идёт рефреш → ждём его
        if (isRefreshing && refreshPromise) {
          await refreshPromise;
        } else {
          isRefreshing = true;
          refreshPromise = store.dispatch(refresh()).unwrap();
          await refreshPromise;
        }

        // после успешного refresh пробуем запрос снова
        const retryHeaders = new Headers(options.headers);
        const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (newToken && options.auth) {
          retryHeaders.set("Authorization", `Bearer ${newToken}`);
        }

        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        });

        if (!retryResponse.ok) {
          throw new HttpError("Retry failed", retryResponse.status);
        }

        const retryText = await retryResponse.text();
        return retryText ? JSON.parse(retryText) : ({} as T);
      } catch (refreshErr) {
        // если refresh тоже упал → logout
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        store.dispatch(logout());
        if (_navigate) _navigate("/login", { replace: true });
        throw refreshErr;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    throw err;
  }
}
