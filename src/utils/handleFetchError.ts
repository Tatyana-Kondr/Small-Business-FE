export async function handleFetchError(response: Response, defaultMessage: string): Promise<never> {
  let message = defaultMessage;

  try {
    const errorData = await response.json();
    if (errorData?.message) {
      message = errorData.message;
    }
  } catch (e) {
    // тело не JSON — возможно пустой ответ (например, 401 или 204)
  }

  switch (response.status) {
    case 400:
      message = "Unkorrekte Anfrage";
      break;
    case 401:
      message = "Falscher Login oder falsches Passwort";
      break;
    case 403:
      message = "Falscher Login oder falsches Passwort";
      break;
    case 404:
      message = "Ressource nicht gefunden";
      break;
    case 500:
      message = "Serverfehler. Versuchen Sie es später erneut.";
      break;
  }

  throw new Error(message);
}
