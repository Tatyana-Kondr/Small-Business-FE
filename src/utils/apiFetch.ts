import type { NavigateFunction } from "react-router-dom";
import { HttpError } from "./errors/handleFetchError";

import {
  clearSessionTokens,
  getAccessToken,
  getSessionVersion,
  hasRefreshToken,
  isSessionCurrent,
  refreshSession,
} from "../features/auth/session";

let _navigate: NavigateFunction | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  _navigate = nav;
};

let _dispatch: (() => void) | null = null;

export const setClearAuthHandler = (handler: () => void) => {
  _dispatch = handler;
};

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

type ValidationErrorResponse = {
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

// Чтение ответа сервера
const parseResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

// Сообщение об ошибке backend
const getResponseErrorMessage = (
  responseData: unknown,
  fallbackMessage: string,
): string => {
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData &&
    typeof responseData.message === "string" &&
    responseData.message
  ) {
    return responseData.message;
  }

  const validationData = responseData as ValidationErrorResponse;

  if (Array.isArray(validationData?.errors)) {
    const validationMessage = validationData.errors.find(
      (error) =>
        typeof error?.message === "string" && error.message.trim().length > 0,
    )?.message;

    if (validationMessage) {
      return validationMessage;
    }
  }

  if (
    Array.isArray(validationData?.errors) &&
    validationData.errors.length > 0
  ) {
    const validationMessage = validationData.errors[0]?.message;

    if (validationMessage) {
      return validationMessage;
    }
  }

  return fallbackMessage;
};

// Локальное завершение сессии
const clearSession = () => {
  clearSessionTokens();

 _dispatch?.();

  _navigate?.("/login", { replace: true });
};

const sessionEndedError = () =>
  new HttpError("Die Sitzung wurde beendet.", 401);

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
  fallbackMessage = "Ein unbekannter Fehler ist aufgetreten.",
): Promise<T> {
  const { auth = false, headers: optionHeaders, ...fetchOptions } = options;

  // Состояние сессии в момент начала запроса
  const originalToken = auth ? getAccessToken() : null;

  const requestSessionVersion = getSessionVersion();

  // Проверка актуальности сессии
  const checkSession = () => {
    if (auth && !isSessionCurrent(requestSessionVersion)) {
      throw sessionEndedError();
    }
  };

  // Отправка HTTP-запроса
  const executeRequest = async (token: string | null): Promise<T> => {
    checkSession();

    const headers = new Headers(optionHeaders);

    if (auth) {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        headers.delete("Authorization");
      }
    }

    // FormData: Content-Type устанавливает браузер
    if (
      fetchOptions.body != null &&
      !headers.has("Content-Type") &&
      !(fetchOptions.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const responseData = await parseResponse(response);

    // Запрос мог завершиться после logout
    checkSession();

    if (!response.ok) {
      throw new HttpError(
        getResponseErrorMessage(responseData, fallbackMessage),
        response.status,
        responseData,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return responseData as T;
  };

  try {
    return await executeRequest(originalToken);
  } catch (error) {
    // Обрабатываем только HTTP-ошибки
    if (!(error instanceof HttpError)) {
      throw error;
    }

    // Refresh только для защищённых запросов с 401
    if (
      error.status !== 401 ||
      !auth ||
      url.endsWith("/login") ||
      url.endsWith("/refresh")
    ) {
      throw error;
    }

    // Не обновляем токен старой сессии
    checkSession();

    // Если refresh token отсутствует
    if (!hasRefreshToken()) {
      clearSession();
      throw sessionEndedError();
    }

    const currentToken = getAccessToken();

    // Другой запрос уже обновил access token
    if (originalToken && currentToken && originalToken !== currentToken) {
      checkSession();
      return executeRequest(currentToken);
    }

    const originalRefreshToken = localStorage.getItem("refreshToken");

    let newToken: string;

    try {
      // Один общий refresh для параллельных запросов
      newToken = await refreshSession();
    } catch (refreshError) {
      const currentRefreshToken = localStorage.getItem("refreshToken");

      // Очищаем только актуальную сессию
      if (
        isSessionCurrent(requestSessionVersion) &&
        originalRefreshToken === currentRefreshToken
      ) {
        clearSession();
      }

      throw refreshError;
    }

    // Проверяем, что пользователь не вышел
    // во время обновления токена
    checkSession();

    if (getAccessToken() !== newToken) {
      throw sessionEndedError();
    }

    // Повторяем исходный запрос один раз.
    // Повторный 401 передаётся вызывающему коду.
    return executeRequest(newToken);
  }
}
