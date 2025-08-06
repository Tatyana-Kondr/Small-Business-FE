export async function handleFetchError(response: Response, defaultMessage: string): Promise<never> {
  let message: string | undefined;

  try {
    const errorData = await response.json();
    if (typeof errorData === "string") {
      message = errorData;
    } else if (errorData?.message) {
      message = errorData.message;
    }
  } catch {
    // тело не JSON — возможно пустой ответ (например, 401 или 204)
  }

  // если не получили message от сервера, подставляем дефолт
  if (!message) {
    switch (response.status) {
      case 400:
        message = "Unkorrekte Anfrage";
        break;
      case 401:
      case 403:
        message = "Falscher Login oder Passwort";
        break;
      case 404:
        message = "Ressource nicht gefunden";
        break;
      case 409:
        message = "Konflikt beim Verarbeiten der Anfrage";
        break;
      case 500:
        message = "Serverfehler. Versuchen Sie es später erneut.";
        break;
      default:
        message = defaultMessage;
    }
  }

  throw new Error(message);
}
