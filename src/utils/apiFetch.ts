import { NavigateFunction } from "react-router-dom";
import { handleApiError } from "./handleApiError";
import { HttpError } from "./handleFetchError";
import { store } from "../redux/store";
import { logout } from "../features/auth/authSlice";

let navigate: NavigateFunction | null = null;

// Функция для установки navigate из App
export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean; // использовать ли accessToken
}

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
  fallbackMessage = "Ein unbekannter Fehler ist aufgetreten."
): Promise<T> {
  try {
    const headers = new Headers(options.headers);

    // Если auth=true, добавляем токен
    if (options.auth) {
      const token = localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    // Всегда ставим JSON, если не FormData
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    console.log("apiFetch →", url, options);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // для refreshToken cookie
    });

     // читаем тело ответа (json или текст)
    let responseData: any = {};
    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : {};
    } catch {
      responseData = { message: text };
    }

    // logout для 401/403 (кроме login)
    if ((response.status === 401 || response.status === 403) && !url.endsWith("/login")) {
      localStorage.removeItem("accessToken");
      store.dispatch(logout());
      if (navigate) navigate("/login", { replace: true });
    }

    if (!response.ok) {
      const message = responseData?.message || fallbackMessage;
      throw new HttpError(message, response.status);
    }

    if (response.status === 204) return undefined as unknown as T;

    return responseData as T;
  } catch (err) {
    if (err instanceof HttpError) {
      handleApiError(err);
    } else {
      handleApiError(err, "Unbekannter Fehler beim Abrufen der API.");
    }
    throw err;
  }
}