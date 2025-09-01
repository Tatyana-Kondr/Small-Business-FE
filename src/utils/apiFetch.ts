import { logout, refresh } from "../features/auth/authSlice";
import { resetAutoLogoutTimer } from "../hooks/useAutoLogout";
import { store } from "../redux/store";
import { handleFetchError } from "./handleFetchError";
import { getToken, removeToken } from "./token";

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
  defaultErrorMessage: string = "Unbekannter Fehler",
  retry: boolean = false
): Promise<T> {
  let token = getToken();

  const makeRequest = async () =>
    fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });

  let response = await makeRequest();

  // Успешный ответ
  if (response.ok) {
   resetAutoLogoutTimer(); // сброс таймера при успешном запросе
    if (response.status === 204) return {} as T;
    return response.json() as Promise<T>;
  }

  // Если 401 или 403 и мы ещё не пробовали refresh
  if ((response.status === 401 || response.status === 403) && !retry) {
    try {
      // диспатчим refresh через Redux
      await store.dispatch(refresh()).unwrap();
      token = getToken();
      response = await makeRequest(); // повторяем запрос
      if (response.ok) {
        resetAutoLogoutTimer();
        if (response.status === 204) return {} as T;
        return response.json() as Promise<T>;
      }
    } catch (e) {
      // Refresh не сработал → чистим токен
      store.dispatch(logout());
      removeToken();
      throw new Error("Session expired");
    }
  }

  // Любая другая ошибка
  await handleFetchError(response, defaultErrorMessage);
  throw new Error(defaultErrorMessage);
}