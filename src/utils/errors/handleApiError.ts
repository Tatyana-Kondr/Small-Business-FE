import { showErrorToast } from "../toast";
import { errorMap } from "./errorMap";

const DEFAULT_ERROR_MESSAGE = "Ein unbekannter Fehler ist aufgetreten.";

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  const err =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : null;

  const status = typeof err?.status === "number" ? err.status : undefined;

  const message = typeof err?.message === "string" ? err.message.trim() : "";

  // 1. Известные сообщения Backend
  if (message && errorMap[message]) {
    return errorMap[message];
  }

  // 2. Ошибки соединения
  if (
    error instanceof TypeError ||
    /failed to fetch|networkerror|network error/i.test(message)
  ) {
    return "Die Verbindung zum Server konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Verbindung.";
  }

  // 3. Авторизация и права доступа
  if (status === 401) {
    return "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.";
  }

  if (status === 403) {
    return "Sie haben keine Berechtigung, diese Aktion auszuführen.";
  }

  // 4. Специальные HTTP-ошибки
  if (status === 404) {
    return "Der angeforderte Eintrag wurde nicht gefunden.";
  }

  if (status === 409) {
    return "Der Vorgang konnte aufgrund eines Konflikts nicht abgeschlossen werden.";
  }

  if (status !== undefined && status >= 500) {
    return "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
  }

  // 5. Ошибки валидации
  if (status === 400 || status === 422) {
    return "Bitte überprüfen Sie Ihre Eingaben.";
  }

  // 6. Уже локализованные ошибки
  if (message && /[äöüß]|^(Die |Der |Das |Bitte |Ein |Eine )/.test(message)) {
    return message;
  }

  // 7. Неизвестная ошибка
  return fallbackMessage;
}

export function handleApiError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): void {
  const message = getApiErrorMessage(error, fallbackMessage);

  console.error("API Fehler:", error);

  showErrorToast("Fehler", message);
}
