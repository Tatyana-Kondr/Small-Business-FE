import { handleFetchError } from "./handleFetchError";

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
  defaultErrorMessage: string = "Unbekannter Fehler"
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    await handleFetchError(response, defaultErrorMessage);
  }

  // Без содержимого (204) — ничего не парсим
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
