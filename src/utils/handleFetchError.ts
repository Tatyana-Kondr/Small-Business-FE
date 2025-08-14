export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function handleFetchError(response: Response, defaultMessage: string): Promise<never> {
  let message: string = defaultMessage;

  try {
    const errorData = await response.json();
    if (typeof errorData === "string") {
      message = errorData;
    } else if (errorData?.message) {
      message = errorData.message;
    }
  } catch {
    // тело не JSON — возможно пустой ответ
  }

  if (!message || message === defaultMessage) {
    switch (response.status) {
      case 400:
        message = "Ungültige Anfrage.";
        break;
      case 401:
      case 403:
        message = "Nicht autorisiert.";
        break;
      case 404:
        message = "Ressource wurde nicht gefunden.";
        break;
      case 409:
        message = "Konflikt beim Verarbeiten der Anfrage.";
        break;
      case 500:
        message = "Interner Serverfehler. Versuchen Sie es später erneut.";
        break;
    }
  }

  throw new HttpError(message, response.status);
}