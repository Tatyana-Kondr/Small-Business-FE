import { HttpError } from "../../utils/errors/handleFetchError";
import { fetchRefreshToken } from "./api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

let refreshPromise: Promise<string> | null = null;
let refreshPromiseVersion: number | null = null;
let sessionVersion = 0;

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function hasRefreshToken(): boolean {
  return Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));
}

export function getSessionVersion(): number {
  return sessionVersion;
}

export function isSessionCurrent(version: number): boolean {
  return version === sessionVersion;
}

export function isSessionTokenCurrent(
  version: number,
  token: string | null,
): boolean {
  return (
    isSessionCurrent(version) && token !== null && getAccessToken() === token
  );
}

// Создание новой сессии после login
export function saveSession(accessToken: string, refreshToken: string): void {
  sessionVersion++;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Завершение сессии
export function clearSessionTokens(): void {
  sessionVersion++;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Обновление токенов без создания новой сессии
export async function refreshSession(): Promise<string> {
  const version = sessionVersion;

  if (refreshPromise && refreshPromiseVersion === version) {
    return refreshPromise;
  }

  const promise = (async () => {
    const response = await fetchRefreshToken();

    if (!isSessionCurrent(version)) {
      throw new HttpError("Die Sitzung wurde beendet.", 401);
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);

    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    return response.accessToken;
  })();

  refreshPromise = promise;
  refreshPromiseVersion = version;

  try {
    return await promise;
  } finally {
    if (refreshPromise === promise) {
      refreshPromise = null;
      refreshPromiseVersion = null;
    }
  }
}
