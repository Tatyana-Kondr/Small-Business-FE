
import { HttpError } from "./handleFetchError";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      message: error.message,
      data: error.data,
    };
  }

  if (error instanceof TypeError) {
    return {
      message:
        "Die Verbindung zum Server konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Verbindung.",
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Ein unbekannter Fehler ist aufgetreten.",
  };
}
